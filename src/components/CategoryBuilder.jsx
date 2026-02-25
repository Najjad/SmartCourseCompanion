import { useState } from "react";

function CategoryBuilder({ categories, setCategories }) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");

  const addCategory = () => {
    if (!name || !weight) return;

    const newCategory = {
      id: Date.now(),
      name,
      weight: Number(weight),
    };

    setCategories([...categories, newCategory]);
    setName("");
    setWeight("");
  };

  const totalWeight = categories.reduce(
    (sum, cat) => sum + cat.weight,
    0
  );

  return (
    <div>
      <h4>Add Assessment Category</h4>

      <input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Weight %"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <button onClick={addCategory}>Add</button>

      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            {cat.name} - {cat.weight}%
          </li>
        ))}
      </ul>

      <p>Total Weight: {totalWeight}%</p>
      {totalWeight !== 100 && (
        <p style={{ color: "red" }}>
          Total weight must equal 100%
        </p>
      )}
    </div>
  );
}

export default CategoryBuilder;