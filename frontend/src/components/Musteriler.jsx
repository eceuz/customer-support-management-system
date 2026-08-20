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

import MusteriDialog from "./MusteriDialog";

import {
  getMusteriler,
  createMusteri,
  updateMusteri,
  deleteMusteri,
} from "../api/musteriService";

import { canModify } from "../api/authService";


function Musteriler() {
  const kullaniciDegistirebilir = canModify();

  const [musteriler, setMusteriler] = useState([]);
  const [arama, setArama] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedMusteri, setSelectedMusteri] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  useEffect(() => {
    loadMusteriler();
  }, []);


  const yetkiUyarisiGoster = () => {
    setSnackbar({
      open: true,
      message: "Bu işlemi yapmaya yetkili değilsiniz.",
      severity: "warning",
    });
  };


  const loadMusteriler = async () => {
    try {
      const response = await getMusteriler();
      setMusteriler(response.data);
    } catch (error) {
      console.error(error);

      setSnackbar({
        open: true,
        message: "Müşteri bilgileri alınamadı.",
        severity: "error",
      });
    }
  };


  const handleYeni = () => {
    if (!canModify()) {
      yetkiUyarisiGoster();
      return;
    }

    setDialogMode("create");
    setSelectedMusteri(null);
    setDialogOpen(true);
  };


  const handleEdit = (musteri) => {
    if (!canModify()) {
      yetkiUyarisiGoster();
      return;
    }

    setDialogMode("edit");
    setSelectedMusteri(musteri);
    setDialogOpen(true);
  };


  const handleDeleteClick = (musteri) => {
    if (!canModify()) {
      yetkiUyarisiGoster();
      return;
    }

    setDialogMode("delete");
    setSelectedMusteri(musteri);
    setDialogOpen(true);
  };


  const handleClose = () => {
    setDialogOpen(false);
    setSelectedMusteri(null);
  };


  const handleSave = async (musteri) => {
    try {
      if (dialogMode === "create") {
        await createMusteri(musteri);

        setSnackbar({
          open: true,
          message: "Müşteri eklendi.",
          severity: "success",
        });
      } else {
        await updateMusteri(
          selectedMusteri.musteri_id,
          musteri
        );

        setSnackbar({
          open: true,
          message: "Müşteri güncellendi.",
          severity: "success",
        });
      }

      handleClose();
      loadMusteriler();

    } catch (error) {
      if (error.response?.status === 403) {
        setSnackbar({
          open: true,
          message: "Bu işlemi yapmaya yetkili değilsiniz.",
          severity: "warning",
        });
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
    try {
      await deleteMusteri(
        selectedMusteri.musteri_id
      );

      setSnackbar({
        open: true,
        message: "Müşteri silindi.",
        severity: "success",
      });

      handleClose();
      loadMusteriler();

    } catch (error) {
      if (error.response?.status === 403) {
        setSnackbar({
          open: true,
          message: "Bu işlemi yapmaya yetkili değilsiniz.",
          severity: "warning",
        });
      } else {
        setSnackbar({
          open: true,
          message:
            "Bu müşteriye bağlı şubeler bulunduğu için silinemiyor.",
          severity: "error",
        });
      }
    }
  };


  const filtreliMusteriler = musteriler.filter(
    (musteri) =>
      (musteri.cari_kodu || "")
        .toString()
        .toLowerCase()
        .includes(arama.toLowerCase()) ||

      (musteri.musteri_adi || "")
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
        boxShadow:
          "0px 4px 20px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Üst Kısım */}
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
            Müşteriler
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Sistemdeki cari kayıtlarını buradan
            yönetebilirsiniz.
          </Typography>
        </div>

        {kullaniciDegistirebilir && (
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
            Yeni Müşteri
          </Button>
        )}
      </div>


      {!kullaniciDegistirebilir && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: "10px",
          }}
        >
          Müşteri kayıtlarını görüntüleyebilirsiniz. Ekleme, düzenleme ve silme
          yetkiniz bulunmamaktadır.
        </Alert>
      )}


      {/* Arama Çubuğu */}
      <TextField
        fullWidth
        size="small"
        placeholder="Müşteri Kodu veya Adı ile ara..."
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


      {/* Tablo */}
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
                Müşteri Kodu
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Müşteri Adı
              </TableCell>

              {kullaniciDegistirebilir && (
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
            {filtreliMusteriler.map(
              (musteri) => (
                <TableRow
                  key={musteri.musteri_id}
                  hover
                >
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#334155",
                    }}
                  >
                    {musteri.cari_kodu}
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "#1e293b",
                      fontWeight: 500,
                    }}
                  >
                    {musteri.musteri_adi}
                  </TableCell>

                  {kullaniciDegistirebilir && (
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
                              handleEdit(musteri)
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
                                musteri
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
                  )}
                </TableRow>
              )
            )}


            {filtreliMusteriler.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={kullaniciDegistirebilir ? 3 : 2}
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


      <MusteriDialog
        open={dialogOpen}
        mode={dialogMode}
        selectedMusteri={selectedMusteri}
        onClose={handleClose}
        onSave={handleSave}
        onDelete={handleDelete}
      />


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

export default Musteriler;