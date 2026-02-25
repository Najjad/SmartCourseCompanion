import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar" style={navStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <h2 style={{ margin: 0, cursor: "pointer" }} onClick={() => navigate("/")}>
          Smart Course Companion
        </h2>
        {user && (
          <span style={roleBadgeStyle}>
            {user.role.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        {!user && (
          <>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
            <Link to="/register" style={linkStyle}>
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            <Link to="/edit-account" style={buttonStyle}>
              Edit Account
            </Link>
            <button onClick={handleLogout} style={buttonStyle}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// Inline styles for simplicity
const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 2rem",
  background: "linear-gradient(90deg, #4f46e5, #3b82f6)",
  color: "white",
  boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
  position: "sticky",
  top: 0,
  zIndex: 1000,
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: 500,
  transition: "transform 0.2s, color 0.2s",
};

const buttonStyle = {
  background: "white",
  color: "#3b82f6",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: 6,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const roleBadgeStyle = {
  padding: "0.25rem 0.6rem",
  borderRadius: 6,
  background: "#fbbf24",
  color: "#111827",
  fontWeight: 600,
  fontSize: 12,
};

