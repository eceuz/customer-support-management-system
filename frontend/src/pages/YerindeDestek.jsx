import "../styles/dashboard.css";

import Header from "../components/Header";
import YerindeDestekForm from "../components/YerindeDestekForm";
import YerindeDestekTable from "../components/YerindeDestekTable";
import BanaAtananIsler from "../components/BanaAtananIsler";
import IsYonetimi from "../components/IsYonetimi";

import {
    Box,
    Tabs,
    Tab,
    Typography,
} from "@mui/material";

import {
    Navigate
} from "react-router-dom";

import {
    useState
} from "react";

import {
    getUserRole
} from "../api/authService";


function YerindeDestek() {

    const token =
        localStorage.getItem("token");


    const kullaniciRol =
        getUserRole();


    // =========================================================
    // ŞİMDİLİK ADMİN = YÖNETİCİ
    //
    // Daha sonra gerçek YÖNETİCİ rolünü
    // eklediğimizde burayı değiştireceğiz.
    // =========================================================

    const yoneticiMi =
        kullaniciRol === "ADMİN";


    // =========================================================
    // AKTİF SEKME
    //
    // YÖNETİCİ:
    // 0 = Yeni Kayıt
    // 1 = İş Yönetimi
    //
    // DESTEK:
    // 0 = Yeni Kayıt
    // 1 = Bana Atanan İşler
    // =========================================================

    const [
        aktifSekme,
        setAktifSekme
    ] = useState(0);


    const [
        refreshTable,
        setRefreshTable
    ] = useState(false);


    // =========================================================
    // OTURUM KONTROLÜ
    // =========================================================

    if (!token) {

        return (
            <Navigate
                to="/"
            />
        );

    }


    // =========================================================
    // YENİ KAYIT SONRASI TABLOYU YENİLE
    // =========================================================

    const handleRefresh = () => {

        setRefreshTable(
            (onceki) => !onceki
        );

    };


    // =========================================================
    // EKRAN
    // =========================================================

    return (

        <div className="dashboard">

            <Header />


            {/* ================================================= */}
            {/* SAYFA BAŞLIĞI + SEKMELER */}
            {/* ================================================= */}

            <Box
                sx={{
                    px: { xs: 1.25, sm: 2, md: 3 },
                    pt: { xs: 1.5, sm: 2, md: 3 },
                    backgroundColor: "#f8fafc",
                }}
            >

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: "#0f172a",
                        mb: 3,
                    }}
                >
                </Typography>


                <Box
                    sx={{
                        backgroundColor: "#ffffff",

                        border:
                            "1px solid #e2e8f0",

                        borderRadius: "14px",

                        overflow: "hidden",
                    }}
                >

                    <Tabs
                        value={
                            aktifSekme
                        }

                        onChange={(
                            event,
                            yeniDeger
                        ) => {

                            setAktifSekme(
                                yeniDeger
                            );

                        }}

                        variant="fullWidth"

                        sx={{
                            minHeight: "58px",


                            "& .MuiTab-root": {
                                minHeight: { xs: "50px", sm: "58px" },

                                textTransform: "none",

                                fontSize: { xs: "13px", sm: "15px" },

                                px: { xs: 1, sm: 2 },

                                fontWeight: 500,

                                color: "#475569",
                            },


                            "& .Mui-selected": {
                                color:
                                    "#1976d2 !important",

                                fontWeight: 600,
                            },


                            "& .MuiTabs-indicator": {
                                height: "2px",
                            },
                        }}
                    >


                        {/* HERKES */}

                        <Tab
                            label="Yeni Kayıt"
                        />


                        {/* DESTEK PERSONELİ */}

                        {!yoneticiMi && (

                            <Tab
                                label="Bana Atanan İşler"
                            />

                        )}


                        {/* YÖNETİCİ */}

                        {yoneticiMi && (

                            <Tab
                                label="İş Yönetimi"
                            />

                        )}


                    </Tabs>

                </Box>

            </Box>


            {/* ================================================= */}
            {/* YENİ KAYIT */}
            {/* ================================================= */}

            {
                aktifSekme === 0 && (

                    <main className="dashboard-main">


                        {/* SOL PANEL */}

                        <div className="left-panel">

                            <YerindeDestekForm
                                onRefresh={
                                    handleRefresh
                                }
                            />

                        </div>


                        {/* SAĞ PANEL */}

                        <div className="right-panel">

                            <YerindeDestekTable
                                refreshTrigger={
                                    refreshTable
                                }
                            />

                        </div>


                    </main>

                )
            }


            {/* ================================================= */}
            {/* DESTEK → BANA ATANAN İŞLER */}
            {/* ================================================= */}

            {
                aktifSekme === 1 &&
                !yoneticiMi && (

                    <Box
                        sx={{
                            backgroundColor:
                                "#f8fafc",

                            minHeight:
                                "calc(100vh - 200px)",

                            p: { xs: 1.25, sm: 2, md: 3 },
                        }}
                    >

                        <BanaAtananIsler />

                    </Box>

                )
            }


            {/* ================================================= */}
            {/* YÖNETİCİ → İŞ YÖNETİMİ */}
            {/* ================================================= */}

            {
                aktifSekme === 1 &&
                yoneticiMi && (

                    <Box
                        sx={{
                            backgroundColor:
                                "#f8fafc",

                            minHeight:
                                "calc(100vh - 200px)",

                            p: { xs: 1.25, sm: 2, md: 3 },
                        }}
                    >

                        <IsYonetimi />

                    </Box>

                )
            }


        </div>

    );

}


export default YerindeDestek;