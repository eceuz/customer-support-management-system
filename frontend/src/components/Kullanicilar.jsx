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

import KullaniciDialog from "./KullaniciDialog";

import {
  getKullanicilar,
  createKullanici,
  updateKullanici,
  deleteKullanici,
} from "../api/kullaniciService";

function Kullanicilar() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [arama, setArama] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedKullanici, setSelectedKullanici] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadKullanicilar();
  }, []);

  const loadKullanicilar = async () => {
    try {
      const response = await getKullanicilar();
      setKullanicilar(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleYeni = () => {
    setDialogMode("create");
    setSelectedKullanici(null);
    setDialogOpen(true);
  };

  const handleEdit = (kullanici) => {
    setDialogMode("edit");
    setSelectedKullanici(kullanici);
    setDialogOpen(true);
  };

  const handleDeleteClick = (kullanici) => {
    setDialogMode("delete");
    setSelectedKullanici(kullanici);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedKullanici(null);
  };

  const handleSave = async (kullanici) => {
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
    } catch {
      setSnackbar({
        open: true,
        message: "İşlem başarısız.",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteKullanici(selectedKullanici.kullanici_id);
      setSnackbar({
        open: true,
        message: "Kullanıcı silindi.",
        severity: "success",
      });

      handleClose();
      loadKullanicilar();
    } catch {
      setSnackbar({
        open: true,
        message: "Kullanıcı silinemedi.",
        severity: "error",
      });
    }
  };

  const filtreliKullanicilar = kullanicilar.filter((kullanici) =>
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
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)"
      }}
    >
      {/* Üst Kısım / Başlık ve Ekle Butonu */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Kullanıcı Ayarları
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Sistemdeki personel ve kullanıcı hesaplarını buradan yönetebilirsiniz.
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
            "&:hover": { boxShadow: "0px 4px 12px rgba(25, 118, 210, 0.2)" }
          }}
        >
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Arama Çubuğu */}
      <TextField
        fullWidth
        size="small"
        placeholder="Kullanıcı ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        sx={{ mb: 3, maxWidth: "400px" }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Tablo Alanı */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Kullanıcı Adı</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: "#475569", width: "120px" }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtreliKullanicilar.map((kullanici) => (
              <TableRow
                key={kullanici.kullanici_id}
                hover
              >
                <TableCell sx={{ color: "#1e293b", fontWeight: 500 }}>
                  {kullanici.kullanici_adi}
                </TableCell>
                <TableCell align="center">
                  <div style={{ display: "flex", justifyContent: "center", gap: "6px", alignItems: "center" }}>
                    <Tooltip title="Düzenle" arrow>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(kullanici)}
                        sx={{
                          backgroundColor: "rgba(25, 118, 210, 0.04)",
                          "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.12)" }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Sil" arrow>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(kullanici)}
                        sx={{
                          backgroundColor: "rgba(211, 47, 47, 0.04)",
                          "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.12)" }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtreliKullanicilar.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{ py: 6 }}
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

      <KullaniciDialog
        open={dialogOpen}
        mode={dialogMode}
        selectedKullanici={selectedKullanici}
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

export default Kullanicilar;