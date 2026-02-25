import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Layout from "./layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import AssessmentsPage from "./pages/AssessmentsPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateCourse from "./pages/CreateCourse";
import Templates from "./pages/Templates";
import UsageStats from "./pages/UsageStats";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-course" element={<CreateCourse />} />
            <Route path="/admin/templates" element={<Templates />} />
            <Route path="/admin/stats" element={<UsageStats />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;