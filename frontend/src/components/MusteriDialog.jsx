import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

function MusteriDialog({
  open,
  onClose,
  onSave,
  onDelete,
  selectedMusteri,
  mode,
}) {
  const [musteriKodu, setMusteriKodu] = useState("");
  const [musteriAdi, setMusteriAdi] = useState("");

  useEffect(() => {
    if (selectedMusteri) {
      // DÜZELTME: _kodu yerine cari_kodu kullanıldı (Müşteri Kodu artık dolu gelecek)
      setMusteriKodu(selectedMusteri.cari_kodu || "");
      setMusteriAdi(selectedMusteri.musteri_adi || "");
    } else {
      setMusteriKodu("");
      setMusteriAdi("");
    }
  }, [selectedMusteri, open]);

  const handleClick = () => {
    if (mode === "delete") {
      onDelete();
      return;
    }

    if (musteriAdi.trim() === "") return;

    onSave({
      cari_kodu: musteriKodu,
      musteri_adi: musteriAdi,
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
        {mode === "create" && "Yeni Müşteri Ekle"}
        {mode === "edit" && "Müşteri Bilgilerini Düzenle"}
        {mode === "delete" && "Müşteriyi Sil"}
      </DialogTitle>

      <DialogContent>
        {mode === "delete" ? (
          <Typography sx={{ mt: 1, color: "#475569" }}>
            <strong>{selectedMusteri?.musteri_adi}</strong> adlı müşteriyi silmek istediğinize emin misiniz?
          </Typography>
        ) : (
          <>
            <TextField
              label="Müşteri Kodu"
              fullWidth
              margin="normal"
              size="small"
              value={musteriKodu}
              onChange={(e) => setMusteriKodu(e.target.value)}
            />
            <TextField
              label="Müşteri Adı"
              fullWidth
              margin="normal"
              size="small"
              value={musteriAdi}
              onChange={(e) => setMusteriAdi(e.target.value)}
            />
          </>
        )}
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
          color={mode === "delete" ? "error" : "primary"}
          onClick={handleClick}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
          }}
        >
          {mode === "create" && "Kaydet"}
          {mode === "edit" && "Güncellemeyi Kaydet"}
          {mode === "delete" && "Evet, Sil"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MusteriDialog;