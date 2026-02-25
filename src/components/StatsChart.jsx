import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function StatsChart() {
  const data = {
    labels: ["SOEN287", "COMP249", "ENGR202"],
    datasets: [
      {
        label: "% Assessments Completed",
        data: [75, 60, 90],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return <Bar data={data} />;
}

export default StatsChart;