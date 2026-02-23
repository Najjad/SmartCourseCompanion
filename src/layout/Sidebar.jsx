import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <aside className="sidebar">
      <p>Dashboard</p>
      {user.role === "admin" && <p>Admin Panel</p>}
      {user.role === "student" && <p>Student Tools</p>}
    </aside>
  );
}

export default Sidebar;