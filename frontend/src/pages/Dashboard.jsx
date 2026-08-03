import "../styles/dashboard.css";

import Header from "../components/Header";
import StatisticsCards from "../components/StatisticsCards";
import CallForm from "../components/CallForm";
import CallTable from "../components/CallTable";

import { Navigate } from "react-router-dom";
import { useState } from "react";

function Dashboard() {

    const token = localStorage.getItem("token");

    const [selectedCall, setSelectedCall] = useState(null);
    const [refreshTable, setRefreshTable] = useState(false);

    if (!token) {
        return <Navigate to="/" />;
    }

    return (
        <div className="dashboard">

            <Header />

            <main className="dashboard-main">

                <div className="left-panel">

                    <CallForm
                        selectedCall={selectedCall}
                        setSelectedCall={setSelectedCall}
                        refreshTable={() =>
                            setRefreshTable(!refreshTable)
                        }
                    />

                </div>

                <div className="right-panel">

                    <StatisticsCards />

                    <CallTable
                        setSelectedCall={setSelectedCall}
                        refreshTable={refreshTable}
                    />

                </div>

            </main>

        </div>
    );
}

export default Dashboard;