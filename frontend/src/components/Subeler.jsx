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

import SubeDialog from "./SubeDialog";

import {
  getTumSubeler,
  createSube,
  updateSube,
  deleteSube,
} from "../api/subeService";

import { getMusteriler } from "../api/musteriService";
import { canModify } from "../api/authService";


function Subeler() {
  const [subeler, setSubeler] = useState([]);
  const [musteriler, setMusteriler] = useState([]);
  const [arama, setArama] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedSube, setSelectedSube] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  useEffect(() => {
    loadSubeler();
    loadMusteriler();
  }, []);


  const yetkiUyarisiGoster = () => {
    setSnackbar({
      open: true,
      message: "Bu işlemi yapmaya yetkili değilsiniz.",
      severity: "warning",
    });
  };


  const loadSubeler = async () => {
    try {
      const response = await getTumSubeler();
      setSubeler(response.data);
    } catch (error) {
      console.error(error);

      setSnackbar({
        open: true,
        message: "Şube bilgileri alınamadı.",
        severity: "error",
      });
    }
  };


  const loadMusteriler = async () => {
    try {
      const response = await getMusteriler();
      setMusteriler(response.data);
    } catch (error) {
      console.error(error);
    }
  };


  const handleYeni = () => {
    if (!canModify()) {
      yetkiUyarisiGoster();
      return;
    }

    setDialogMode("create");
    setSelectedSube(null);
    setDialogOpen(true);
  };


  const handleEdit = (sube) => {
    if (!canModify()) {
      yetkiUyarisiGoster();
      return;
    }

    setDialogMode("edit");
    setSelectedSube(sube);
    setDialogOpen(true);
  };


  const handleDeleteClick = (sube) => {
    if (!canModify()) {
      yetkiUyarisiGoster();
      return;
    }

    setDialogMode("delete");
    setSelectedSube(sube);
    setDialogOpen(true);
  };


  const handleClose = () => {
    setDialogOpen(false);
    setSelectedSube(null);
  };


  const handleSave = async (sube) => {
    try {
      if (dialogMode === "create") {
        await createSube(sube);

        setSnackbar({
          open: true,
          message: "Şube eklendi.",
          severity: "success",
        });
      } else {
        await updateSube(
          selectedSube.sube_id,
          sube
        );

        setSnackbar({
          open: true,
          message: "Şube güncellendi.",
          severity: "success",
        });
      }

      handleClose();
      loadSubeler();

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
      await deleteSube(
        selectedSube.sube_id
      );

      setSnackbar({
        open: true,
        message: "Şube silindi.",
        severity: "success",
      });

      handleClose();
      loadSubeler();

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
            "Bu şubeye bağlı çağrı kayıtları bulunduğu için silinemiyor.",
          severity: "error",
        });
      }
    }
  };


  const filtreliSubeler = subeler.filter((sube) => {
    const musteri = musteriler.find(
      (m) => m.musteri_id === sube.musteri_id
    );

    return (
      (sube.sube_kodu || "")
        .toString()
        .toLowerCase()
        .includes(arama.toLowerCase()) ||

      (sube.sube_adi || "")
        .toLowerCase()
        .includes(arama.toLowerCase()) ||

      (musteri?.musteri_adi || "")
        .toLowerCase()
        .includes(arama.toLowerCase())
    );
  });


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
            Şubeler
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Sistemdeki tüm şubeleri ve telefon destek anlaşmalarını
            buradan yönetebilirsiniz.
          </Typography>
        </div>

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
          Yeni Şube
        </Button>
      </div>


      {/* Arama Çubuğu */}
      <TextField
        fullWidth
        size="small"
        placeholder="Şube Kodu, Cari veya Şube Adı ile ara..."
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
                Şube Kodu
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Cari Adı
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Şube Adı
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Telefon Destek Anlaşması
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
            {filtreliSubeler.map((sube) => {
              const musteri = musteriler.find(
                (m) => m.musteri_id === sube.musteri_id
              );

              return (
                <TableRow
                  key={sube.sube_id}
                  hover
                >
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#334155",
                    }}
                  >
                    {sube.sube_kodu}
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "#1e293b",
                      fontWeight: 500,
                    }}
                  >
                    {musteri?.musteri_adi}
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "#1e293b",
                      fontWeight: 500,
                    }}
                  >
                    {sube.sube_adi}
                  </TableCell>

                  <TableCell>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        backgroundColor:
                          sube.bakim_anlasmasi_var_mi
                            ? "rgba(46, 125, 50, 0.08)"
                            : "rgba(211, 47, 47, 0.08)",
                        color:
                          sube.bakim_anlasmasi_var_mi
                            ? "#2e7d32"
                            : "#d32f2f",
                      }}
                    >
                      {sube.bakim_anlasmasi_var_mi
                        ? "Var"
                        : "Yok"}
                    </span>
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
                            handleEdit(sube)
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
                            handleDeleteClick(sube)
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
              );
            })}


            {filtreliSubeler.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
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


      <SubeDialog
        open={dialogOpen}
        mode={dialogMode}
        selectedSube={selectedSube}
        musteriler={musteriler}
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

export default Subeler;