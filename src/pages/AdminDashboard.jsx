import { useState } from "react";

const initialCourses = [
  { id: 1, code: "SOEN287", name: "Web Programming", enabled: true },
  { id: 2, code: "COMP249", name: "Object Oriented Programming", enabled: true },
  { id: 3, code: "ENGR202", name: "Professional Practice", enabled: false },
];

function AdminDashboard() {
  const [courses, setCourses] = useState(initialCourses);

  const toggleCourse = (id) => {
    const updated = courses.map((course) =>
      course.id === id ? { ...course, enabled: !course.enabled } : course
    );
    setCourses(updated);
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
          <button onClick={() => toggleCourse(course.id)}>
            {course.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;