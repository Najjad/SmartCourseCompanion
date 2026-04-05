import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryBuilder from "../components/CategoryBuilder";
import { createUserCourse } from "../api/users";
import { AuthContext } from "../context/AuthContext";

function CreateCourse() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [instructor, setInstructor] = useState("");
  const [term, setTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const totalWeight = useMemo(
    () => categories.reduce((sum, category) => sum + Number(category.weight || 0), 0),
    [categories]
  );

  const saveCourse = async () => {
    if (!user?.userId) {
      setError("Please log in before creating a course.");
      return;
    }

    if (user.role !== "admin") {
      setError("Only admins can create courses from this page.");
      return;
    }

    if (!courseCode.trim() || !courseName.trim() || !instructor.trim() || !term.trim()) {
      setError("Course code, name, instructor, and term are required.");
      return;
    }

    if (categories.length === 0) {
      setError("Add at least one assessment category.");
      return;
    }

    if (totalWeight !== 100) {
      setError("Weights must equal 100%.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await createUserCourse(user.userId, {
        code: courseCode,
        name: courseName,
        instructor,
        term,
        categories,
      });

      setSuccessMessage(`${courseCode.toUpperCase()} was created successfully.`);
      setCourseCode("");
      setCourseName("");
      setInstructor("");
      setTerm("");
      setCategories([]);

      window.setTimeout(() => {
        navigate("/admin");
      }, 700);
    } catch (err) {
      setError(err.message || "Unable to create course");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="card">Please log in to create a course.</div>;
  }

  if (user.role !== "admin") {
    return <div className="card">Only admins can create courses.</div>;
  }

  return (
    <div className="student-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Authoring</p>
          <h1 className="page-title">Create Course</h1>
          <p className="page-subtitle">
            Build a course record with a real code, a real term, and assessment categories that add up cleanly.
          </p>
        </div>
      </div>

      {successMessage ? <div className="alert-box success-alert">{successMessage}</div> : null}
      {error ? <div className="alert-box error-alert">{error}</div> : null}

      <section className="detail-grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Course Details</h2>
              <p>These values will be saved directly to your admin account.</p>
            </div>
          </div>

          <div className="template-form-grid">
            <label className="field-label" htmlFor="course-code">
              Course code
            </label>
            <input
              id="course-code"
              className="input-field"
              placeholder="SOEN287"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
            />

            <label className="field-label" htmlFor="course-name">
              Course name
            </label>
            <input
              id="course-name"
              className="input-field"
              placeholder="Web Programming"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />

            <label className="field-label" htmlFor="course-instructor">
              Instructor
            </label>
            <input
              id="course-instructor"
              className="input-field"
              placeholder="Dr. Margaret Kwan"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />

            <label className="field-label" htmlFor="course-term">
              Term
            </label>
            <input
              id="course-term"
              className="input-field"
              placeholder="Fall 2026"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Assessment Structure</h2>
              <p>Add categories and make sure their weights total 100%.</p>
            </div>
          </div>

          <CategoryBuilder categories={categories} setCategories={setCategories} />

          <div className="template-summary-row">
            <span>Current total weight: {totalWeight}%</span>
            <button type="button" className="btn-primary" onClick={saveCourse} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Course"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CreateCourse;
