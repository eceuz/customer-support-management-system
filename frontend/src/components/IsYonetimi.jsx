import { useEffect, useState } from "react";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import api from "../api/api";

import {
    getArizalar,
    arizaAta,
    getArizaIslemleri,
} from "../api/yerindeDestekService";


function IsYonetimi() {

    const [
        isler,
        setIsler
    ] = useState([]);


    const [
        personeller,
        setPersoneller
    ] = useState([]);


    const [
        seciliIs,
        setSeciliIs
    ] = useState(null);


    const [
        seciliPersonel,
        setSeciliPersonel
    ] = useState(null);


    const [
        arama,
        setArama
    ] = useState("");


    const [
        mesaj,
        setMesaj
    ] = useState(null);


    const [
        yukleniyor,
        setYukleniyor
    ] = useState(false);


    const [
        islemler,
        setIslemler
    ] = useState([]);


    // =========================================================
    // VERİLERİ YÜKLE
    // =========================================================

    const loadData = async () => {

        try {

            const [
                arizaResponse,
                kullaniciResponse
            ] = await Promise.all([

                getArizalar(),

                api.get(
                    "/kullanicilar"
                ),

            ]);


            const gelenIsler =
                arizaResponse.data || [];


            const kullanicilar =
                kullaniciResponse.data || [];


            setIsler(
                gelenIsler
            );



            const destekPersonelleri =
                kullanicilar.filter(
                    (kullanici) =>
                        kullanici.rol ===
                        "DESTEK"
                );


            setPersoneller(
                destekPersonelleri
            );


            // Seçili iş varsa
            // onun güncel halini getir

            if (seciliIs) {

                const guncelIs =
                    gelenIsler.find(
                        (item) =>
                            Number(
                                item.ariza_kaydi_id
                            ) ===
                            Number(
                                seciliIs.ariza_kaydi_id
                            )
                    );


                if (guncelIs) {

                    setSeciliIs(
                        guncelIs
                    );

                }

            }


        } catch (error) {

            console.error(
                "İş yönetimi verileri alınamadı:",
                error
            );


            setMesaj({
                text:
                    error.response
                        ?.data
                        ?.detail ||
                    "İş yönetimi verileri alınamadı.",
                severity:
                    "error",
            });

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    // =========================================================
    // İŞ SEÇ
    // =========================================================

    const handleIsSec = async (
        is
    ) => {

        setSeciliIs(
            is
        );


        setMesaj(null);

        setIslemler([]);


        // İş daha önce birine atanmışsa
        // ilgili kullanıcıyı bul

        if (
            is.atanan_kullanici_id
        ) {

            const bulunanPersonel =
                personeller.find(
                    (personel) =>
                        Number(
                            personel.kullanici_id
                        ) ===
                        Number(
                            is.atanan_kullanici_id
                        )
                );


            setSeciliPersonel(
                bulunanPersonel ||
                null
            );

        } else {

            setSeciliPersonel(
                null
            );

        }


        // Atanmış bir işse, personelin eklediği
        // yapılan işlemleri yönetici için getir

        if (
            is.durum !== "atama_bekliyor"
        ) {

            try {

                const response =
                    await getArizaIslemleri(
                        is.ariza_kaydi_id
                    );


                setIslemler(
                    response.data || []
                );

            } catch (error) {

                console.error(
                    "Arıza işlemleri alınamadı:",
                    error
                );


                setIslemler([]);

            }

        }

    };


    // =========================================================
    // İŞ ATA
    // =========================================================

    const handleAta =
        async () => {

            if (!seciliIs) {

                return;

            }


            if (!seciliPersonel) {

                setMesaj({
                    text:
                        "Lütfen bir personel seçin.",
                    severity:
                        "warning",
                });

                return;

            }


            try {

                setYukleniyor(
                    true
                );


                await arizaAta(
                    seciliIs.ariza_kaydi_id,
                    seciliPersonel.kullanici_id
                );


                setMesaj({
                    text:
                        `İş ${seciliPersonel.kullanici_adi} kullanıcısına atandı.`,
                    severity:
                        "success",
                });


                await loadData();


            } catch (error) {

                console.error(
                    "İş atanamadı:",
                    error
                );


                setMesaj({
                    text:
                        error.response
                            ?.data
                            ?.detail ||
                        "İş atanamadı.",
                    severity:
                        "error",
                });


            } finally {

                setYukleniyor(
                    false
                );

            }

        };


    // =========================================================
    // DURUM
    // =========================================================

    const durumYazisi = (
        durum
    ) => {

        switch (durum) {

            case "atama_bekliyor":
                return "Atama Bekliyor";

            case "atandi":
                return "Atandı";

            case "devam_ediyor":
                return "Devam Ediyor";

            case "tamamlandi":
                return "Tamamlandı";

            default:
                return durum || "-";

        }

    };


    const durumRengi = (
        durum
    ) => {

        switch (durum) {

            case "atama_bekliyor":
                return "warning";

            case "atandi":
                return "info";

            case "devam_ediyor":
                return "primary";

            case "tamamlandi":
                return "success";

            default:
                return "default";

        }

    };


    // =========================================================
    // TARİH
    // =========================================================

    const tarihFormatla = (
        tarih
    ) => {

        if (!tarih) {

            return "-";

        }


        return new Date(
            tarih
        ).toLocaleString(
            "tr-TR",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit",
            }
        );

    };


    // =========================================================
    // SAYILAR
    // =========================================================

    const atamaBekleyenSayisi =
        isler.filter(
            (is) =>
                is.durum ===
                "atama_bekliyor"
        ).length;


    const atanmisSayisi =
        isler.filter(
            (is) =>
                is.durum ===
                "atandi"
        ).length;


    const devamEdenSayisi =
        isler.filter(
            (is) =>
                is.durum ===
                "devam_ediyor"
        ).length;


    const tamamlananSayisi =
        isler.filter(
            (is) =>
                is.durum ===
                "tamamlandi"
        ).length;


    // =========================================================
    // ARAMA
    // =========================================================

    const filtreliIsler =
        isler.filter(
            (is) => {

                const aranan =
                    arama
                        .trim()
                        .toLocaleLowerCase(
                            "tr-TR"
                        );


                if (!aranan) {

                    return true;

                }


                return (

                    (
                        is.musteri_adi ||
                        ""
                    )
                        .toLocaleLowerCase(
                            "tr-TR"
                        )
                        .includes(
                            aranan
                        )

                    ||

                    (
                        is.sube_adi ||
                        ""
                    )
                        .toLocaleLowerCase(
                            "tr-TR"
                        )
                        .includes(
                            aranan
                        )

                    ||

                    (
                        is.sorun ||
                        ""
                    )
                        .toLocaleLowerCase(
                            "tr-TR"
                        )
                        .includes(
                            aranan
                        )

                    ||

                    (
                        is.atanan_kullanici_adi ||
                        ""
                    )
                        .toLocaleLowerCase(
                            "tr-TR"
                        )
                        .includes(
                            aranan
                        )

                );

            }
        );


    // =========================================================
    // EKRAN
    // =========================================================

    return (

        <Box>


            {/* ================================================= */}
            {/* ÖZET KARTLARI */}
            {/* ================================================= */}

            <Box
                sx={{
                    display:
                        "grid",

                    gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(4, 1fr)",
                    },

                    gap:
                        2,

                    mb:
                        2.5,
                }}
            >


                {/* ATAMA BEKLEYEN */}

                <Paper
                    elevation={0}
                    sx={{
                        border:
                            "1px solid #e2e8f0",

                        borderRadius:
                            "14px",

                        p:
                            2,
                    }}
                >

                    <Typography
                        sx={{
                            color:
                                "#64748b",

                            fontSize:
                                "13px",

                            fontWeight:
                                600,
                        }}
                    >
                        Atama Bekleyen
                    </Typography>


                    <Typography
                        sx={{
                            color:
                                "#0f172a",

                            fontSize:
                                "27px",

                            fontWeight:
                                700,

                            mt:
                                0.5,
                        }}
                    >
                        {
                            atamaBekleyenSayisi
                        }
                    </Typography>

                </Paper>


                {/* ATANAN */}

                <Paper
                    elevation={0}
                    sx={{
                        border:
                            "1px solid #e2e8f0",

                        borderRadius:
                            "14px",

                        p:
                            2,
                    }}
                >

                    <Typography
                        sx={{
                            color:
                                "#64748b",

                            fontSize:
                                "13px",

                            fontWeight:
                                600,
                        }}
                    >
                        Atanan
                    </Typography>


                    <Typography
                        sx={{
                            color:
                                "#0f172a",

                            fontSize:
                                "27px",

                            fontWeight:
                                700,

                            mt:
                                0.5,
                        }}
                    >
                        {
                            atanmisSayisi
                        }
                    </Typography>

                </Paper>


                {/* DEVAM EDİYOR */}

                <Paper
                    elevation={0}
                    sx={{
                        border:
                            "1px solid #e2e8f0",

                        borderRadius:
                            "14px",

                        p:
                            2,
                    }}
                >

                    <Typography
                        sx={{
                            color:
                                "#64748b",

                            fontSize:
                                "13px",

                            fontWeight:
                                600,
                        }}
                    >
                        Devam Ediyor
                    </Typography>


                    <Typography
                        sx={{
                            color:
                                "#0f172a",

                            fontSize:
                                "27px",

                            fontWeight:
                                700,

                            mt:
                                0.5,
                        }}
                    >
                        {
                            devamEdenSayisi
                        }
                    </Typography>

                </Paper>


                {/* TAMAMLANAN */}

                <Paper
                    elevation={0}
                    sx={{
                        border:
                            "1px solid #e2e8f0",

                        borderRadius:
                            "14px",

                        p:
                            2,
                    }}
                >

                    <Typography
                        sx={{
                            color:
                                "#64748b",

                            fontSize:
                                "13px",

                            fontWeight:
                                600,
                        }}
                    >
                        Tamamlanan
                    </Typography>


                    <Typography
                        sx={{
                            color:
                                "#0f172a",

                            fontSize:
                                "27px",

                            fontWeight:
                                700,

                            mt:
                                0.5,
                        }}
                    >
                        {
                            tamamlananSayisi
                        }
                    </Typography>

                </Paper>

            </Box>


            {/* ================================================= */}
            {/* ANA ALAN */}
            {/* ================================================= */}

            <Box
                sx={{
                    display:
                        "grid",

                    gridTemplateColumns: {
                        xs: "minmax(0, 1fr)",
                        lg: "minmax(430px, 1fr) minmax(480px, 1fr)",
                    },

                    gap:
                        2.5,

                    alignItems:
                        "start",
                }}
            >


                {/* ================================================= */}
                {/* SOL - İŞLER */}
                {/* ================================================= */}

                {/* ================================================= */}
{/* SOL - İŞLER */}
{/* ================================================= */}

<Paper
    elevation={0}
    sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "16px",

        // Kartın yüksekliği sabit
        height: { xs: "480px", sm: "540px", lg: "600px" },

        overflow: "hidden",

        display: "flex",
        flexDirection: "column",
    }}
