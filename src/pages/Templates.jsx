function Templates() {
  const templates = [
    {
      id: 1,
      name: "Standard Engineering Template",
      categories: ["Assignments 20%", "Midterm 30%", "Final 50%"],
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reusable Course Templates</h2>

      {templates.map((template) => (
        <div key={template.id} style={{ marginBottom: "15px" }}>
          <h3>{template.name}</h3>
          <ul>
            {template.categories.map((cat, index) => (
              <li key={index}>{cat}</li>
            ))}
          </ul>
          <button>Use Template</button>
        </div>
      ))}
    </div>
  );
}

export default Templates;