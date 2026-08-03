import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";

function KullaniciDialog({
  open,
  mode,
  selectedKullanici,
  onClose,
  onSave,
  onDelete,
}) {
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");

  useEffect(() => {
    if (selectedKullanici) {
      setKullaniciAdi(selectedKullanici.kullanici_adi);
      setSifre(selectedKullanici.sifre);
    } else {
      setKullaniciAdi("");
      setSifre("");
    }
  }, [selectedKullanici, open]);

  const handleSave = () => {
    onSave({
      kullanici_adi: kullaniciAdi,
      sifre: sifre,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "#1e293b" }}>
        {mode === "create" && "Yeni Kullanıcı Ekle"}
        {mode === "edit" && "Kullanıcı Bilgilerini Düzenle"}
        {mode === "delete" && "Kullanıcıyı Sil"}
      </DialogTitle>

      {mode === "delete" ? (
        <>
          <DialogContent>
            <Typography sx={{ mt: 1, color: "#475569" }}>
              <strong>{selectedKullanici?.kullanici_adi}</strong> kullanıcısını silmek istediğinize emin misiniz?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={onClose}
              sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}
            >
              Vazgeç
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={onDelete}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              Evet, Sil
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent>
            <TextField
              label="Kullanıcı Adı"
              fullWidth
              margin="normal"
              size="small"
              value={kullaniciAdi}
              onChange={(e) =>
                setKullaniciAdi(e.target.value)
              }
            />
            <TextField
              label="Şifre"
              type="password"
              fullWidth
              margin="normal"
              size="small"
              value={sifre}
              onChange={(e) =>
                setSifre(e.target.value)
              }
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={onClose}
              sx={{ color: "#64748b", textTransform: "none", fontWeight: 600 }}
            >
              Vazgeç
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              {mode === "create" && "Kaydet"}
              {mode === "edit" && "Güncellemeyi Kaydet"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default KullaniciDialog;