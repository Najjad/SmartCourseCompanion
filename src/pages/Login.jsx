import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    const success = login(email, password);
    if (!success) {
      setError("Invalid credentials");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="center-page">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>
      </form>

      <p>Test accounts:</p>
      <p>student@test.com / 1234</p>
      <p>admin@test.com / 1234</p>
    </div>
  );
}

export default Login;