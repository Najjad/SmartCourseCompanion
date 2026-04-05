import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchUserCourses, updateUserCourse } from "../api/users";

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      if (!user?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const response = await fetchUserCourses(user.userId);
        setCourses(response.courses || []);
      } catch (err) {
        setError(err.message || "Unable to load admin courses");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [user?.userId]);

  const toggleCourse = async (course) => {
    try {
      setError("");
      await updateUserCourse(user.userId, course.id, {
        code: course.code,
        name: course.name,
        instructor: course.instructor,
        term: course.term,
        enabled: !course.enabled,
      });

      setCourses((current) =>
        current.map((entry) =>
          entry.id === course.id ? { ...entry, enabled: !entry.enabled } : entry
        )
      );
      setSuccessMessage(`${course.code} is now ${course.enabled ? "disabled" : "enabled"}.`);
    } catch (err) {
      setError(err.message || "Unable to update course status");
    }
  };

  if (!user) {
    return <div className="card">Please log in to view the admin dashboard.</div>;
  }

  if (user.role !== "admin") {
    return <div className="card">Only admins can view this page.</div>;
  }

  return (
    <div className="student-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Control Center</p>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Review the courses on your admin account and control whether each one is enabled.
          </p>
        </div>
        <Link to="/admin/create-course" className="btn-primary">
          Create Course
        </Link>
      </div>

      {successMessage ? <div className="alert-box success-alert">{successMessage}</div> : null}
      {error ? <div className="alert-box error-alert">{error}</div> : null}

      <section className="stats-grid">
        <StatCard title="Courses Managed" value={courses.length} helper="Courses currently stored on your admin account." />
        <StatCard
          title="Enabled Courses"
          value={courses.filter((course) => course.enabled !== false).length}
          helper="These courses are currently active."
        />
        <StatCard
          title="Disabled Courses"
          value={courses.filter((course) => course.enabled === false).length}
          helper="These courses are currently hidden or paused."
        />
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Managed Courses</h2>
            <p>Every new admin starts empty until they create their own courses.</p>
          </div>
        </div>

        {isLoading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>No courses yet.</p>
            <p className="summary-helper">
              Use the create course page to add your first course structure.
            </p>
            <Link to="/admin/create-course" className="btn-primary">
              Create First Course
            </Link>
          </div>
        ) : (
          <div className="template-list">
            {courses.map((course) => (
              <article key={course.id} className="template-card">
                <div className="template-card-header">
                  <div>
                    <p className="course-code">{course.code}</p>
                    <h3 className="course-name">{course.name}</h3>
                    <p className="item-meta">
                      {course.term || "No term"} {course.instructor ? `• ${course.instructor}` : ""}
                    </p>
                  </div>
                  <span className={`status-chip ${course.enabled === false ? "overdue" : "completed"}`}>
                    {course.enabled === false ? "Disabled" : "Enabled"}
                  </span>
                </div>

                <div className="template-category-list">
                  {(course.categories || []).length > 0 ? (
                    course.categories.map((category) => (
                      <div key={category.id || category.name} className="template-category-row">
                        <span>{category.name}</span>
                        <strong>{category.weight}%</strong>
                      </div>
                    ))
                  ) : (
                    <div className="template-category-row">
                      <span>No assessment categories saved.</span>
                      <strong>0%</strong>
                    </div>
                  )}
                </div>

                <div className="template-summary-row">
                  <span className="summary-helper">
                    {(course.categories || []).length} categories • {(course.assessments || []).length} assessments
                  </span>
                  <button
                    type="button"
                    className={course.enabled === false ? "btn-primary" : "btn-secondary"}
                    onClick={() => toggleCourse(course)}
                  >
                    {course.enabled === false ? "Enable Course" : "Disable Course"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, helper }) {
  return (
    <article className="summary-card">
      <p className="summary-label">{title}</p>
      <div className="summary-value">{value}</div>
      <p className="summary-helper">{helper}</p>
    </article>
  );
}

export default AdminDashboard;
