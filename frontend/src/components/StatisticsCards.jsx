import { useEffect, useState } from "react";
import "../styles/statisticsCards.css";

import { getDashboard } from "../api/dashboardService";

function StatisticsCards() {

    const [cards, setCards] = useState([

        {
            title: "Bugün",
            value: 0
        },

        {
            title: "Bekleyen",
            value: 0
        },

        {
            title: "Servise Aktarılan",
            value: 0
        },

        {
            title: "Toplam Müşteri",
            value: 0
        }

    ]);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const response = await getDashboard();

                setCards([

                    {
                        title: "Bugün",
                        value: response.data.bugun_acilan
                    },

                    {
                        title: "Bekleyen",
                        value: response.data.bekleyen
                    },

                    {
                        title: "Servise Aktarılan",
                        value: response.data.servise_aktarilan
                    },

                    {
                        title: "Toplam Müşteri",
                        value: response.data.toplam_musteri
                    }

                ]);

            } catch (error) {

                console.error("Dashboard verileri alınamadı:", error);

            }

        };

        loadDashboard();

    }, []);

    return (

        <div className="statistics">

            {

                cards.map((card, index) => (

                    <div
                        className="stat-card"
                        key={index}
                    >

                        <span>{card.title}</span>

                        <h2>{card.value}</h2>

                    </div>

                ))

            }

        </div>

    );

}

export default StatisticsCards;