>

    {/* ================================================= */}
    {/* BAŞLIK + ARAMA */}
    {/* ================================================= */}

    <Box
        sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,

            borderBottom:
                "1px solid #e2e8f0",

            // Bu bölüm kaymaz
            flexShrink: 0,

            backgroundColor: "#ffffff",
        }}
    >

        <Typography
            variant="h6"
            sx={{
                fontWeight: 700,
                color: "#0f172a",
                mb: 1.5,
            }}
        >
            Yerinde Destek İşleri
        </Typography>


        <TextField
            fullWidth
            size="small"

            placeholder="Müşteri, şube, sorun veya personel ara..."

            value={arama}

            onChange={(e) =>
                setArama(
                    e.target.value
                )
            }

            slotProps={{
                input: {
                    startAdornment: (

                        <InputAdornment
                            position="start"
                        >

                            <SearchIcon
                                fontSize="small"
                            />

                        </InputAdornment>

                    ),
                },
            }}
        />

    </Box>


    {/* ================================================= */}
    {/* KAYDIRILABİLİR İŞ LİSTESİ */}
    {/* ================================================= */}

    <Box
        sx={{
            flex: 1,

            overflowY: "auto",

            overflowX: "hidden",

            // Scrollbar biraz daha temiz görünsün
            "&::-webkit-scrollbar": {
                width: "7px",
            },

            "&::-webkit-scrollbar-track": {
                backgroundColor:
                    "#f8fafc",
            },

            "&::-webkit-scrollbar-thumb": {
                backgroundColor:
                    "#cbd5e1",

                borderRadius:
                    "10px",
            },

            "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor:
                    "#94a3b8",
            },
        }}
    >

        {/* KAYIT YOK */}

        {filtreliIsler.length === 0 && (

            <Box
                sx={{
                    py: 8,
                    textAlign: "center",
                }}
            >

                <Typography
                    color="text.secondary"
                >
                    Yerinde destek işi bulunamadı.
                </Typography>

            </Box>

        )}


        {/* İŞLER */}

        {filtreliIsler.map((is) => {

            const seciliMi =
                Number(
                    seciliIs
                        ?.ariza_kaydi_id
                ) ===
                Number(
                    is.ariza_kaydi_id
                );


            return (

                <Box
                    key={
                        is.ariza_kaydi_id
                    }

                    onClick={() =>
                        handleIsSec(is)
                    }

                    sx={{
                        px: 2.5,
                        py: 2,

                        cursor: "pointer",

                        borderBottom:
                            "1px solid #f1f5f9",

                        backgroundColor:
                            seciliMi
                                ? "#eff6ff"
                                : "#ffffff",

                        "&:hover": {
                            backgroundColor:
                                seciliMi
                                    ? "#eff6ff"
                                    : "#f8fafc",
                        },
                    }}
                >

                    <Box
                        sx={{
                            display: "flex",

                            justifyContent:
                                "space-between",

                            alignItems:
                                "flex-start",

                            gap: 1,
                        }}
                    >

                        <Box>

                            <Typography
                                sx={{
                                    color:
                                        "#1e293b",

                                    fontWeight:
                                        700,
                                }}
                            >
                                {
                                    is.musteri_adi ||
                                    "-"
                                }
                            </Typography>


                            <Typography
                                sx={{
                                    color:
                                        "#64748b",

                                    fontSize:
                                        "13px",

                                    mt: 0.2,
                                }}
                            >
                                {
                                    is.sube_adi ||
                                    "-"
                                }
                            </Typography>

                        </Box>


                        <Chip
                            size="small"

                            label={
                                durumYazisi(
                                    is.durum
                                )
                            }

                            color={
                                durumRengi(
                                    is.durum
                                )
                            }

                            sx={{
                                fontWeight:
                                    600,
                            }}
                        />

                    </Box>


                    <Typography
                        sx={{
                            color:
                                "#334155",

                            fontSize:
                                "14px",

                            mt: 1.2,
                        }}
                    >
                        {
                            is.sorun ||
                            "-"
                        }
                    </Typography>


                    {is.atanan_kullanici_adi && (

                        <Typography
                            sx={{
                                color:
                                    "#64748b",

                                fontSize:
                                    "12px",

                                mt: 1,
                            }}
                        >
                            Personel:{" "}

                            <strong>
                                {
                                    is.atanan_kullanici_adi
                                }
                            </strong>
                        </Typography>

                    )}

                </Box>

            );

        })}

    </Box>

