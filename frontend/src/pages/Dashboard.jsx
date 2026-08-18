import "../styles/dashboard.css";

import Header from "../components/Header";
import StatisticsCards from "../components/StatisticsCards";
import CallForm from "../components/CallForm";
import CallTable from "../components/CallTable";

import { Navigate } from "react-router-dom";
import { useState } from "react";


function Dashboard() {

    const token =
        localStorage.getItem("token");

    const [
        selectedCall,
        setSelectedCall
    ] = useState(null);

    const [
        refreshTable,
        setRefreshTable
    ] = useState(false);

    const [
        dashboardFilter,
        setDashboardFilter
    ] = useState("tum");


    if (!token) {
        return <Navigate to="/" />;
    }


    // Çağrı ekleme / düzenleme / silme sonrası
    // hem tabloyu hem kartları yeniler
    const handleRefresh = () => {

        setRefreshTable(
            (onceki) => !onceki
        );

    };


    const handleCardClick = (filter) => {

        // Aynı karta tekrar basılırsa
        // filtreyi kaldır
        setDashboardFilter(
            (oncekiFilter) =>
                oncekiFilter === filter
                    ? "tum"
                    : filter
        );

        setSelectedCall(null);

    };


    return (

        <div className="dashboard">

            <Header />


            <main className="dashboard-main">

                {/* SOL PANEL */}
                <div className="left-panel">

                    <CallForm
                        selectedCall={
                            selectedCall
                        }
                        setSelectedCall={
                            setSelectedCall
                        }
                        refreshTable={
                            handleRefresh
                        }
                    />

                </div>


                {/* SAĞ PANEL */}
                <div className="right-panel">

                    <StatisticsCards
                        onCardClick={
                            handleCardClick
                        }
                        activeFilter={
                            dashboardFilter
                        }
                        refreshTrigger={
                            refreshTable
                        }
                    />


                    <CallTable
                        setSelectedCall={
                            setSelectedCall
                        }
                        refreshTable={
                            refreshTable
                        }
                        dashboardFilter={
                            dashboardFilter
                        }
                        onDataChange={
                            handleRefresh
                        }
                    />

                </div>

            </main>

        </div>

    );

}


export default Dashboard;