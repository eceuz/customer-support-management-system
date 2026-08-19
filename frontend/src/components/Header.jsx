import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/header.css";

import { jwtDecode } from "jwt-decode";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import api from "../api/api";
import { getYazarkasalar } from "../api/yazarkasaService";
import { getUserRole } from "../api/authService";


function Header() {

  // =========================================================
  // KULLANICI MENÜSÜ
  // =========================================================

  const [anchorEl, setAnchorEl] =
    useState(null);


  // =========================================================
  // BİLDİRİM MENÜSÜ
  // =========================================================

  const [
    bildirimAnchorEl,
    setBildirimAnchorEl
  ] = useState(null);


  const [
    yazarkasaBildirimleri,
    setYazarkasaBildirimleri
  ] = useState([]);


  // =========================================================
  // PROFİL PENCERESİ
  // =========================================================

  const [
    profilOpen,
    setProfilOpen
  ] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();


  // =========================================================
  // TOKEN / KULLANICI
  // =========================================================

  const token =
    localStorage.getItem("token");


  let kullaniciAdi =
    "Kullanıcı";


  if (token) {

    try {

      const decoded =
        jwtDecode(token);


      kullaniciAdi =
        decoded.username ||
        "Kullanıcı";


    } catch (err) {

      console.error(
        "Token okunamadı:",
        err
      );

    }

  }


  const kullaniciRol =
    getUserRole() || "-";


  const open =
    Boolean(anchorEl);


  const bildirimOpen =
    Boolean(bildirimAnchorEl);


  // =========================================================
  // YAZARKASA BİLDİRİMLERİNİ YÜKLE
  // =========================================================

  useEffect(() => {

    if (!token) {
      return;
    }


    bildirimleriYukle();


    const interval =
      setInterval(() => {

        bildirimleriYukle();

      }, 60 * 60 * 1000);


    return () =>
      clearInterval(interval);

  }, []);


  // =========================================================
  // BİLDİRİMLER
  // =========================================================

  const bildirimleriYukle =
    async () => {

      try {

        const [
          yazarkasaResponse,
          subeResponse,
          musteriResponse,
        ] = await Promise.all([

          getYazarkasalar(),

          api.get("/subeler"),

          api.get("/musteriler"),

        ]);


        const yazarkasalar =
          yazarkasaResponse.data || [];


        const subeler =
          subeResponse.data || [];


        const musteriler =
          musteriResponse.data || [];


        const bugun =
          new Date();


        const bugunUTC =
          Date.UTC(
            bugun.getFullYear(),
            bugun.getMonth(),
            bugun.getDate()
          );


        const bildirimler =
          yazarkasalar

            .map((yazarkasa) => {

              if (
                !yazarkasa.bitis_tarihi
              ) {
                return null;
              }


              const [
                yil,
                ay,
                gun
              ] =
                yazarkasa
                  .bitis_tarihi
                  .split("-")
                  .map(Number);


              const bitisUTC =
                Date.UTC(
                  yil,
                  ay - 1,
                  gun
                );


              const gunFarki =
                Math.round(
                  (
                    bitisUTC -
                    bugunUTC
                  ) /
                  (
                    1000 *
                    60 *
                    60 *
                    24
                  )
                );


              // Sadece:
              // - süresi geçmiş
              // - bugün biten
              // - 1 gün kalan
              // kayıtlar bildirim olur.

              if (gunFarki > 1) {
                return null;
              }


              const sube =
                subeler.find(
                  (item) =>
                    Number(
                      item.sube_id
                    ) ===
                    Number(
                      yazarkasa.sube_id
                    )
                );


              const musteri =
                musteriler.find(
                  (item) =>
                    Number(
                      item.musteri_id
                    ) ===
                    Number(
                      sube?.musteri_id
                    )
                );


              let durum = "";
              let renk = "";
              let arkaPlan = "";


              // =================================================
              // SÜRESİ DOLDU
              // =================================================

              if (gunFarki < 0) {

                durum =
                  "Süresi Doldu";

                renk =
                  "#b91c1c";

                arkaPlan =
                  "#fee2e2";

              }


              // =================================================
              // BUGÜN
              // =================================================

              else if (
                gunFarki === 0
              ) {

                durum =
                  "Bugün Bitiyor";

                renk =
                  "#c2410c";

                arkaPlan =
                  "#ffedd5";

              }


              // =================================================
              // 1 GÜN
              // =================================================

              else if (
                gunFarki === 1
              ) {

                durum =
                  "1 Gün Kaldı";

                renk =
                  "#a16207";

                arkaPlan =
                  "#fef3c7";

              }


              return {

                ...yazarkasa,

                musteri_adi:
                  musteri?.musteri_adi ||
                  musteri?.cari_adi ||
                  "-",

                sube_adi:
                  sube?.sube_adi ||
                  "-",

                durum,

                renk,

                arkaPlan,

                gunFarki,

              };

            })

            .filter(Boolean)

            .sort((a, b) => {

              // Önce bugün
              if (
                a.gunFarki === 0 &&
                b.gunFarki !== 0
              ) {
                return -1;
              }


              if (
                b.gunFarki === 0 &&
                a.gunFarki !== 0
              ) {
                return 1;
              }


              // Sonra 1 gün kalan
              if (
                a.gunFarki === 1 &&
                b.gunFarki < 0
              ) {
                return -1;
              }


              if (
                b.gunFarki === 1 &&
                a.gunFarki < 0
              ) {
                return 1;
              }


              return (
                b.gunFarki -
                a.gunFarki
              );

            });


        setYazarkasaBildirimleri(
          bildirimler
        );


      } catch (error) {

        console.error(
          "Yazarkasa bildirimleri yüklenemedi:",
          error
        );

      }

    };


  // =========================================================
  // TARİH FORMAT
  // =========================================================

  const formatTarih =
    (tarih) => {

      if (!tarih) {
        return "-";
      }


      return new Date(
        `${tarih}T00:00:00`
      ).toLocaleDateString(
        "tr-TR"
      );

    };


  // =========================================================
  // KULLANICI MENÜSÜ
  // =========================================================

  const handleClick =
    (event) => {

      setAnchorEl(
        event.currentTarget
      );

    };


  const handleClose =
    () => {

      setAnchorEl(null);

    };


  // =========================================================
  // PROFİL
  // =========================================================

  const handleProfilOpen =
    () => {

      setAnchorEl(null);

      setProfilOpen(true);

    };


  const handleProfilClose =
    () => {

      setProfilOpen(false);

    };


  // =========================================================
  // BİLDİRİM MENÜSÜ
  // =========================================================

  const handleBildirimClick =
    (event) => {

      setBildirimAnchorEl(
        event.currentTarget
      );

    };


  const handleBildirimClose =
    () => {

      setBildirimAnchorEl(
        null
      );

    };


  // =========================================================
  // ÇIKIŞ
  // =========================================================

  const handleLogout =
    () => {

      localStorage.removeItem(
        "token"
      );

      navigate("/");

    };


  // =========================================================
  // SAYFA
  // =========================================================

  return (

    <header className="header">

      {/* =====================================================
          SOL
      ====================================================== */}

      <div className="header-left">

        <div
          className="logo-box"
          style={{
            background:
              "transparent",
            padding: 0,
          }}
        >

          <img
            src="/logo.svg"
            alt="Logo"
            style={{
              width: "42px",
              height: "42px",
              display: "block",
              borderRadius: "10px",
            }}
          />

        </div>


        <div>

          <h1>
            Destek Kayıt Sistemi
          </h1>

          <span>
            Teknik Destek Yönetimi
          </span>

        </div>

      </div>


      {/* =====================================================
          NAVİGASYON
      ====================================================== */}

      <nav className="header-nav">

        <button
          className={
            location.pathname ===
            "/dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
        >
          Ana Sayfa
        </button>


        <button
          className={
            location.pathname ===
            "/raporlar"
              ? "active"
              : ""
          }
          onClick={() =>
            navigate(
              "/raporlar"
            )
          }
        >
          Raporlar
        </button>


        <button
          className={
            location.pathname ===
            "/ayarlar"
              ? "active"
              : ""
          }
          onClick={() =>
            navigate(
              "/ayarlar"
            )
          }
        >
          Ayarlar
        </button>

      </nav>


      {/* =====================================================
          SAĞ
      ====================================================== */}

      <div
        className="header-right"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >

        {/* ===================================================
            BİLDİRİM ZİLİ
        ==================================================== */}

        <IconButton
          onClick={
            handleBildirimClick
          }
          sx={{
            width: "42px",
            height: "42px",

            color:
              "#475569",

            backgroundColor:
              "#f8fafc",

            border:
              "1px solid #e2e8f0",

            "&:hover": {
              backgroundColor:
                "#f1f5f9",
            },
          }}
        >

          <Badge
            badgeContent={
              yazarkasaBildirimleri.length
            }
            color="error"
            max={99}
          >

            <NotificationsNoneIcon />

          </Badge>

        </IconButton>


        {/* ===================================================
            BİLDİRİM MENÜSÜ
        ==================================================== */}

        <Menu
          anchorEl={
            bildirimAnchorEl
          }
          open={
            bildirimOpen
          }
          onClose={
            handleBildirimClose
          }
          slotProps={{
            paper: {

              sx: {

                width:
                  "390px",

                maxWidth:
                  "calc(100vw - 32px)",

                mt: 1,

                borderRadius:
                  "14px",

                border:
                  "1px solid #e2e8f0",

                boxShadow:
                  "0 12px 32px rgba(15, 23, 42, 0.12)",

                overflow:
                  "hidden",

              },

            },
          }}
        >

          {/* =================================================
              BİLDİRİM YOK
          ================================================= */}

          {yazarkasaBildirimleri.length ===
            0 && (

            <Box
              sx={{
                px: 3,
                py: 4,
                textAlign:
                  "center",
              }}
            >

              <Typography
                sx={{
                  color:
                    "#64748b",

                  fontSize:
                    "14px",

                  fontWeight:
                    500,
                }}
              >
                Bildirim Yok.
              </Typography>

            </Box>

          )}


          {/* =================================================
              BİLDİRİMLER
          ================================================= */}

          {yazarkasaBildirimleri.length >
            0 && (

            <Box
              sx={{
                maxHeight:
                  "430px",

                overflowY:
                  "auto",
              }}
            >

              {yazarkasaBildirimleri.map(
                (bildirim) => (

                  <Box
                    key={
                      bildirim.yazarkasa_id
                    }
                    sx={{
                      px: 2.2,

                      py: 1.7,

                      borderBottom:
                        "1px solid #f1f5f9",

                      "&:last-child": {
                        borderBottom:
                          "none",
                      },

                      "&:hover": {
                        backgroundColor:
                          "#f8fafc",
                      },
                    }}
                  >

                    {/* DURUM */}

                    <Box
                      sx={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",

                        gap: 1,

                        mb: 1,
                      }}
                    >

                      <Chip
                        label={
                          bildirim.durum
                        }
                        size="small"
                        sx={{
                          height:
                            "23px",

                          fontSize:
                            "11px",

                          fontWeight:
                            700,

                          color:
                            bildirim.renk,

                          backgroundColor:
                            bildirim.arkaPlan,

                          borderRadius:
                            "6px",
                        }}
                      />


                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            bildirim.renk,

                          fontWeight:
                            700,
                        }}
                      >
                        {formatTarih(
                          bildirim.bitis_tarihi
                        )}
                      </Typography>

                    </Box>


                    {/* MÜŞTERİ */}

                    <Typography
                      sx={{
                        color:
                          "#1e293b",

                        fontWeight:
                          700,

                        fontSize:
                          "14px",
                      }}
                    >
                      {
                        bildirim.musteri_adi
                      }
                    </Typography>


                    {/* ŞUBE */}

                    <Typography
                      sx={{
                        color:
                          "#64748b",

                        fontSize:
                          "13px",

                        mt: 0.2,
                      }}
                    >
                      Şube:{" "}
                      {
                        bildirim.sube_adi
                      }
                    </Typography>


                    {/* YAZARKASA */}

                    <Typography
                      sx={{
                        color:
                          "#475569",

                        fontSize:
                          "12px",

                        mt: 0.7,
                      }}
                    >
                      {bildirim.marka ||
                        "-"}

                      {" • "}

                      Sicil No:{" "}

                      {bildirim.sicil_no ||
                        "-"}
                    </Typography>

                  </Box>

                )
              )}

            </Box>

          )}


          {/* =================================================
              RAPORLARA GİT
          ================================================= */}

          {yazarkasaBildirimleri.length >
            0 && (

            <>

              <Divider />


              <Box
                sx={{
                  p: 1,
                }}
              >

                <MenuItem
                  onClick={() => {

                    handleBildirimClose();

                    navigate(
                      "/raporlar?sekme=yazarkasalar"
                    );

                  }}
                  sx={{
                    justifyContent:
                      "center",

                    borderRadius:
                      "8px",

                    color:
                      "#2563eb",

                    fontWeight:
                      600,

                    fontSize:
                      "13px",
                  }}
                >
                  Raporlara Git
                </MenuItem>

              </Box>

            </>

          )}

        </Menu>


        {/* ===================================================
            KULLANICI
        ==================================================== */}

        <div
          className="user-info"
          onClick={
            handleClick
          }
        >

          <AccountCircleIcon
            className="user-icon"
          />


          <div>

            <p>
              {kullaniciAdi}
            </p>

          </div>


          <KeyboardArrowDownIcon
            className="arrow"
          />

        </div>


        {/* ===================================================
            KULLANICI MENÜSÜ
        ==================================================== */}

        <Menu
          anchorEl={
            anchorEl
          }
          open={
            open
          }
          onClose={
            handleClose
          }
        >

          <MenuItem
            onClick={
              handleProfilOpen
            }
          >

            <PersonIcon
              sx={{
                mr: 1,
              }}
            />

            Profil

          </MenuItem>


          <Divider />


          <MenuItem
            onClick={
              handleLogout
            }
          >

            <LogoutIcon
              sx={{
                mr: 1,
              }}
            />

            Çıkış Yap

          </MenuItem>

        </Menu>


        {/* ===================================================
            PROFİL PENCERESİ
        ==================================================== */}

        <Dialog
          open={
            profilOpen
          }
          onClose={
            handleProfilClose
          }
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius:
                "16px",
            },
          }}
        >

          <DialogTitle
            sx={{
              fontWeight:
                700,

              color:
                "#1e293b",

              pb: 1,
            }}
          >
            Profil
          </DialogTitle>


          <DialogContent>

            <Box
              sx={{
                display:
                  "flex",

                flexDirection:
                  "column",

                alignItems:
                  "center",

                pt: 2,

                pb: 1,
              }}
            >

              {/* PROFİL FOTOĞRAFI */}

              <Avatar
                sx={{
                  width:
                    "72px",

                  height:
                    "72px",

                  mb: 2,

                  backgroundColor:
                    "#2563eb",

                  fontSize:
                    "28px",

                  fontWeight:
                    700,
                }}
              >

                {kullaniciAdi
                  ?.charAt(0)
                  ?.toLocaleUpperCase(
                    "tr-TR"
                  )}

              </Avatar>


              {/* KULLANICI ADI */}

              <Typography
                sx={{
                  fontSize:
                    "20px",

                  fontWeight:
                    700,

                  color:
                    "#1e293b",

                  mb: 0.5,
                }}
              >
                {kullaniciAdi}
              </Typography>


              {/* ROL */}

              <Chip
                label={
                  kullaniciRol
                }
                size="small"
                sx={{
                  mt: 0.5,

                  fontWeight:
                    700,

                  color:
                    "#1d4ed8",

                  backgroundColor:
                    "#eff6ff",

                  borderRadius:
                    "7px",
                }}
              />


              {/* BİLGİLER */}

              <Box
                sx={{
                  width:
                    "100%",

                  mt: 3,

                  border:
                    "1px solid #e2e8f0",

                  borderRadius:
                    "12px",

                  overflow:
                    "hidden",
                }}
              >

                <Box
                  sx={{
                    px: 2,

                    py: 1.5,

                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    borderBottom:
                      "1px solid #f1f5f9",
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
                    Kullanıcı Adı
                  </Typography>


                  <Typography
                    sx={{
                      color:
                        "#1e293b",

                      fontSize:
                        "14px",

                      fontWeight:
                        600,
                    }}
                  >
                    {kullaniciAdi}
                  </Typography>

                </Box>


                <Box
                  sx={{
                    px: 2,

                    py: 1.5,

                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",
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
                    Rol
                  </Typography>


                  <Typography
                    sx={{
                      color:
                        "#1e293b",

                      fontSize:
                        "14px",

                      fontWeight:
                        600,
                    }}
                  >
                    {kullaniciRol}
                  </Typography>

                </Box>

              </Box>

            </Box>

          </DialogContent>


          <DialogActions
            sx={{
              px: 3,
              pb: 3,
            }}
          >

            <Button
              onClick={
                handleProfilClose
              }
              variant="contained"
              sx={{
                textTransform:
                  "none",

                borderRadius:
                  "10px",

                fontWeight:
                  600,

                boxShadow:
                  "none",
              }}
            >
              Kapat
            </Button>

          </DialogActions>

        </Dialog>

      </div>

    </header>

  );

}


export default Header;