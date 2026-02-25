import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Sidebar() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
  <aside className="sidebar">
  <Link to="/dashboard">Dashboard</Link>
  <br />

  <Link to="/assessments">Assessments</Link>
  <br />

  {user.role === "admin" && <p>Admin Panel</p>}
  {user.role === "student" && <p>Student Tools</p>}
</aside>
  );
}

export default Sidebar;