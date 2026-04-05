import { useState, useContext } from "react";
import CategoryBuilder from "../components/CategoryBuilder";
import { AuthContext } from "../context/AuthContext";
import { createUserCourse } from "../api/users";

function CreateCourse() {
  const { user } = useContext(AuthContext);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [term, setTerm] = useState("");
  const [categories, setCategories] = useState([]);

  const saveCourse = async () => {
    const totalWeight = categories.reduce(
      (sum, cat) => sum + cat.weight,
      0
    );

    if (totalWeight !== 100) {
      alert("Weights must equal 100%");
      return;
    }

    if (!user?.userId) {
      alert("You must be logged in");
      return;
    }

    try {
      await createUserCourse(user.userId, {
        code: courseCode,
        name: courseName,
        instructor: "TBA",
        term,
        categories,
      });

      alert("Course created successfully");

      setCourseCode("");
      setCourseName("");
      setTerm("");
      setCategories([]);
    } catch (err) {
      alert(err.message || "Failed to create course");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Course</h2>

      <input
        placeholder="Course Code"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
      />

      <input
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
      />

      <input
        placeholder="Term"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />

      <CategoryBuilder
        categories={categories}
        setCategories={setCategories}
      />

      <button onClick={saveCourse}>Save Course</button>
    </div>
  );
}

export default CreateCourse;