</Paper>

                {/* ================================================= */}
                {/* SAĞ - İŞ DETAYI */}
                {/* ================================================= */}

                <Paper
                    elevation={0}
                    sx={{
                        border:
                            "1px solid #e2e8f0",

                        borderRadius:
                            "16px",

                        minHeight: {
                            xs: "auto",
                            lg: "600px",
                        },

                        p: { xs: 2, sm: 3 },
                    }}
                >


                    {/* SEÇİM YOK */}

                    {
                        !seciliIs && (

                            <Box
                                sx={{
                                    minHeight: {
                                        xs: "220px",
                                        lg: "520px",
                                    },

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    textAlign:
                                        "center",
                                }}
                            >

                                <Box>

                                    <Typography
                                        sx={{
                                            color:
                                                "#475569",

                                            fontWeight:
                                                600,
                                        }}
                                    >
                                        Bir iş seçin
                                    </Typography>


                                    <Typography
                                        sx={{
                                            color:
                                                "#94a3b8",

                                            fontSize:
                                                "13px",

                                            mt:
                                                0.5,
                                        }}
                                    >
                                        İş detayını görüntülemek için
                                        soldaki listeden bir kayıt seçin.
                                    </Typography>

                                </Box>

                            </Box>

                        )
                    }


                    {/* ================================================= */}
                    {/* İŞ SEÇİLDİ */}
                    {/* ================================================= */}

                    {
                        seciliIs && (

                            <>


                                {/* ÜST */}

                                <Box
                                    sx={{
                                        display:
                                            "flex",

                                        justifyContent:
                                            "space-between",

                                        alignItems:
                                            "flex-start",

                                        gap:
                                            2,
                                    }}
                                >

                                    <Box>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color:
                                                    "#0f172a",

                                                fontWeight:
                                                    700,
                                            }}
                                        >
                                            {
                                                seciliIs.musteri_adi ||
                                                "-"
                                            }
                                        </Typography>


                                        <Typography
                                            sx={{
                                                color:
                                                    "#64748b",

                                                mt:
                                                    0.3,
                                            }}
                                        >
                                            {
                                                seciliIs.sube_adi ||
                                                "-"
                                            }
                                        </Typography>

                                    </Box>


                                    <Chip
                                        size="small"

                                        label={
                                            durumYazisi(
                                                seciliIs.durum
                                            )
                                        }

                                        color={
                                            durumRengi(
                                                seciliIs.durum
                                            )
                                        }

                                        sx={{
                                            fontWeight:
                                                600,
                                        }}
                                    />

                                </Box>


                                <Divider
                                    sx={{
                                        my:
                                            2.5,
                                    }}
                                />


                                {/* SORUN */}

                                <Typography
                                    sx={{
                                        color:
                                            "#64748b",

                                        fontSize:
                                            "12px",

                                        fontWeight:
                                            700,

                                        mb:
                                            0.5,
                                    }}
                                >
                                    Sorun
                                </Typography>


                                <Typography
                                    sx={{
                                        color:
                                            "#1e293b",

                                        lineHeight:
                                            1.6,
                                    }}
                                >
                                    {
                                        seciliIs.sorun ||
                                        "-"
                                    }
                                </Typography>


                                {/* TARİHLER */}

                                <Box
                                    sx={{
                                        mt:
                                            2.5,

                                        display:
                                            "grid",

                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            sm: "repeat(2, 1fr)",
                                        },

                                        gap:
                                            2,

                                        p:
                                            2,

                                        backgroundColor:
                                            "#f8fafc",

                                        border:
                                            "1px solid #e2e8f0",

                                        borderRadius:
                                            "10px",
                                    }}
                                >

                                    <Box>

                                        <Typography
                                            sx={{
                                                color:
                                                    "#64748b",

                                                fontSize:
                                                    "12px",

                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            Oluşturulma
                                        </Typography>


                                        <Typography
                                            sx={{
                                                color:
                                                    "#1e293b",

                                                fontSize:
                                                    "13px",

                                                mt:
                                                    0.4,
                                            }}
                                        >
                                            {
                                                tarihFormatla(
                                                    seciliIs.olusturma_tarihi
                                                )
                                            }
                                        </Typography>

                                    </Box>


                                    <Box>

                                        <Typography
                                            sx={{
                                                color:
                                                    "#64748b",

                                                fontSize:
                                                    "12px",

                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            Atanma
                                        </Typography>


                                        <Typography
                                            sx={{
                                                color:
                                                    "#1e293b",

                                                fontSize:
                                                    "13px",

                                                mt:
                                                    0.4,
                                            }}
                                        >
                                            {
                                                tarihFormatla(
                                                    seciliIs.atanma_tarihi
                                                )
                                            }
                                        </Typography>

                                    </Box>

                                </Box>


                                {/* MESAJ */}

                                {
                                    mesaj && (

                                        <Alert
                                            severity={
                                                mesaj.severity
                                            }

                                            onClose={() =>
                                                setMesaj(null)
                                            }

                                            sx={{
                                                mt:
                                                    2.5,
                                            }}
                                        >
                                            {
                                                mesaj.text
                                            }
                                        </Alert>

                                    )
                                }


                                {/* ================================================= */}
                                {/* ATAMA BEKLİYOR */}
                                {/* ================================================= */}

                                {
                                    seciliIs.durum ===
                                        "atama_bekliyor" && (

                                        <Box
                                            sx={{
                                                mt:
                                                    3,
                                            }}
                                        >

                                            <Typography
                                                sx={{
                                                    color:
                                                        "#0f172a",

                                                    fontWeight:
                                                        700,

                                                    mb:
                                                        1.5,
                                                }}
                                            >
                                                Personel Ata
                                            </Typography>


                                            <Autocomplete
                                                options={
                                                    personeller
                                                }

                                                value={
                                                    seciliPersonel
                                                }

                                                getOptionLabel={
                                                    (option) =>
                                                        option.kullanici_adi ||
                                                        ""
                                                }

                                                isOptionEqualToValue={(
                                                    option,
                                                    value
                                                ) =>
                                                    Number(
                                                        option.kullanici_id
                                                    ) ===
                                                    Number(
                                                        value.kullanici_id
                                                    )
                                                }

                                                onChange={(
                                                    event,
                                                    value
                                                ) =>
                                                    setSeciliPersonel(
                                                        value
                                                    )
                                                }

                                                renderInput={
                                                    (params) => (

                                                        <TextField
                                                            {...params}

                                                            label=
                                                                "Destek Personeli"

                                                            placeholder=
                                                                "Personel seçin"
                                                        />

                                                    )
                                                }
                                            />


                                            <Button
                                                fullWidth

                                                variant="contained"

                                                disabled={
                                                    !seciliPersonel ||
                                                    yukleniyor
                                                }

                                                onClick={
                                                    handleAta
                                                }

                                                sx={{
                                                    mt:
                                                        2,

                                                    textTransform:
                                                        "none",

                                                    fontWeight:
                                                        600,

                                                    borderRadius:
                                                        "9px",
                                                }}
                                            >
                                                {
                                                    yukleniyor
                                                        ? "Atanıyor..."
                                                        : "İşi Ata"
                                                }
                                            </Button>

                                        </Box>

                                    )
                                }


                                {/* ================================================= */}
                                {/* ATANMIŞ / DEVAM EDEN / TAMAMLANAN */}
                                {/* ================================================= */}

                                {
                                    seciliIs.durum !==
                                        "atama_bekliyor" && (

                                        <>

                                            <Divider
                                                sx={{
                                                    my:
                                                        3,
                                                }}
                                            />


                                            <Typography
                                                sx={{
                                                    color:
                                                        "#64748b",

                                                    fontSize:
                                                        "12px",

                                                    fontWeight:
                                                        700,

                                                    mb:
                                                        0.5,
                                                }}
                                            >
                                                Atanan Personel
                                            </Typography>


                                            <Typography
                                                sx={{
                                                    color:
                                                        "#0f172a",

                                                    fontWeight:
                                                        600,
                                                }}
                                            >
                                                {
                                                    seciliIs
                                                        .atanan_kullanici_adi ||
                                                    "-"
                                                }
                                            </Typography>


                                            {
                                                seciliIs
                                                    .ise_baslama_tarihi && (

                                                    <Typography
                                                        sx={{
                                                            color:
                                                                "#64748b",

                                                            fontSize:
                                                                "13px",

                                                            mt:
                                                                1.5,
                                                        }}
                                                    >
                                                        İşe Başlama:{" "}
                                                        {
                                                            tarihFormatla(
                                                                seciliIs
                                                                    .ise_baslama_tarihi
                                                            )
                                                        }
                                                    </Typography>

                                                )
                                            }


                                            {
                                                seciliIs
                                                    .tamamlanma_tarihi && (

                                                    <Typography
                                                        sx={{
                                                            color:
                                                                "#64748b",

                                                            fontSize:
                                                                "13px",

                                                            mt:
                                                                0.5,
                                                        }}
                                                    >
                                                        Tamamlanma:{" "}
                                                        {
                                                            tarihFormatla(
                                                                seciliIs
                                                                    .tamamlanma_tarihi
                                                            )
                                                        }
                                                    </Typography>

                                                )
                                            }


                                            <Divider
                                                sx={{
                                                    my:
                                                        3,
                                                }}
                                            />


                                            <Typography
                                                sx={{
                                                    color:
                                                        "#0f172a",

                                                    fontWeight:
                                                        700,

                                                    mb:
                                                        1.5,
                                                }}
                                            >
                                                Yapılan İşlemler
                                            </Typography>


                                            {
                                                islemler.length ===
                                                    0 && (

                                                    <Typography
                                                        sx={{
                                                            color:
                                                                "#94a3b8",

                                                            fontSize:
                                                                "13px",
                                                        }}
                                                    >
                                                        Henüz yapılan işlem bulunmuyor.
                                                    </Typography>

                                                )
                                            }


                                            {
                                                islemler.map(
                                                    (islem) => (

                                                        <Box
                                                            key={
                                                                islem.islem_id
                                                            }

                                                            sx={{
                                                                p:
                                                                    1.7,

                                                                mb:
                                                                    1.2,

                                                                backgroundColor:
                                                                    "#f8fafc",

                                                                border:
                                                                    "1px solid #e2e8f0",

                                                                borderRadius:
                                                                    "9px",
                                                            }}
                                                        >

                                                            <Typography
                                                                sx={{
                                                                    color:
                                                                        "#1e293b",

                                                                    fontWeight:
                                                                        600,
                                                                }}
                                                            >
                                                                {
                                                                    islem.yapilan_islem ||
                                                                    "-"
                                                                }
                                                            </Typography>


                                                            <Typography
                                                                sx={{
                                                                    color:
                                                                        "#64748b",

                                                                    fontSize:
                                                                        "13px",

                                                                    mt:
                                                                        0.7,
                                                                }}
                                                            >
                                                                Ücret:{" "}
                                                                {
                                                                    islem.ucret !==
                                                                        null &&
                                                                    islem.ucret !==
                                                                        undefined
                                                                        ? `${islem.ucret} TL`
                                                                        : "Yok"
                                                                }
                                                            </Typography>


                                                            <Typography
                                                                sx={{
                                                                    color:
                                                                        "#64748b",

                                                                    fontSize:
                                                                        "13px",

                                                                    mt:
                                                                        0.3,
                                                                }}
                                                            >
                                                                Konsinye Ürün:{" "}
                                                                {
                                                                    islem.konsinye_urun_bilgisi ||
                                                                    "Yok"
                                                                }
                                                            </Typography>


                                                            <Typography
                                                                sx={{
                                                                    color:
                                                                        "#94a3b8",

                                                                    fontSize:
                                                                        "11px",

                                                                    mt:
                                                                        0.7,
                                                                }}
                                                            >
                                                                {
                                                                    tarihFormatla(
                                                                        islem.islem_tarihi
                                                                    )
                                                                }
                                                            </Typography>

                                                        </Box>

                                                    )
                                                )
                                            }

                                        </>

                                    )
                                }


                            </>

                        )
                    }


                </Paper>

            </Box>

        </Box>

    );

}


export default IsYonetimi;