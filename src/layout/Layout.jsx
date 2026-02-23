import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;