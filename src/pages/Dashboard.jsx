import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function daysUntil(dateStr) {
  const today = new Date();
  const due = new Date(dateStr);
  const diff = due - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  // ----- Demo Course Data -----
  const [courses] = useState([
    {
      id: "1",
      code: "SOEN 287",
      average: 92,
      remainingWeight: 50,
      upcoming: [
        { name: "Final Exam", dueDate: "2026-04-10", weight: 40 },
      ],
    },
    {
      id: "2",
      code: "COMP 249",
      average: 80,
      remainingWeight: 50,
      upcoming: [
        { name: "Project 2", dueDate: "2026-03-20", weight: 20 },
      ],
    },
  ]);

  const [target, setTarget] = useState("");

  // ----- Computed Metrics -----
  const computed = useMemo(() => {
    const totalCourses = courses.length;

    const overallAvg =
      totalCourses > 0
        ? courses.reduce((sum, c) => sum + c.average, 0) / totalCourses
        : null;

    const upcomingAll = courses
      .flatMap((c) =>
        c.upcoming.map((u) => ({
          ...u,
          course: c.code,
          daysLeft: daysUntil(u.dueDate),
        }))
      )
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const atRisk = courses.filter((c) => c.average < 60);

    return {
      totalCourses,
      overallAvg,
      upcomingAll,
      atRisk,
    };
  }, [courses]);

  // ----- Goal Calculation -----
  const requiredRemaining = useMemo(() => {
    if (!target) return null;
    const t = Number(target);
    if (!Number.isFinite(t)) return null;

    // assume average of all courses for demo
    const remainingWeight =
      courses.reduce((sum, c) => sum + c.remainingWeight, 0) /
      courses.length;

    const currentAvg =
      courses.reduce((sum, c) => sum + c.average, 0) /
      courses.length;

    if (remainingWeight <= 0) return null;

    const required =
      (t - currentAvg) / (remainingWeight / 100);

    return required;
  }, [target, courses]);

  // ----- Chart Data -----
  const barData = {
    labels: courses.map((c) => c.code),
    datasets: [
      {
        label: "Course Average (%)",
        data: courses.map((c) => c.average),
      },
    ],
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 30 }}>
      <h1>Dashboard</h1>
      <p style={{ color: "#666" }}>
        Welcome {user?.email} ({user?.role})
      </p>

      {/* ===== Stats Row ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 20 }}>
        <StatCard title="Total Courses" value={computed.totalCourses} />
        <StatCard
          title="Overall Average"
          value={
            computed.overallAvg === null
              ? "—"
              : `${computed.overallAvg.toFixed(1)}%`
          }
        />
        <StatCard
          title="Upcoming Deadlines"
          value={computed.upcomingAll.length}
        />
        <StatCard
          title="At Risk"
          value={computed.atRisk.length}
          danger={computed.atRisk.length > 0}
        />
      </div>

      {/* ===== Middle Section ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginTop: 30 }}>

        {/* Upcoming Timeline */}
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
          <h2>Upcoming Deadlines</h2>

          {computed.upcomingAll.length === 0 ? (
            <p>No upcoming assessments.</p>
          ) : (
            computed.upcomingAll.slice(0, 5).map((u, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <strong>{u.name}</strong> — {u.course}
                <div style={{ fontSize: 14, color: u.daysLeft < 0 ? "red" : "#555" }}>
                  {u.daysLeft < 0
                    ? `Overdue by ${Math.abs(u.daysLeft)} days`
                    : `Due in ${u.daysLeft} days`}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Course Performance Chart */}
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
          <h2>Performance Overview</h2>
          <div style={{ height: 300 }}>
            <Bar data={barData} />
          </div>
        </div>
      </div>

      {/* ===== Goal Section ===== */}
      <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 12, marginTop: 30 }}>
        <h2>Grade Goal Planner</h2>
        <p>Enter a target overall average to estimate required performance.</p>

        <input
          placeholder="Target % (e.g., 85)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />

        {requiredRemaining !== null && (
          <p style={{ marginTop: 10 }}>
            Required average on remaining assessments:{" "}
            <strong>
              {requiredRemaining > 100
                ? "Unrealistic target"
                : `${requiredRemaining.toFixed(1)}%`}
            </strong>
          </p>
        )}
      </div>

      {/* ===== Risk Alerts ===== */}
      {computed.atRisk.length > 0 && (
        <div style={{ marginTop: 30, padding: 20, border: "1px solid #e74c3c", borderRadius: 12, background: "#ffecec" }}>
          <h3>⚠ Academic Risk Alert</h3>
          {computed.atRisk.map((c) => (
            <p key={c.id}>
              {c.code} average is {c.average}%
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, danger }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        border: "1px solid #ddd",
        background: danger ? "#ffecec" : "white",
      }}
    >
      <div style={{ fontSize: 14, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}