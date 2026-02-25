import { useState } from "react";
import CategoryBuilder from "../components/CategoryBuilder";

function CreateCourse() {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [term, setTerm] = useState("");
  const [categories, setCategories] = useState([]);

  const saveCourse = () => {
    const totalWeight = categories.reduce(
      (sum, cat) => sum + cat.weight,
      0
    );

    if (totalWeight !== 100) {
      alert("Weights must equal 100%");
      return;
    }

    alert("Course Created (Frontend Only)");
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