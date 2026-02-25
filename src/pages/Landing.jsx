import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
  return (
    <div className="landing-wrapper">

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart Course Companion
          </h1>
          <p className="hero-subtitle">
            A complete academic management system for students and instructors.
            Track courses, monitor grades, manage assessments, and visualize your progress. 
            
            All in one intelligent dashboard.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              Get Started
            </Link>
            <Link to="/login" className="secondary-btn">
              Login
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card">📊 Real-Time Averages</div>
          <div className="floating-card">📅 Upcoming Deadlines</div>
          <div className="floating-card">📈 Progress Tracking</div>
        </div>
      </section>

      <section className="features">
        <h2>For Students</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Course Management</h3>
            <p>
              Add, edit, or delete courses with full details including instructor,
              term, and structure.
            </p>
          </div>

          <div className="feature-card">
            <h3>Assessment Tracking</h3>
            <p>
              Manage assignments, labs, quizzes, and exams. Mark them as completed
              or pending.
            </p>
          </div>

          <div className="feature-card">
            <h3>Automatic Grade Calculation</h3>
            <p>
              Enter earned and total marks to instantly compute current course
              averages.
            </p>
          </div>

          <div className="feature-card">
            <h3>Unified Dashboard</h3>
            <p>
              View upcoming assessments across all courses in one centralized
              overview.
            </p>
          </div>

          <div className="feature-card">
            <h3>Visual Summaries</h3>
            <p>
              Progress bars, per-course averages, and performance trend charts
              help you monitor improvement.
            </p>
          </div>
        </div>
      </section>

      <section className="features alt-section">
        <h2>For Instructors / Admin</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Course Creation</h3>
            <p>
              Create and manage courses with structured assessment categories
              and weightings.
            </p>
          </div>

          <div className="feature-card">
            <h3>Reusable Course Structures</h3>
            <p>
              Define standardized course templates students can adopt.
            </p>
          </div>

          <div className="feature-card">
            <h3>Usage Analytics</h3>
            <p>
              View anonymized statistics such as assessment completion
              percentages to monitor student engagement.
            </p>
          </div>

          <div className="feature-card">
            <h3>Course Controls</h3>
            <p>
              Enable or disable courses as needed to manage active terms.
            </p>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <h2>Take Control of Your Academic Progress</h2>
        <div className="hero-buttons">
          <Link to="/register" className="primary-btn large">
            Create Account
          </Link>
          <Link to="/login" className="secondary-btn large">
            Login
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Landing;