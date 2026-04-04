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
  <div className="student-page account-page">
    <div className="page-header">
      <div>
        <p className="eyebrow">Account Settings</p>
        <h1 className="page-title">Manage Your Account</h1>
        <p className="page-subtitle">
          Update your email, change your password, or delete your account.
        </p>
      </div>
    </div>

    {success ? (
      <div className="alert-box success-alert">{success}</div>
    ) : null}

    {error ? (
      <div className="alert-box error-alert">{error}</div>
    ) : null}

    <section className="dashboard-two-column">

      {/* CHANGE EMAIL CARD */}
      <div className="card">
        <div className="section-heading">
          <div>
            <h2>Change Email</h2>
            <p>Update the email associated with your account.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateEmail}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
          >
            Update Email
          </button>
        </form>
      </div>

      {/* CHANGE PASSWORD CARD */}
      <div className="card">
        <div className="section-heading">
          <div>
            <h2>Change Password</h2>
            <p>Use a strong password you haven't used before.</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* DELETE ACCOUNT CARD */}
      <div className="card">
        <div className="section-heading">
          <div>
            <h2>Delete Account</h2>
            <p className="summary-helper">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <button
          onClick={handleDeleteAccount}
          className="btn-danger"
        >
          Delete Account
        </button>
      </div>

    </section>
  </div>
);
}