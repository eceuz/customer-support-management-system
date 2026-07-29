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
      setMusteriKodu(selectedMusteri._kodu || "");
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "create" && "Yeni Müşteri"}
        {mode === "edit" && "Müşteri Düzenle"}
        {mode === "delete" && "Müşteriyi Sil"}
      </DialogTitle>

      <DialogContent>
        {mode === "delete" ? (
          <Typography sx={{ mt: 1 }}>
            <strong>{selectedMusteri?.musteri_adi}</strong>
            <br />
            <br />
            Bu müşteriyi silmek istediğinize emin misiniz?
          </Typography>
        ) : (
          <>
            <TextField
              label="Müşteri Kodu"
              fullWidth
              margin="normal"
              value={musteriKodu}
              onChange={(e) => setMusteriKodu(e.target.value)}
            />
            <TextField
              label="Müşteri Adı"
              fullWidth
              margin="normal"
              value={musteriAdi}
              onChange={(e) => setMusteriAdi(e.target.value)}
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button
          variant="contained"
          color={mode === "delete" ? "error" : "primary"}
          onClick={handleClick}
        >
          {mode === "create" && "Kaydet"}
          {mode === "edit" && "Güncelle"}
          {mode === "delete" && "Sil"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MusteriDialog;