import { useEffect, useState } from "react";
import "../styles/statisticsCards.css";

import { getSon24SaatCagriListesi } from "../api/cagriService";


function StatisticsCards({
    onCardClick,
    activeFilter,
    refreshTrigger
}) {

    const [cards, setCards] = useState([

        {
            title: "Bugün",
            value: 0,
            filter: "bugun"
        },

        {
            title: "Bekleyen",
            value: 0,
            filter: "bekleyen"
        },

        {
            title: "Servise Aktarılan",
            value: 0,
            filter: "servise_aktarilan"
        },

        {
            title: "Çözülen",
            value: 0,
            filter: "cozuldu"
        }

    ]);


    useEffect(() => {

        const loadStatistics = async () => {

            try {

                const response =
                    await getSon24SaatCagriListesi();

                const cagrilar =
                    response.data || [];


                // BUGÜN
                const bugun = new Date();

                const bugunSayisi =
                    cagrilar.filter((item) => {

                        if (!item.tarih) {
                            return false;
                        }

                        const tarih =
                            new Date(item.tarih);

                        return (
                            tarih.getFullYear() ===
                                bugun.getFullYear() &&

                            tarih.getMonth() ===
                                bugun.getMonth() &&

                            tarih.getDate() ===
                                bugun.getDate()
                        );

                    }).length;


                // BEKLEYEN
                const bekleyenSayisi =
                    cagrilar.filter(
                        (item) =>
                            item.sonuc ===
                            "Beklemede"
                    ).length;


                // SERVİSE AKTARILAN
                const serviseAktarilanSayisi =
                    cagrilar.filter(
                        (item) =>
                            item.sonuc ===
                            "Servise Aktarıldı"
                    ).length;


                // ÇÖZÜLEN
                const cozulenSayisi =
                    cagrilar.filter(
                        (item) =>
                            item.sonuc ===
                            "Çözüldü"
                    ).length;


                setCards([

                    {
                        title: "Bugün",
                        value: bugunSayisi,
                        filter: "bugun"
                    },

                    {
                        title: "Bekleyen",
                        value: bekleyenSayisi,
                        filter: "bekleyen"
                    },

                    {
                        title: "Servise Aktarılan",
                        value:
                            serviseAktarilanSayisi,
                        filter:
                            "servise_aktarilan"
                    },

                    {
                        title: "Çözülen",
                        value: cozulenSayisi,
                        filter: "cozuldu"
                    }

                ]);

            } catch (error) {

                console.error(
                    "İstatistikler alınamadı:",
                    error
                );

            }

        };


        loadStatistics();

    }, [refreshTrigger]);


    const handleCardClick = (filter) => {

        if (onCardClick) {
            onCardClick(filter);
        }

    };


    return (

        <div className="statistics">

            {cards.map((card) => (

                <div
                    className={`stat-card ${
                        activeFilter === card.filter
                            ? "active"
                            : ""
                    }`}
                    key={card.filter}
                    onClick={() =>
                        handleCardClick(
                            card.filter
                        )
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <span>
                        {card.title}
                    </span>

                    <h2>
                        {card.value}
                    </h2>

                </div>

            ))}

        </div>

    );

}


export default StatisticsCards;