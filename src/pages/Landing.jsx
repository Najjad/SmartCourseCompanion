import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="center-page">
      <h1>Smart Course Companion</h1>
      <p>All your course needs in one place.</p>

      <div className="button-group">
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}

export default Landing;