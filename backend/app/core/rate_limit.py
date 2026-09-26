import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class SlidingWindowRateLimiter:
    def __init__(self):
        # ip -> list of timestamps
        self._auth_requests: Dict[str, List[float]] = defaultdict(list)
        self._analysis_requests: Dict[str, List[float]] = defaultdict(list)
        self._general_requests: Dict[str, List[float]] = defaultdict(list)
        self._last_cleanup = time.time()

    def _cleanup(self, now: float):
        if now - self._last_cleanup < 60:
            return
        self._last_cleanup = now
        cutoff = now - 60
        for req_map in (self._auth_requests, self._analysis_requests, self._general_requests):
            for ip in list(req_map.keys()):
                req_map[ip] = [ts for ts in req_map[ip] if ts > cutoff]
                if not req_map[ip]:
                    del req_map[ip]

    def check_rate_limit(self, ip: str, path: str) -> Tuple[bool, int, int]:
        """
        Returns (is_allowed, limit, remaining)
        """
        now = time.time()
        self._cleanup(now)
        cutoff = now - 60

        # Determine limit based on endpoint category
        if "/api/auth" in path:
            limit = 40  # 40 requests per minute for auth
            bucket = self._auth_requests[ip]
        elif "/api/analysis/upload" in path or "/run" in path:
            limit = 60  # 60 uploads/analyses per minute
            bucket = self._analysis_requests[ip]
        elif path.startswith("/api"):
            limit = 300  # 300 general API requests per minute
            bucket = self._general_requests[ip]
        else:
            return True, 1000, 1000  # Unlimited for static/docs

        # Clean timestamps older than 60 seconds
        bucket = [ts for ts in bucket if ts > cutoff]

        if len(bucket) >= limit:
            return False, limit, 0

        bucket.append(now)
        if "/api/auth" in path:
            self._auth_requests[ip] = bucket
        elif "/api/analysis/upload" in path or "/run" in path:
            self._analysis_requests[ip] = bucket
        else:
            self._general_requests[ip] = bucket

        remaining = max(0, limit - len(bucket))
        return True, limit, remaining


rate_limiter = SlidingWindowRateLimiter()


class SecurityAndRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Resolve client IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        elif request.client:
            client_ip = request.client.host
        else:
            client_ip = "127.0.0.1"

        path = request.url.path

        # 2. Check rate limit
        allowed, limit, remaining = rate_limiter.check_rate_limit(client_ip, path)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please slow down and try again in a minute."
                },
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                },
            )

        # 3. Process request
        response: Response = await call_next(request)

        # 4. Inject Enterprise Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response
