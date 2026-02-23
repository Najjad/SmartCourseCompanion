import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    register({ role, email, password });
    navigate("/dashboard");
  };

  return (
    <div className="center-page">
      <h2>Register</h2>

      <form onSubmit={handleSubmit} className="form">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;