import "../styles/dashboard.css";

import Header from "../components/Header";
import StatisticsCards from "../components/StatisticsCards";
import CallForm from "../components/CallForm";
import CallTable from "../components/CallTable";
import { Navigate } from "react-router-dom";

function Dashboard() {
    const token = localStorage.getItem("token");

    if (!token) {

        return <Navigate to="/" />;

    }
  return (
    <div className="dashboard">

      <Header />

      <main className="dashboard-main">

        <div className="left-panel">
          <CallForm />
        </div>

        <div className="right-panel">
          <StatisticsCards />
          <CallTable />
        </div>

      </main>

    </div>
  );
}

export default Dashboard;