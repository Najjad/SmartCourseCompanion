import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchUserCourses } from "../api/users";

export default function AssessmentsSelectorPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError(err.message || "Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [user?.userId]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Select Course</h1>
      <p>Choose a course to view its assessments.</p>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div>Loading courses...</div>
      ) : courses.length === 0 ? (
        <div>No courses found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() =>
                navigate(`/assessments/${course.id}`)
              }
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 16,
                cursor: "pointer",
              }}
            >
              <strong>{course.code}</strong>
              <div>{course.name}</div>
              <div style={{ color: "#666", marginTop: 6 }}>
                {course.term}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}