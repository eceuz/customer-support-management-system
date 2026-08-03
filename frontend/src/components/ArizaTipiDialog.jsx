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

function ArizaTipiDialog({
  open,
  mode,
  selectedArizaTipi,
  onClose,
  onSave,
  onDelete,
}) {
  const [arizaTipi, setArizaTipi] = useState("");

  useEffect(() => {
    if (selectedArizaTipi) {
      setArizaTipi(selectedArizaTipi.ariza_tipi_adi);
    } else {
      setArizaTipi("");
    }
  }, [selectedArizaTipi, open]);

  const handleSave = () => {
    onSave({
      ariza_tipi_adi: arizaTipi,
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
        {mode === "create" && "Yeni Arıza Tipi Ekle"}
        {mode === "edit" && "Arıza Tipini Düzenle"}
        {mode === "delete" && "Arıza Tipini Sil"}
      </DialogTitle>

      {mode === "delete" ? (
        <>
          <DialogContent>
            <Typography sx={{ mt: 1, color: "#475569" }}>
              <strong>{selectedArizaTipi?.ariza_tipi_adi}</strong> arıza tipini silmek istediğinize emin misiniz?
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
              label="Arıza Tipi Adı"
              fullWidth
              margin="normal"
              size="small"
              value={arizaTipi}
              onChange={(e) =>
                setArizaTipi(e.target.value)
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

export default ArizaTipiDialog;