import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";

function SubeDialog({
  open,
  mode,
  selectedSube,
  musteriler,
  onClose,
  onSave,
  onDelete,
}) {
  const [musteriId, setMusteriId] = useState("");
  const [subeKodu, setSubeKodu] = useState("");
  const [subeAdi, setSubeAdi] = useState("");
  const [bakimAnlasmasi, setBakimAnlasmasi] = useState(false);

  useEffect(() => {
    if (selectedSube) {
      setMusteriId(selectedSube.musteri_id);
      setSubeKodu(selectedSube.sube_kodu || "");
      setSubeAdi(selectedSube.sube_adi);
      setBakimAnlasmasi(selectedSube.bakim_anlasmasi_var_mi);
    } else {
      setMusteriId("");
      setSubeKodu("");
      setSubeAdi("");
      setBakimAnlasmasi(false);
    }
  }, [selectedSube, open]);

  const handleSave = () => {
    onSave({
      musteri_id: musteriId,
      sube_kodu: subeKodu === "" ? null : Number(subeKodu),
      sube_adi: subeAdi,
      bakim_anlasmasi_var_mi: bakimAnlasmasi,
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
        {mode === "create" && "Yeni Şube Ekle"}
        {mode === "edit" && "Şube Bilgilerini Düzenle"}
        {mode === "delete" && "Şubeyi Sil"}
      </DialogTitle>

      {mode === "delete" ? (
        <>
          <DialogContent>
            <Typography sx={{ mt: 1, color: "#475569" }}>
              <strong>{selectedSube?.sube_adi}</strong> şubesini silmek istediğinize emin misiniz?
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
            <Autocomplete
  options={musteriler}
  getOptionLabel={(option) => option.musteri_adi || ""}
  isOptionEqualToValue={(option, value) =>
    option.musteri_id === value.musteri_id
  }
  value={
    musteriler.find(
      (m) => m.musteri_id === musteriId
    ) || null
  }
  onChange={(event, value) => {
    setMusteriId(value ? value.musteri_id : "");
  }}
  renderOption={(props, option) => (
    <li {...props} key={option.musteri_id}>
      {option.musteri_adi}
    </li>
  )}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Cari Seçin"
      margin="normal"
      size="small"
      fullWidth
    />
  )}
/>
            <TextField
              label="Şube Kodu"
              fullWidth
              margin="normal"
              size="small"
              type="number"
              value={subeKodu}
              onChange={(e) => setSubeKodu(e.target.value)}
            />

            <TextField
              label="Şube Adı"
              fullWidth
              margin="normal"
              size="small"
              value={subeAdi}
              onChange={(e) => setSubeAdi(e.target.value)}
            />

            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Checkbox
                  checked={bakimAnlasmasi}
                  onChange={(e) =>
                    setBakimAnlasmasi(e.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                <Typography sx={{ fontSize: "0.95rem", color: "#334155", fontWeight: 500 }}>
                  Telefon Destek Anlaşması Var
                </Typography>
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

export default SubeDialog;