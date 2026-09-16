import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import {
    getBanaAtananArizalar,
    arizaIseBasla,
    arizaIslemEkle,
    arizaTamamla,
    getArizaIslemleri,
} from "../api/yerindeDestekService";


function BanaAtananIsler() {

    const [
        isler,
        setIsler
    ] = useState([]);


    const [
        seciliIs,
        setSeciliIs
    ] = useState(null);


    const [
        islemler,
        setIslemler
    ] = useState([]);


    const [
        yapilanIslem,
        setYapilanIslem
    ] = useState("");


    const [
        ucret,
        setUcret
    ] = useState("");


    const [
        konsinyeUrunBilgisi,
        setKonsinyeUrunBilgisi
    ] = useState("");


    const [
        mesaj,
        setMesaj
    ] = useState(null);


    // =========================================================
    // BANA ATANAN İŞLERİ YÜKLE
    // =========================================================

    const loadIsler = async () => {

        try {

            const response =
                await getBanaAtananArizalar();


            const gelenIsler =
                response.data || [];


            setIsler(
                gelenIsler
            );


            // Seçili iş varsa güncel halini al
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
                "Bana atanan işler alınamadı:",
                error
            );


            setMesaj({
                text:
                    "Atanan işler alınamadı.",
                severity:
                    "error",
            });

        }

    };


    useEffect(() => {

        loadIsler();

    }, []);


    // =========================================================
    // İŞLEMLERİ YÜKLE
    // =========================================================

    const loadIslemler = async (
        arizaKaydiId
    ) => {

        try {

            const response =
                await getArizaIslemleri(
                    arizaKaydiId
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

    };


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

        setYapilanIslem("");

        setUcret("");

        setKonsinyeUrunBilgisi("");


        await loadIslemler(
            is.ariza_kaydi_id
        );

    };


    // =========================================================
    // İŞE BAŞLA
    // =========================================================

    const handleIseBasla =
        async () => {

            if (!seciliIs) {
                return;
            }


            try {

                await arizaIseBasla(
                    seciliIs.ariza_kaydi_id
                );


                setMesaj({
                    text:
                        "İş başlatıldı.",
                    severity:
                        "success",
                });


                await loadIsler();


            } catch (error) {

                console.error(
                    "İş başlatılamadı:",
                    error
                );


                setMesaj({
                    text:
                        error.response
                            ?.data
                            ?.detail ||
                        "İş başlatılamadı.",
                    severity:
                        "error",
                });

            }

        };


    // =========================================================
    // İŞLEM EKLE
    // =========================================================

    const handleIslemEkle =
        async () => {

            if (!seciliIs) {
                return;
            }


            if (
                !yapilanIslem.trim()
            ) {

                setMesaj({
                    text:
                        "Yapılan işlem alanını doldurun.",
                    severity:
                        "warning",
                });

                return;

            }


            const payload = {

                yapilan_islem:
                    yapilanIslem.trim(),

                ucret:
                    ucret === ""
                        ? null
                        : Number(ucret),

                konsinye_urun_bilgisi:
                    konsinyeUrunBilgisi
                        .trim()
                        ? konsinyeUrunBilgisi.trim()
                        : null,

            };


            try {

                await arizaIslemEkle(
                    seciliIs.ariza_kaydi_id,
                    payload
                );


                setMesaj({
                    text:
                        "Yapılan işlem kaydedildi.",
                    severity:
                        "success",
                });


                setYapilanIslem("");

                setUcret("");

                setKonsinyeUrunBilgisi("");


                await loadIslemler(
                    seciliIs.ariza_kaydi_id
                );


            } catch (error) {

                console.error(
                    "İşlem eklenemedi:",
                    error
                );


                setMesaj({
                    text:
                        error.response
                            ?.data
                            ?.detail ||
                        "İşlem eklenemedi.",
                    severity:
                        "error",
                });

            }

        };


    // =========================================================
    // İŞİ TAMAMLA
    // =========================================================

    const handleTamamla =
        async () => {

            if (!seciliIs) {
                return;
            }


            // En az bir yapılan işlem kaydedilmeden
            // iş tamamlanamaz.
            if (islemler.length === 0) {

                setMesaj({
                    text:
                        "İşi tamamlamadan önce en az bir yapılan işlem eklemelisiniz.",
                    severity:
                        "warning",
                });

                return;

            }


            try {

                await arizaTamamla(
                    seciliIs.ariza_kaydi_id
                );


                setMesaj({
                    text:
                        "İş tamamlandı.",
                    severity:
                        "success",
                });


                // Backend'den tamamlanma tarihini de
                // tekrar çekiyoruz.
                await loadIsler();


                await loadIslemler(
                    seciliIs.ariza_kaydi_id
                );


            } catch (error) {

                console.error(
                    "İş tamamlanamadı:",
                    error
                );


                setMesaj({
                    text:
                        error.response
                            ?.data
                            ?.detail ||
                        "İş tamamlanamadı.",
                    severity:
                        "error",
                });

            }

        };


    // =========================================================
    // DURUM YAZISI
    // =========================================================

    const durumYazisi = (
        durum
    ) => {

        switch (durum) {

            case "atandi":
                return "Atandı";

            case "devam_ediyor":
                return "Devam Ediyor";

            case "tamamlandi":
                return "Tamamlandı";

            case "atama_bekliyor":
                return "Atama Bekliyor";

            default:
                return durum || "-";

        }

    };


    // =========================================================
    // DURUM RENGİ
    // =========================================================

    const durumRengi = (
        durum
    ) => {

        switch (durum) {

            case "atandi":
                return "info";

            case "devam_ediyor":
                return "primary";

            case "tamamlandi":
                return "success";

            case "atama_bekliyor":
                return "warning";

            default:
                return "default";

        }

    };


    // =========================================================
    // TARİH FORMATLAMA
    // =========================================================

    const tarihFormatla = (
        tarih
    ) => {

        if (!tarih) {
            return "-";
        }


        const date =
            new Date(tarih);


        return date.toLocaleString(
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
    // EKRAN
    // =========================================================

    return (

        <Box
            sx={{
                display:
                    "grid",

                gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    lg: "minmax(330px, 0.85fr) minmax(500px, 1.4fr)",
                },

                gap:
                    2.5,

                alignItems:
                    "start",
            }}
        >


           <Paper
  elevation={0}
  sx={{
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    height: { xs: "460px", sm: "520px", lg: "600px" },
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  }}
>
  {/* ÜST SABİT ALAN */}
  <Box
    sx={{
      px: { xs: 2, sm: 3 },
      py: { xs: 2, sm: 3 },
      borderBottom: "1px solid #e2e8f0",
      flexShrink: 0,
      backgroundColor: "#fff",
    }}
  >
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        color: "#0f172a",
        mb: 1,
      }}
    >
      Bana Atanan İşler
    </Typography>

    <Typography
      sx={{
        color: "#64748b",
        fontSize: "15px",
      }}
    >
      Üzerinize atanmış yerinde destek işleri
    </Typography>
  </Box>

  {/* SCROLL OLAN LİSTE */}
  <Box
    sx={{
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",

      "&::-webkit-scrollbar": {
        width: "7px",
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "#f8fafc",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#cbd5e1",
        borderRadius: "10px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "#94a3b8",
      },
    }}
  >
    {isler.length === 0 ? (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography color="text.secondary">
          Size atanmış iş bulunmuyor.
        </Typography>
      </Box>
    ) : (
      isler.map((is) => {
        const seciliMi =
          Number(seciliIs?.ariza_kaydi_id) === Number(is.ariza_kaydi_id);

        return (
          <Box
            key={is.ariza_kaydi_id}
            onClick={() => handleIsSec(is)}
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2.5 },
              cursor: "pointer",
              borderBottom: "1px solid #f1f5f9",
              backgroundColor: seciliMi ? "#eff6ff" : "#ffffff",
              "&:hover": {
                backgroundColor: seciliMi ? "#eff6ff" : "#f8fafc",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 1,
                mb: 1,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#0f172a",
                    fontSize: "17px",
                  }}
                >
                  {is.musteri_adi}
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "14px",
                    mt: 0.3,
                  }}
                >
                  {is.sube_adi}
                </Typography>
              </Box>

              <Chip
                label={durumYazisi(is.durum)}
                size="small"
                color={durumRengi(is.durum)}
                sx={{
                  fontWeight: 600,
                }}
              />
            </Box>

            <Typography
              sx={{
                color: "#334155",
                fontSize: "15px",
                mb: 1.5,
              }}
            >
              {is.sorun}
            </Typography>

            <Typography
              sx={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Atanma:{" "}
              {is.atanma_tarihi
                ? new Date(is.atanma_tarihi).toLocaleString("tr-TR")
                : "-"}
            </Typography>
          </Box>
        );
      })
    )}
  </Box>
