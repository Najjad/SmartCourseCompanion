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

    {user.role === "admin" && (
      <>
        <p><strong>Admin Panel</strong></p>

        <Link to="/admin">Admin Dashboard</Link>
        <br />

        <Link to="/admin/create-course">Create Course</Link>
        <br />

        <Link to="/admin/templates">Templates</Link>
        <br />

        <Link to="/admin/stats">Usage Stats</Link>
        <br />
      </>
    )}

    {user.role === "student" && <p>Student Tools</p>}
  </aside>
);
}

export default Sidebar;