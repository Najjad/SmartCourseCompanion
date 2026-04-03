import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchUserByEmail } from "../api/users";

export default function Account() {
  const { user, updateUserEmail, updateUserPassword, deleteUserAccount } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchUserByEmail(user.email)
      .then((data) => {
        setCurrentUser(data);
        setNewEmail(data.email);
      })
      .catch((err) => setError(err.message || "Failed to fetch user"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <p>Please log in to view your account.</p>;
  if (loading) return <p>Loading account...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    try {
      const updated = await updateUserEmail(newEmail);
      setCurrentUser(updated);
      setSuccess("Email updated successfully!");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update email");
      setSuccess("");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await updateUserPassword(currentPassword, newPassword);
      setSuccess("Password updated successfully!");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Failed to update password");
      setSuccess("");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
      await deleteUserAccount();
      // After deletion, user context is cleared, so component will show login prompt
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setSuccess("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Account</h2>
      <p>View and manage your account details below.</p>

      <p><strong>Role:</strong> {currentUser.role}</p>

      <form onSubmit={handleUpdateEmail} style={{ marginBottom: "20px" }}>
        <label>
          <strong>Email:</strong>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required style={{ marginLeft: "10px" }} />
        </label>
        <button type="submit" style={{ marginLeft: "10px" }}>Update Email</button>
      </form>

      <form onSubmit={handleUpdatePassword} style={{ marginBottom: "20px" }}>
        <label>
          <strong>Current Password:</strong>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={{ marginLeft: "10px" }} />
        </label>
        <br />
        <label>
          <strong>New Password:</strong>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ marginLeft: "10px" }} />
        </label>
        <br />
        <button type="submit" style={{ marginTop: "10px" }}>Update Password</button>
      </form>

      <button onClick={handleDeleteAccount} style={{ color: "white", backgroundColor: "red", padding: "8px 16px", border: "none", cursor: "pointer" }}>
        Delete Account
      </button>

      {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}