</Paper>


            {/* ================================================= */}
            {/* SAĞ TARAF - İŞ DETAYI */}
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


                {/* İŞ SEÇİLMEDİ */}

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
                                        fontWeight:
                                            600,

                                        color:
                                            "#475569",

                                        fontSize:
                                            "16px",
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
                                            0.7,
                                    }}
                                >
                                    Detay görüntülemek için soldaki
                                    listeden bir iş seçin.
                                </Typography>

                            </Box>

                        </Box>

                    )
                }


                {/* ================================================= */}
                {/* SEÇİLİ İŞ */}
                {/* ================================================= */}

                {
                    seciliIs && (

                        <>


                            {/* ÜST BİLGİ */}

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
                                            fontWeight:
                                                700,

                                            color:
                                                "#0f172a",
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

                                    size="small"

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
                                    fontWeight:
                                        700,

                                    color:
                                        "#475569",

                                    fontSize:
                                        "13px",

                                    mb:
                                        0.7,
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


                            {/* ================================================= */}
                            {/* TARİHLER */}
                            {/* ================================================= */}

                            <Box
                                sx={{
                                    mt:
                                        2.5,

                                    display:
                                        "grid",

                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: seciliIs
                                            .tamamlanma_tarihi
                                            ? "repeat(3, 1fr)"
                                            : "repeat(2, 1fr)",
                                    },

                                    gap:
                                        2,

                                    backgroundColor:
                                        "#f8fafc",

                                    border:
                                        "1px solid #e2e8f0",

                                    borderRadius:
                                        "10px",

                                    p:
                                        2,
                                }}
                            >


                                {/* ATANMA */}

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
                                        Atanma Tarihi
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
                                                seciliIs
                                                    .atanma_tarihi
                                            )
                                        }
                                    </Typography>

                                </Box>


                                {/* İŞE BAŞLAMA */}

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
                                        İşe Başlama
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
                                                seciliIs
                                                    .ise_baslama_tarihi
                                            )
                                        }
                                    </Typography>

                                </Box>


                                {/* TAMAMLANMA */}

                                {
                                    seciliIs
                                        .tamamlanma_tarihi && (

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
                                                Tamamlanma Tarihi
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
                                                        seciliIs
                                                            .tamamlanma_tarihi
                                                    )
                                                }
                                            </Typography>

                                        </Box>

                                    )
                                }

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
                            {/* ATANDI */}
                            {/* ================================================= */}

                            {
                                seciliIs.durum ===
                                    "atandi" && (

                                    <Box
                                        sx={{
                                            mt:
                                                3,
                                        }}
                                    >

                                        <Button
                                            fullWidth

                                            variant="contained"

                                            size="large"

                                            onClick={
                                                handleIseBasla
                                            }

                                            sx={{
                                                textTransform:
                                                    "none",

                                                fontWeight:
                                                    600,

                                                borderRadius:
                                                    "9px",
                                            }}
                                        >
                                            İşe Başla
                                        </Button>

                                    </Box>

                                )
                            }


                            {/* ================================================= */}
                            {/* DEVAM EDİYOR */}
                            {/* ================================================= */}

                            {
                                seciliIs.durum ===
                                    "devam_ediyor" && (

                                    <>


                                        <Divider
                                            sx={{
                                                my:
                                                    3,
                                            }}
                                        />


                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight:
                                                    700,

                                                fontSize:
                                                    "17px",

                                                mb:
                                                    2,
                                            }}
                                        >
                                            İşlem Ekle
                                        </Typography>


                                        <TextField
                                            fullWidth

                                            multiline

                                            rows={4}

                                            label="Yapılan İşlem"

                                            value={
                                                yapilanIslem
                                            }

                                            onChange={
                                                (e) =>
                                                    setYapilanIslem(
                                                        e.target.value
                                                    )
                                            }
                                        />


                                        <TextField
                                            fullWidth

                                            type="number"

                                            label="Ücret"

                                            value={
                                                ucret
                                            }

                                            onChange={
                                                (e) =>
                                                    setUcret(
                                                        e.target.value
                                                    )
                                            }

                                            sx={{
                                                mt:
                                                    2,
                                            }}
                                        />


                                        <TextField
                                            fullWidth

                                            multiline

                                            rows={3}

                                            label="Konsinye Ürün Bilgisi"

                                            value={
                                                konsinyeUrunBilgisi
                                            }

                                            onChange={
                                                (e) =>
                                                    setKonsinyeUrunBilgisi(
                                                        e.target.value
                                                    )
                                            }

                                            sx={{
                                                mt:
                                                    2,
                                            }}
                                        />


                                        <Button
                                            fullWidth

                                            variant="contained"

                                            onClick={
                                                handleIslemEkle
                                            }

                                            sx={{
                                                mt:
                                                    2,

                                                textTransform:
                                                    "none",

                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            İşlem Ekle
                                        </Button>


                                        <Divider
                                            sx={{
                                                my:
                                                    3,
                                            }}
                                        />


                                        <Typography
                                            sx={{
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
                                                    Henüz işlem eklenmemiş.
                                                </Typography>

                                            )
                                        }


                                        {
                                            islemler.map(
                                                (
                                                    islem
                                                ) => (

                                                    <Box
                                                        key={
                                                            islem.islem_id
                                                        }

                                                        sx={{
                                                            p:
                                                                1.7,

                                                            mb:
                                                                1,

                                                            border:
                                                                "1px solid #e2e8f0",

                                                            borderRadius:
                                                                "9px",

                                                            backgroundColor:
                                                                "#f8fafc",
                                                        }}
                                                    >

                                                        <Typography
                                                            sx={{
                                                                fontWeight:
                                                                    600,

                                                                color:
                                                                    "#1e293b",
                                                            }}
                                                        >
                                                            {
                                                                islem
                                                                    .yapilan_islem
                                                            }
                                                        </Typography>


                                                        {
                                                            islem.ucret !==
                                                                null &&
                                                            islem.ucret !==
                                                                undefined && (

                                                                <Typography
                                                                    sx={{
                                                                        color:
                                                                            "#64748b",

                                                                        fontSize:
                                                                            "13px",

                                                                        mt:
                                                                            0.6,
                                                                    }}
                                                                >
                                                                    Ücret:{" "}
                                                                    {
                                                                        islem.ucret
                                                                    }{" "}
                                                                    TL
                                                                </Typography>

                                                            )
                                                        }


                                                        {
                                                            islem
                                                                .konsinye_urun_bilgisi && (

                                                                <Typography
                                                                    sx={{
                                                                        color:
                                                                            "#64748b",

                                                                        fontSize:
                                                                            "13px",

                                                                        mt:
                                                                            0.4,
                                                                    }}
                                                                >
                                                                    Konsinye Ürün:{" "}
                                                                    {
                                                                        islem
                                                                            .konsinye_urun_bilgisi
                                                                    }
                                                                </Typography>

                                                            )
                                                        }


                                                        <Typography
                                                            sx={{
                                                                color:
                                                                    "#94a3b8",

                                                                fontSize:
                                                                    "11px",

                                                                mt:
                                                                    0.6,
                                                            }}
                                                        >
                                                            {
                                                                tarihFormatla(
                                                                    islem
                                                                        .islem_tarihi
                                                                )
                                                            }
                                                        </Typography>

                                                    </Box>

                                                )
                                            )
                                        }


                                        <Button
                                            fullWidth

                                            variant="contained"

                                            color="success"

                                            disabled={
                                                islemler.length === 0
                                            }

                                            onClick={
                                                handleTamamla
                                            }

                                            sx={{
                                                mt:
                                                    3,

                                                textTransform:
                                                    "none",

                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            İşi Tamamla
                                        </Button>


                                        {islemler.length === 0 && (

                                            <Typography
                                                sx={{
                                                    mt: 1,
                                                    textAlign: "center",
                                                    color: "#94a3b8",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                İşi tamamlamak için en az bir yapılan işlem ekleyin.
                                            </Typography>

                                        )}

                                    </>

                                )
                            }


                            {/* ================================================= */}
                            {/* TAMAMLANMIŞ İŞ */}
                            {/* ================================================= */}

                            {
                                seciliIs.durum ===
                                    "tamamlandi" && (

                                    <>

                                        <Divider
                                            sx={{
                                                my:
                                                    3,
                                            }}
                                        />


                                        <Typography
                                            sx={{
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
                                                    color="text.secondary"
                                                >
                                                    Bu işe ait işlem bulunmuyor.
                                                </Typography>

                                            )
                                        }


                                        {
                                            islemler.map(
                                                (
                                                    islem
                                                ) => (

                                                    <Box
                                                        key={
                                                            islem.islem_id
                                                        }

                                                        sx={{
                                                            p:
                                                                1.7,

                                                            mb:
                                                                1,

                                                            backgroundColor:
                                                                "#f8fafc",

                                                            border:
                                                                "1px solid #e2e8f0",

                                                            borderRadius:
                                                                "9px",
                                                        }}
                                                    >

                                                        <Typography
                                                            fontWeight={
                                                                600
                                                            }
                                                        >
                                                            {
                                                                islem
                                                                    .yapilan_islem
                                                            }
                                                        </Typography>


                                                        {
                                                            islem.ucret !==
                                                                null &&
                                                            islem.ucret !==
                                                                undefined && (

                                                                <Typography
                                                                    color="text.secondary"
                                                                    fontSize="13px"
                                                                    sx={{
                                                                        mt:
                                                                            0.5,
                                                                    }}
                                                                >
                                                                    Ücret:{" "}
                                                                    {
                                                                        islem.ucret
                                                                    }{" "}
                                                                    TL
                                                                </Typography>

                                                            )
                                                        }


                                                        {
                                                            islem
                                                                .konsinye_urun_bilgisi && (

                                                                <Typography
                                                                    color="text.secondary"
                                                                    fontSize="13px"
                                                                >
                                                                    Konsinye Ürün:{" "}
                                                                    {
                                                                        islem
                                                                            .konsinye_urun_bilgisi
                                                                    }
                                                                </Typography>

                                                            )
                                                        }


                                                        <Typography
                                                            sx={{
                                                                color:
                                                                    "#94a3b8",

                                                                fontSize:
                                                                    "11px",

                                                                mt:
                                                                    0.6,
                                                            }}
                                                        >
                                                            {
                                                                tarihFormatla(
                                                                    islem
                                                                        .islem_tarihi
                                                                )
                                                            }
                                                        </Typography>

                                                    </Box>

                                                )
                                            )
                                        }


                                        <Alert
                                            severity="success"
                                            sx={{
                                                mt:
                                                    2,
                                            }}
                                        >
                                            Bu iş tamamlandı.
                                        </Alert>

                                    </>

                                )
                            }


                        </>

                    )
                }


            </Paper>

        </Box>

    );

}


export default BanaAtananIsler;