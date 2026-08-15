export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type MediaType = 'image' | 'video' | 'audio';
export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type DetectionResult = 'AUTHENTIC' | 'LIKELY_DEEPFAKE' | 'SUSPICIOUS';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Indicator {
  id?: number;
  name: string;
  category?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  description: string;
  metric_value?: string;
}

export interface AnalysisFrame {
  id?: number;
  timestamp: number;
  timestamp_str?: string;
  frame_number?: number;
  score: number;
  anomaly_label?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  thumbnail_path?: string;
}

export interface ModelInfo {
  name: string;
  version: string;
  mode: string;
}

export interface AnalysisDetail {
  id: string;
  user_id: number;
  filename: string;
  original_filename: string;
  media_type: MediaType;
  file_size: number;
  file_hash: string;
  status: AnalysisStatus;
  result?: DetectionResult;
  confidence?: number;
  authenticity_score?: number;
  risk_level?: RiskLevel;
  model?: ModelInfo;
  processing_time?: number;
  explanation_summary?: string;
  metadata?: Record<string, any>;
  heatmap_url?: string;
  created_at: string;
  completed_at?: string;
  indicators: Indicator[];
  frames: AnalysisFrame[];
}

export interface AnalysisListItem {
  id: string;
  original_filename: string;
  media_type: MediaType;
  file_size: number;
  status: AnalysisStatus;
  result?: DetectionResult;
  confidence?: number;
  risk_level?: RiskLevel;
  created_at: string;
  completed_at?: string;
}

export interface AnalysisListResponse {
  total: number;
  page: number;
  page_size: number;
  items: AnalysisListItem[];
}

export interface DashboardStats {
  total_analyses: number;
  authentic_count: number;
  deepfake_count: number;
  suspicious_count: number;
  average_confidence: number;
  recent_activity_count: number;
}

export interface TrendPoint {
  date: string;
  total: number;
  deepfake: number;
  authentic: number;
  suspicious: number;
}

export interface DistributionItem {
  name: string;
  value: number;
  percentage: number;
}

export interface DashboardTrends {
  trends: TrendPoint[];
  media_distribution: DistributionItem[];
  risk_distribution: DistributionItem[];
}

export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  analysis_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminAuditLogItem {
  id: number;
  user_id?: number | null;
  user_email?: string;
  action: string;
  analysis_id?: string | null;
  details?: string | null;
  ip_address?: string | null;
  timestamp: string;
}

export interface SystemHealth {
  status: string;
  database_connected: boolean;
  ai_engine_status: string;
  ai_engine_mode: string;
  storage_used_mb: number;
  total_uploads: number;
  timestamp: string;
}
