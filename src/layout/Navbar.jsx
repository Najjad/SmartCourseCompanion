import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>Flight Toolkit</h2>

      {user ? (
        <div>
          <span>{user.role.toUpperCase()}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;