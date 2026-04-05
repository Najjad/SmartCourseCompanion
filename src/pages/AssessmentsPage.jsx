import { useMemo, useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  fetchUserCourse,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} from "../api/users";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);



export default function AssessmentsPage() {
  const { user } = useContext(AuthContext);
  const { courseId } = useParams();

  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  

  // Add Assessment form state
  const [form, setForm] = useState({
    name: "",
    category: "assignment",
    weight: "",
    dueDate: "",
    totalMarks: "",
  });

  // Marks edit per assessment (so you can “Enter Marks”)
  const [edit, setEdit] = useState({}); // { [id]: { earnedMarks, totalMarks, status } }
  async function loadAssessments() {
    if (!user?.userId || !courseId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await fetchUserCourse(user.userId, courseId);
      setAssessments(response.course?.assessments || []);
    } catch (err) {
      setError(err.message || "Failed to load assessments");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAssessments();
  }, [user?.userId, courseId]);
  // ----- Calculations -----
  const computed = useMemo(() => {
    const rows = assessments.map((a) => {
  const normalized = {
    ...a,
    name: a.name || a.title || "Untitled",
    earnedMarks: a.earnedMarks ?? "",
  };

  const earned = Number(normalized.earnedMarks);
  const total = Number(normalized.totalMarks);

  const hasMarks =
    normalized.earnedMarks !== "" &&
    normalized.totalMarks !== "" &&
    Number.isFinite(earned) &&
    Number.isFinite(total) &&
    total > 0;

  const grade = hasMarks ? (earned / total) * 100 : null;
  const weighted = hasMarks ? (grade / 100) * Number(normalized.weight || 0) : 0;

  return {
    ...normalized,
    grade,
    weightedContribution: weighted,
  };
});

    const graded = rows.filter((r) => r.grade !== null);
    const totalWeight = graded.reduce((sum, r) => sum + Number(r.weight || 0), 0);
    const sumWeighted = graded.reduce((sum, r) => sum + r.weightedContribution, 0);

    // course average based only on assessments that have marks
    const courseAvg = totalWeight > 0 ? (sumWeighted / totalWeight) * 100 : null;

    // progress completion
    const completedCount = rows.filter((r) => r.status === "completed").length;
    const progress = rows.length > 0 ? (completedCount / rows.length) * 100 : 0;

    // upcoming (sorted by date)
    const upcoming = [...rows]
      .filter((r) => r.status !== "completed")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return { rows, graded, courseAvg, completedCount, total: rows.length, progress, upcoming };
  }, [assessments]);

  // ----- Charts data -----
  const trendData = useMemo(() => {
    const gradedSorted = [...computed.graded].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return {
      labels: gradedSorted.map((a) => a.name),
      datasets: [
        {
          label: "Assessment Grade (%)",
          data: gradedSorted.map((a) => Number(a.grade?.toFixed(1))),
        },
      ],
    };
  }, [computed.graded]);

  const breakdownData = useMemo(() => {
    const groups = computed.rows.reduce(
      (acc, a) => {
        const key = a.category;
        const w = Number(a.weight || 0);
        acc[key] = (acc[key] || 0) + w;
        return acc;
      },
      { assignment: 0, quiz: 0, exam: 0, lab: 0 }
    );

    const labels = Object.keys(groups).map((k) => k.toUpperCase());
    const values = Object.values(groups);

    return {
      labels,
      datasets: [{ label: "Weight Breakdown", data: values }],
    };
  }, [computed.rows]);

  // ----- Handlers -----
    async function onAddAssessment(e) {
    e.preventDefault();

    const weightNum = Number(form.weight);
    const totalMarksNum = Number(form.totalMarks);

    if (!form.name.trim()) return alert("Name is required.");
    if (!form.dueDate) return alert("Due date is required.");
    if (!Number.isFinite(weightNum) || weightNum <= 0) return alert("Weight must be > 0.");
    if (!Number.isFinite(totalMarksNum) || totalMarksNum <= 0) return alert("Total marks must be > 0.");
    if (!user?.userId || !courseId) return alert("Missing user or course.");

    try {
      setError("");

      await createAssessment(user.userId, courseId, {
        title: form.name.trim(),
        category: form.category,
        weight: weightNum,
        dueDate: form.dueDate,
        totalMarks: totalMarksNum,
      });

      setForm({
        name: "",
        category: "assignment",
        weight: "",
        dueDate: "",
        totalMarks: "",
      });

      await loadAssessments();
    } catch (err) {
      setError(err.message || "Failed to add assessment");
    }
  }

  function startEdit(a) {
    setEdit((prev) => ({
      ...prev,
      [a.id]: {
        earnedMarks: a.earnedMarks === "" ? "" : String(a.earnedMarks),
        totalMarks: a.totalMarks === "" ? "" : String(a.totalMarks),
        status: a.status,
      },
    }));
  }

    async function saveEdit(id) {
    const e = edit[id];
    if (!e) return;

    const earned = e.earnedMarks === "" ? "" : Number(e.earnedMarks);
    const total = e.totalMarks === "" ? "" : Number(e.totalMarks);

    if (earned !== "" && (!Number.isFinite(earned) || earned < 0)) return alert("Earned marks invalid.");
    if (total !== "" && (!Number.isFinite(total) || total <= 0)) return alert("Total marks invalid.");
    if (earned !== "" && total !== "" && earned > total) return alert("Earned cannot exceed total.");
    if (!user?.userId || !courseId) return alert("Missing user or course.");

    try {
      setError("");

      await updateAssessment(user.userId, courseId, id, {
        earnedMarks: earned === "" ? null : earned,
        status: e.status,
      });

      setEdit((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      await loadAssessments();
    } catch (err) {
      setError(err.message || "Failed to update assessment");
    }
  }

    async function removeAssessment(id) {
    if (!window.confirm("Delete this assessment?")) return;
    if (!user?.userId || !courseId) return alert("Missing user or course.");

    try {
      setError("");
      await deleteAssessment(user.userId, courseId, id);
      await loadAssessments();
    } catch (err) {
      setError(err.message || "Failed to delete assessment");
    }
  }

  // ----- UI -----
  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: 20 }}>
      {error ? <div style={{ marginBottom: 12, color: "red" }}>{error}</div> : null}
      {isLoading ? <div style={{ marginBottom: 12 }}>Loading assessments...</div> : null}
      <h1 style={{ marginBottom: 6 }}>Assessments & Grade Tracking</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Add assessments, enter marks, and view calculated grades, weighted contributions, and course average.
      </p>

      {/* Top summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Progress */}
        <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Course completion</strong>
            <span>
              {computed.completedCount}/{computed.total} completed
            </span>
          </div>
          <div style={{ height: 12, background: "#eee", borderRadius: 999 }}>
            <div
              style={{
                height: "100%",
                width: `${computed.progress}%`,
                background: "#2d6cdf",
                borderRadius: 999,
              }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Current course average: </strong>
            {computed.courseAvg === null ? "—" : `${computed.courseAvg.toFixed(1)}%`}
          </div>

          {computed.upcoming.length > 0 && (
            <div style={{ marginTop: 10, color: "#444" }}>
              <strong>Upcoming:</strong>{" "}
              {computed.upcoming.slice(0, 2).map((u) => `${u.name} (${u.dueDate})`).join(", ")}
            </div>
          )}
        </div>

        {/* Grade breakdown chart */}
        <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
          <strong>Weight breakdown (by category)</strong>
          <div style={{ height: 220, marginTop: 10 }}>
            <Doughnut data={breakdownData} />
          </div>
        </div>
      </div>

      {/* Add Assessment */}
      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Add Assessment</h2>

        <form
          onSubmit={onAddAssessment}
          style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(5, 1fr)" }}
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />

          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="lab">Lab</option>
          </select>

          <input
            placeholder="Weight (%)"
            value={form.weight}
            onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
          />

          <input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />

          <input
            placeholder="Total marks"
            value={form.totalMarks}
            onChange={(e) => setForm((p) => ({ ...p, totalMarks: e.target.value }))}
          />

          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit">Add</button>
          </div>
        </form>
      </div>

      {/* Table + Trend chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Table */}
        <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
          <h2 style={{ marginTop: 0 }}>Assessments</h2>

          <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                <th>Name</th>
                <th>Category</th>
                <th>Weight</th>
                <th>Due</th>
                <th>Marks</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Weighted</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {computed.rows.map((a) => {
                const e = edit[a.id];

                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td>{a.name}</td>
                    <td>{a.category}</td>
                    <td>{a.weight}%</td>
                    <td>{a.dueDate}</td>

                    <td>
                      {e ? (
                        <>
                          <input
                            style={{ width: 70 }}
                            placeholder="earned"
                            value={e.earnedMarks}
                            onChange={(ev) =>
                              setEdit((p) => ({ ...p, [a.id]: { ...p[a.id], earnedMarks: ev.target.value } }))
                            }
                          />
                          {" / "}
                          <input
                            style={{ width: 70 }}
                            placeholder="total"
                            value={e.totalMarks}
                            onChange={(ev) =>
                              setEdit((p) => ({ ...p, [a.id]: { ...p[a.id], totalMarks: ev.target.value } }))
                            }
                          />
                        </>
                      ) : (
                        <>
                          {a.earnedMarks === "" ? "—" : a.earnedMarks} / {a.totalMarks}
                        </>
                      )}
                    </td>

                    <td>
                      {e ? (
                        <select
                          value={e.status}
                          onChange={(ev) => setEdit((p) => ({ ...p, [a.id]: { ...p[a.id], status: ev.target.value } }))}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        a.status
                      )}
                    </td>

                    <td>{a.grade === null ? "—" : `${a.grade.toFixed(1)}%`}</td>
                    <td>{a.grade === null ? "—" : a.weightedContribution.toFixed(2)}</td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      {e ? (
                        <button onClick={() => saveEdit(a.id)}>Save</button>
                      ) : (
                        <button onClick={() => startEdit(a)}>Enter marks</button>
                      )}{" "}
                      <button onClick={() => removeAssessment(a.id)} style={{ marginLeft: 6 }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p style={{ color: "#666", marginBottom: 0, marginTop: 10 }}>
            * Weighted = (assessment grade %) × weight. Course average is calculated from assessments with marks.
          </p>
        </div>

        {/* Trend chart */}
        <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
          <strong>Performance trend</strong>
          <div style={{ height: 300, marginTop: 10 }}>
            <Line data={trendData} />
          </div>
        </div>
      </div>
    </div>
  );
}