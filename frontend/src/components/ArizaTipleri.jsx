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

import ArizaTipiDialog from "./ArizaTipiDialog";

import {
  getArizaTipleri,
  createArizaTipi,
  updateArizaTipi,
  deleteArizaTipi,
} from "../api/arizaService";

import { canModify } from "../api/authService";


function ArizaTipleri() {
  const [arizaTipleri, setArizaTipleri] = useState([]);
  const [arama, setArama] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedArizaTipi, setSelectedArizaTipi] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  useEffect(() => {
    loadArizaTipleri();
  }, []);


  const yetkiUyarisiGoster = () => {
    setSnackbar({
      open: true,
      message: "Bu işlemi yapmaya yetkili değilsiniz.",
      severity: "warning",
    });
  };


  const loadArizaTipleri = async () => {
    try {
      const response = await getArizaTipleri();
      setArizaTipleri(response.data);
    } catch (error) {
      console.error(error);

      setSnackbar({
        open: true,
        message: "Arıza tipi bilgileri alınamadı.",
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
    setSelectedArizaTipi(null);
    setDialogOpen(true);
  };


  const handleEdit = (arizaTipi) => {
    if (!canModify()) {
      yetkiUyarisiGoster();
      return;
    }

    setDialogMode("edit");
    setSelectedArizaTipi(arizaTipi);
    setDialogOpen(true);
  };


  const handleDeleteClick = (arizaTipi) => {
    if (!canModify()) {
      yetkiUyarisiGoster();
      return;
    }

    setDialogMode("delete");
    setSelectedArizaTipi(arizaTipi);
    setDialogOpen(true);
  };


  const handleClose = () => {
    setDialogOpen(false);
    setSelectedArizaTipi(null);
  };


  const handleSave = async (arizaTipi) => {
    try {
      if (dialogMode === "create") {
        await createArizaTipi(arizaTipi);

        setSnackbar({
          open: true,
          message: "Arıza tipi eklendi.",
          severity: "success",
        });
      } else {
        await updateArizaTipi(
          selectedArizaTipi.ariza_tipi_id,
          arizaTipi
        );

        setSnackbar({
          open: true,
          message: "Arıza tipi güncellendi.",
          severity: "success",
        });
      }

      handleClose();
      loadArizaTipleri();

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
      await deleteArizaTipi(
        selectedArizaTipi.ariza_tipi_id
      );

      setSnackbar({
        open: true,
        message: "Arıza tipi silindi.",
        severity: "success",
      });

      handleClose();
      loadArizaTipleri();

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
          message: "Bu arıza tipi kullanıldığı için silinemiyor.",
          severity: "error",
        });
      }
    }
  };


  const filtreliArizaTipleri = arizaTipleri.filter((tip) =>
    (tip.ariza_tipi_adi || "")
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
            Arıza Tipleri
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 0.5,
            }}
          >
            Sistemde yer alan arıza ve destek türlerini buradan
            yönetebilirsiniz.
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
          Yeni Arıza Tipi
        </Button>
      </div>


      {/* Arama Çubuğu */}
      <TextField
        fullWidth
        size="small"
        placeholder="Arıza tipi ara..."
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
                Arıza Tipi
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
            {filtreliArizaTipleri.map((tip) => (
              <TableRow
                key={tip.ariza_tipi_id}
                hover
              >
                <TableCell
                  sx={{
                    color: "#1e293b",
                    fontWeight: 500,
                  }}
                >
                  {tip.ariza_tipi_adi}
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
                          handleEdit(tip)
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
                          handleDeleteClick(tip)
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
            ))}


            {filtreliArizaTipleri.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
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


      <ArizaTipiDialog
        open={dialogOpen}
        mode={dialogMode}
        selectedArizaTipi={selectedArizaTipi}
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

export default ArizaTipleri;