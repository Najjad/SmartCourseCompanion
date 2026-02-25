import StatsChart from "../components/StatsChart";

function UsageStats() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Usage Statistics</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Overall Completion</h3>
        <p>Average Completion: 75%</p>
      </div>

      <StatsChart />
    </div>
  );
}

export default UsageStats;