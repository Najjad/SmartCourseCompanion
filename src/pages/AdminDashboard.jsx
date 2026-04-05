import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchUserCourses, updateUserCourse } from "../api/users";

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        if (!user?.userId) return;

        const res = await fetchUserCourses(user.userId);
        setCourses(res.courses || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadCourses();
  }, [user]);

  const toggleCourse = async (courseId, currentEnabled) => {
    try {
      await updateUserCourse(user.userId, courseId, {
        enabled: !currentEnabled,
      });

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? { ...course, enabled: !currentEnabled }
            : course
        )
      );
    } catch (err) {
      alert("Failed to update course");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {courses.map((course) => (
        <div
          key={course.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>{course.code} - {course.name}</h3>
          <p>Status: {course.enabled ? "Enabled" : "Disabled"}</p>
          <button onClick={() => toggleCourse(course.id, course.enabled)}>
            {course.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;