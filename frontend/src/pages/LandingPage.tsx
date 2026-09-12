import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <Link to="/" className="logo">
          <span>◈</span> DeepGuard
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/login">Login</Link>
          <Link to="/register" className="nav-button">
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              AI-POWERED DEEPFAKE DETECTION
            </div>

            <h1>
              Detect Fake Content.
              <span> Protect the Truth.</span>
            </h1>

            <p>
              DeepGuard uses artificial intelligence to analyze images,
              videos, and digital content to help identify deepfakes and
              manipulated media.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Start Detecting →
              </Link>

              <Link to="/login" className="secondary-button">
                Explore Dashboard
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>AI</strong>
                <small>Powered Analysis</small>
              </div>

              <div>
                <strong>24/7</strong>
                <small>Always Available</small>
              </div>

              <div>
                <strong>Fast</strong>
                <small>Detection Results</small>
              </div>
            </div>
          </div>

          <div className="scan-card">
            <div className="scan-card-header">
              <span className="status-dot"></span>
              DeepGuard AI Scanner
            </div>

            <div className="scan-visual">
              <div className="scan-circle">
                <span>AI</span>
              </div>

              <div className="scan-line"></div>
            </div>

            <div className="scan-info">
              <span>System Status</span>
              <strong>Ready to Analyze</strong>
            </div>

            <div className="scan-progress">
              <span></span>
            </div>

            <p className="scan-message">
              Upload your media and let DeepGuard inspect it.
            </p>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <p>POWERFUL FEATURES</p>
            <h2>Security powered by intelligence</h2>
            <span>
              Everything you need to detect suspicious and manipulated
              digital content.
            </span>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">◉</div>
              <h3>AI Detection</h3>
              <p>
                Analyze digital media using intelligent deepfake detection
                technology.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⌁</div>
              <h3>Fast Analysis</h3>
              <p>
                Get clear analysis results quickly through a simple and
                user-friendly interface.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">▣</div>
              <h3>Detailed Reports</h3>
              <p>
                View detection results and understand whether content may
                be manipulated.
              </p>
            </div>
          </div>
        </section>

        <section className="steps-section" id="how-it-works">
          <div className="section-heading">
            <p>HOW IT WORKS</p>
            <h2>Detect suspicious content in three steps</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span>01</span>
              <h3>Create an account</h3>
              <p>Register with your email and create your secure account.</p>
            </div>

            <div className="step-card">
              <span>02</span>
              <h3>Upload your media</h3>
              <p>Upload an image or video that you want to analyze.</p>
            </div>

            <div className="step-card">
              <span>03</span>
              <h3>View the result</h3>
              <p>Check the AI analysis and view your detection report.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to protect digital truth?</h2>
          <p>Start using DeepGuard today.</p>
          <Link to="/register" className="primary-button">
            Create Free Account →
          </Link>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>◈ DeepGuard</strong>
          <p>AI-powered deepfake detection platform.</p>
        </div>

        <p>© 2026 DeepGuard. All rights reserved.</p>
      </footer>
    </div>
  );
}
