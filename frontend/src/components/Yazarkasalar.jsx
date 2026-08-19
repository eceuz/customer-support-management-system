import { useEffect, useState } from "react";

import {
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  InputAdornment,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import YazarKasaDialog from "./YazarKasaDialog.jsx";

import api from "../api/api.js";

import {
  getYazarkasalar,
  createYazarkasa,
  updateYazarkasa,
  deleteYazarkasa,
} from "../api/yazarkasaService.js";

import { getSubeler } from "../api/subeService";
import { getUserRole } from "../api/authService";


function Yazarkasalar() {

  const [yazarkasalar, setYazarkasalar] =
    useState([]);

  const [subeler, setSubeler] =
    useState([]);

  const [musteriler, setMusteriler] =
    useState([]);

  const [arama, setArama] =
    useState("");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [dialogMode, setDialogMode] =
    useState("create");

  const [
    selectedYazarkasa,
    setSelectedYazarkasa
  ] = useState(null);

  const [userRole, setUserRole] =
    useState("");

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      message: "",
      severity: "success",
    });


  // =========================================================
  // YETKİ
  // =========================================================

  const canModify =
    userRole === "ADMİN" ||
    userRole === "DESTEK";


  // =========================================================
  // BAŞLANGIÇ
  // =========================================================

  useEffect(() => {

    setUserRole(
      getUserRole() || ""
    );

    loadData();

  }, []);


  // =========================================================
  // VERİLERİ YÜKLE
  // =========================================================

  const loadData = async () => {

    try {

      const [
        yazarkasaRes,
        subeRes,
        musteriRes,
      ] = await Promise.all([

        getYazarkasalar(),

        getSubeler(),

        api.get("/musteriler"),

      ]);


      setYazarkasalar(
        yazarkasaRes.data || []
      );

      setSubeler(
        subeRes.data || []
      );

      setMusteriler(
        musteriRes.data || []
      );

    } catch (error) {

      console.error(
        "Yazarkasa verileri yüklenemedi:",
        error
      );

      setSnackbar({
        open: true,
        message:
          "Yazarkasa kayıtları yüklenemedi.",
        severity: "error",
      });

    }

  };


  // =========================================================
  // ŞUBE BUL
  // =========================================================

  const getSube = (subeId) => {

    return subeler.find(
      (item) =>
        Number(item.sube_id) ===
        Number(subeId)
    );

  };


  const getSubeAdi = (subeId) => {

    const sube =
      getSube(subeId);

    return sube
      ? sube.sube_adi
      : "-";

  };


  // =========================================================
  // MÜŞTERİ BUL
  // =========================================================

  const getMusteri = (musteriId) => {

    return musteriler.find(
      (item) =>
        Number(item.musteri_id) ===
        Number(musteriId)
    );

  };


  const getMusteriAdi = (subeId) => {

    const sube =
      getSube(subeId);

    if (!sube) {
      return "-";
    }


    const musteri =
      getMusteri(
        sube.musteri_id
      );


    if (!musteri) {
      return "-";
    }


    return (
      musteri.musteri_adi ||
      musteri.cari_adi ||
      "-"
    );

  };


  // =========================================================
  // TARİH FORMATLA
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }


    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "tr-TR"
    );

  };


  // =========================================================
  // YENİ KAYIT
  // =========================================================

  const handleYeni = () => {

    if (!canModify) {
      return;
    }


    setDialogMode(
      "create"
    );

    setSelectedYazarkasa(
      null
    );

    setDialogOpen(
      true
    );

  };


  // =========================================================
  // DÜZENLE
  // =========================================================

  const handleEdit = (yazarkasa) => {

    if (!canModify) {
      return;
    }


    setDialogMode(
      "edit"
    );

    setSelectedYazarkasa(
      yazarkasa
    );

    setDialogOpen(
      true
    );

  };


  // =========================================================
  // SİLME PENCERESİ
  // =========================================================

  const handleDeleteClick = (
    yazarkasa
  ) => {

    if (!canModify) {
      return;
    }


    setDialogMode(
      "delete"
    );

    setSelectedYazarkasa(
      yazarkasa
    );

    setDialogOpen(
      true
    );

  };


  // =========================================================
  // DIALOG KAPAT
  // =========================================================

  const handleClose = () => {

    setDialogOpen(
      false
    );

    setSelectedYazarkasa(
      null
    );

  };


  // =========================================================
  // KAYDET / GÜNCELLE
  // =========================================================

  const handleSave = async (
    formData
  ) => {

    if (!canModify) {
      return;
    }


    try {

      if (
        dialogMode === "create"
      ) {

        await createYazarkasa(
          formData
        );


        setSnackbar({
          open: true,
          message:
            "Yazarkasa kaydı eklendi.",
          severity: "success",
        });

      } else {

        await updateYazarkasa(
          selectedYazarkasa.yazarkasa_id,
          formData
        );


        setSnackbar({
          open: true,
          message:
            "Yazarkasa kaydı güncellendi.",
          severity: "success",
        });

      }


      handleClose();

      await loadData();


    } catch (error) {

      console.error(
        "Yazarkasa işlemi başarısız:",
        error
      );


      setSnackbar({
        open: true,
        message:
          error.response?.data?.detail ||
          "İşlem başarısız.",
        severity: "error",
      });

    }

  };


  // =========================================================
  // SİL
  // =========================================================

  const handleDelete = async () => {

    if (
      !canModify ||
      !selectedYazarkasa
    ) {
      return;
    }


    try {

      await deleteYazarkasa(
        selectedYazarkasa.yazarkasa_id
      );


      setSnackbar({
        open: true,
        message:
          "Yazarkasa kaydı silindi.",
        severity: "success",
      });


      handleClose();

      await loadData();


    } catch (error) {

      console.error(
        "Yazarkasa silinemedi:",
        error
      );


      setSnackbar({
        open: true,
        message:
          error.response?.data?.detail ||
          "Yazarkasa kaydı silinemedi.",
        severity: "error",
      });

    }

  };


  // =========================================================
  // ARAMA
  // =========================================================

  const filtreliYazarkasalar =
    yazarkasalar.filter(
      (item) => {

        const search =
          arama
            .trim()
            .toLocaleLowerCase(
              "tr-TR"
            );


        const aranacakMetin = [

          item.marka,

          item.sicil_no,

          item.kayitli_tel_no,

          getSubeAdi(
            item.sube_id
          ),

          getMusteriAdi(
            item.sube_id
          ),

        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase(
            "tr-TR"
          );


        return aranacakMetin.includes(
          search
        );

      }
    );


  // =========================================================
  // EKRAN
  // =========================================================

  return (

    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        border:
          "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow:
          "0px 4px 20px rgba(0, 0, 0, 0.02)",
      }}
    >

      {/* =====================================================
          BAŞLIK
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "16px",
        }}
      >

        <div>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            Yazarkasalar
          </Typography>


          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Sistemdeki yazarkasa
            kayıtlarını buradan
            yönetebilirsiniz.
          </Typography>

        </div>


        {canModify && (

          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              handleYeni
            }
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",

              "&:hover": {
                boxShadow:
                  "0px 4px 12px rgba(25, 118, 210, 0.2)",
              },
            }}
          >
            Yeni Yazarkasa
          </Button>

        )}

      </div>


      {/* =====================================================
          İZLEYİCİ BİLGİLENDİRMESİ
      ====================================================== */}

      {!canModify && (

        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: "10px",
          }}
        >
          Yazarkasa kayıtlarını
          görüntüleyebilirsiniz.
          Ekleme, düzenleme ve
          silme yetkiniz bulunmamaktadır.
        </Alert>

      )}


      {/* =====================================================
          ARAMA
      ====================================================== */}

      <TextField
        fullWidth
        size="small"
        placeholder="Müşteri, şube, marka, sicil no veya telefon ara..."
        value={arama}
        onChange={(e) =>
          setArama(
            e.target.value
          )
        }
        sx={{
          mb: 3,
          maxWidth: "600px",
        }}
        slotProps={{
          input: {

            startAdornment: (

              <InputAdornment
                position="start"
              >

                <SearchIcon
                  fontSize="small"
                  sx={{
                    color: "#94a3b8",
                  }}
                />

              </InputAdornment>

            ),

          },
        }}
      />


      {/* =====================================================
          TABLO
      ====================================================== */}

      <TableContainer>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Müşteri
              </TableCell>


              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Şube
              </TableCell>


              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Marka
              </TableCell>


              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Sicil No
              </TableCell>


              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Başlangıç
              </TableCell>


              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Bitiş
              </TableCell>


              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Kayıtlı Tel
              </TableCell>


              {canModify && (

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    width: "120px",
                  }}
                >
                  İşlemler
                </TableCell>

              )}

            </TableRow>

          </TableHead>


          <TableBody>

            {filtreliYazarkasalar.map(
              (item) => (

                <TableRow
                  key={
                    item.yazarkasa_id
                  }
                  hover
                >

                  {/* MÜŞTERİ */}

                  <TableCell
                    sx={{
                      color: "#1e293b",
                      fontWeight: 500,
                    }}
                  >
                    {getMusteriAdi(
                      item.sube_id
                    )}
                  </TableCell>


                  {/* ŞUBE */}

                  <TableCell
                    sx={{
                      color: "#1e293b",
                      fontWeight: 500,
                    }}
                  >
                    {getSubeAdi(
                      item.sube_id
                    )}
                  </TableCell>


                  {/* MARKA */}

                  <TableCell
                    sx={{
                      color: "#1e293b",
                      fontWeight: 500,
                    }}
                  >
                    {item.marka}
                  </TableCell>


                  {/* SİCİL */}

                  <TableCell
                    sx={{
                      color: "#334155",
                      fontWeight: 500,
                    }}
                  >
                    {item.sicil_no}
                  </TableCell>


                  {/* BAŞLANGIÇ */}

                  <TableCell
                    sx={{
                      color: "#475569",
                    }}
                  >
                    {formatDate(
                      item.baslangic_tarihi
                    )}
                  </TableCell>


                  {/* BİTİŞ */}

                  <TableCell
                    sx={{
                      color: "#475569",
                    }}
                  >
                    {formatDate(
                      item.bitis_tarihi
                    )}
                  </TableCell>


                  {/* TELEFON */}

                  <TableCell
                    sx={{
                      color: "#475569",
                    }}
                  >
                    {item.kayitli_tel_no ||
                      "-"}
                  </TableCell>


                  {/* =================================================
                      SADECE ADMİN / DESTEK
                  ================================================= */}

                  {canModify && (

                    <TableCell
                      align="center"
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "center",
                          gap: "6px",
                          alignItems:
                            "center",
                        }}
                      >

                        <Tooltip
                          title="Düzenle"
                          arrow
                        >

                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                            sx={{
                              backgroundColor:
                                "rgba(25, 118, 210, 0.04)",

                              "&:hover": {
                                backgroundColor:
                                  "rgba(25, 118, 210, 0.12)",
                              },
                            }}
                          >

                            <EditIcon
                              fontSize="small"
                            />

                          </IconButton>

                        </Tooltip>


                        <Tooltip
                          title="Sil"
                          arrow
                        >

                          <IconButton
                            color="error"
                            size="small"
                            onClick={() =>
                              handleDeleteClick(
                                item
                              )
                            }
                            sx={{
                              backgroundColor:
                                "rgba(211, 47, 47, 0.04)",

                              "&:hover": {
                                backgroundColor:
                                  "rgba(211, 47, 47, 0.12)",
                              },
                            }}
                          >

                            <DeleteIcon
                              fontSize="small"
                            />

                          </IconButton>

                        </Tooltip>

                      </div>

                    </TableCell>

                  )}

                </TableRow>

              )
            )}


            {/* KAYIT YOK */}

            {filtreliYazarkasalar.length ===
              0 && (

              <TableRow>

                <TableCell
                  colSpan={
                    canModify
                      ? 8
                      : 7
                  }
                  align="center"
                  sx={{
                    py: 6,
                  }}
                >

                  <Typography
                    color="text.secondary"
                  >
                    Kayıt bulunamadı.
                  </Typography>

                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </TableContainer>


      {/* =====================================================
          DIALOG
      ====================================================== */}

      {canModify && (

        <YazarKasaDialog
          open={
            dialogOpen
          }
          mode={
            dialogMode
          }
          selectedYazarkasa={
            selectedYazarkasa
          }
          musteriler={
            musteriler
          }
          subeler={
            subeler
          }
          onClose={
            handleClose
          }
          onSave={
            handleSave
          }
          onDelete={
            handleDelete
          }
        />

      )}


      {/* =====================================================
          BİLDİRİM
      ====================================================== */}

      <Snackbar
        open={
          snackbar.open
        }
        autoHideDuration={
          3000
        }
        onClose={() =>
          setSnackbar(
            (onceki) => ({
              ...onceki,
              open: false,
            })
          )
        }
      >

        <Alert
          severity={
            snackbar.severity
          }
          variant="filled"
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Paper>

  );

}


export default Yazarkasalar;