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
  Box,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import KullaniciDialog from "./KullaniciDialog";

import {
  getKullanicilar,
  createKullanici,
  updateKullanici,
  deleteKullanici,
} from "../api/kullaniciService";

import { isAdmin } from "../api/authService";


function Kullanicilar() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [arama, setArama] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedKullanici, setSelectedKullanici] = useState(null);

  const [yetkiYok, setYetkiYok] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  useEffect(() => {
    loadKullanicilar();
  }, []);


  const loadKullanicilar = async () => {
    // Admin değilse kullanıcı listesini hiç istemiyoruz
    if (!isAdmin()) {
      setKullanicilar([]);
      setYetkiYok(true);
      return;
    }

    try {
      const response = await getKullanicilar();

      setKullanicilar(response.data);
      setYetkiYok(false);

    } catch (error) {
      console.error(error);

      if (error.response?.status === 403) {
        setKullanicilar([]);
        setYetkiYok(true);
      } else {
        setSnackbar({
          open: true,
          message: "Kullanıcı bilgileri alınamadı.",
          severity: "error",
        });
      }
    }
  };


  const handleYeni = () => {
    if (!isAdmin()) {
      setYetkiYok(true);
      return;
    }

    setDialogMode("create");
    setSelectedKullanici(null);
    setDialogOpen(true);
  };


  const handleEdit = (kullanici) => {
    if (!isAdmin()) {
      setYetkiYok(true);
      return;
    }

    setDialogMode("edit");
    setSelectedKullanici(kullanici);
    setDialogOpen(true);
  };


  const handleDeleteClick = (kullanici) => {
    if (!isAdmin()) {
      setYetkiYok(true);
      return;
    }

    setDialogMode("delete");
    setSelectedKullanici(kullanici);
    setDialogOpen(true);
  };


  const handleClose = () => {
    setDialogOpen(false);
    setSelectedKullanici(null);
  };


  const handleSave = async (kullanici) => {
    if (!isAdmin()) {
      setYetkiYok(true);
      return;
    }

    try {
      if (dialogMode === "create") {
        await createKullanici(kullanici);

        setSnackbar({
          open: true,
          message: "Kullanıcı eklendi.",
          severity: "success",
        });

      } else {
        await updateKullanici(
          selectedKullanici.kullanici_id,
          kullanici
        );

        setSnackbar({
          open: true,
          message: "Kullanıcı güncellendi.",
          severity: "success",
        });
      }

      handleClose();
      loadKullanicilar();

    } catch (error) {
      if (error.response?.status === 403) {
        handleClose();
        setYetkiYok(true);
      } else {
        setSnackbar({
          open: true,
          message: "İşlem başarısız.",
          severity: "error",
        });
      }
    }
  };


  const handleDelete = async () => {
    if (!isAdmin()) {
      setYetkiYok(true);
      return;
    }

    try {
      await deleteKullanici(
        selectedKullanici.kullanici_id
      );

      setSnackbar({
        open: true,
        message: "Kullanıcı silindi.",
        severity: "success",
      });

      handleClose();
      loadKullanicilar();

    } catch (error) {
      if (error.response?.status === 403) {
        handleClose();
        setYetkiYok(true);
      } else {
        setSnackbar({
          open: true,
          message: "Kullanıcı silinemedi.",
          severity: "error",
        });
      }
    }
  };


  const filtreliKullanicilar = kullanicilar.filter(
    (kullanici) =>
      (kullanici.kullanici_adi || "")
        .toLowerCase()
        .includes(arama.toLowerCase())
  );


  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* BAŞLIK */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
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
            Kullanıcılar
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Sistemdeki personel ve kullanıcı hesaplarını
            buradan yönetebilirsiniz.
          </Typography>
        </div>


        {/* Yeni Kullanıcı butonu sadece admin görür */}
        {!yetkiYok && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleYeni}
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
            Yeni Kullanıcı
          </Button>
        )}
      </div>


      {/* YETKİ YOKSA BU EKRAN GÖRÜNÜR */}
      {yetkiYok ? (
        <Box
          sx={{
            mt: 4,
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Alert
            severity="warning"
            icon={
              <LockOutlinedIcon
                sx={{
                  fontSize: "32px",
                }}
              />
            }
            sx={{
              width: "100%",
              maxWidth: "650px",
              py: 3,
              px: 3,
              borderRadius: "14px",
              alignItems: "center",
              fontSize: "16px",
            }}
          >
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Bu sayfayı görüntülemeye yetkiniz bulunmuyor.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "inherit",
              }}
            >
              Kullanıcı hesaplarını yalnızca admin yetkisine
              sahip kullanıcılar görüntüleyebilir ve yönetebilir.
            </Typography>
          </Alert>
        </Box>
      ) : (
        <>
          {/* ARAMA ÇUBUĞU */}
          <TextField
            fullWidth
            size="small"
            placeholder="Kullanıcı ara..."
            value={arama}
            onChange={(e) =>
              setArama(e.target.value)
            }
            sx={{
              mb: 3,
              maxWidth: "400px",
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
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


          {/* KULLANICI TABLOSU */}
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
                    Kullanıcı Adı
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  >
                    Rol
                  </TableCell>

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
                </TableRow>
              </TableHead>


              <TableBody>
                {filtreliKullanicilar.map(
                  (kullanici) => (
                    <TableRow
                      key={kullanici.kullanici_id}
                      hover
                    >
                      <TableCell
                        sx={{
                          color: "#1e293b",
                          fontWeight: 500,
                        }}
                      >
                        {kullanici.kullanici_adi}
                      </TableCell>


                      <TableCell
                        sx={{
                          color: "#475569",
                          fontWeight: 500,
                        }}
                      >
                        {kullanici.rol === "ADMİN"
                          ? "ADMİN"
                          : kullanici.rol === "İZLEYİCİ"
                          ? "İZLEYİCİ"
                          : "DESTEK"}
                      </TableCell>


                      <TableCell align="center">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "6px",
                            alignItems: "center",
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
                                handleEdit(kullanici)
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
                              <EditIcon fontSize="small" />
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
                                  kullanici
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
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}


                {filtreliKullanicilar.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        py: 6,
                      }}
                    >
                      <Typography color="text.secondary">
                        Kayıt bulunamadı.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}


      {/* DIALOG */}
      <KullaniciDialog
        open={dialogOpen}
        mode={dialogMode}
        selectedKullanici={selectedKullanici}
        onClose={handleClose}
        onSave={handleSave}
        onDelete={handleDelete}
      />


      {/* Başarı / normal hata mesajları */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default Kullanicilar;