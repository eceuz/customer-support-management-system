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
    >

      <DialogTitle>

        {mode === "create" && "Yeni Şube"}

        {mode === "edit" && "Şube Düzenle"}

        {mode === "delete" && "Şube Sil"}

      </DialogTitle>

      {mode === "delete" ? (

        <>
          <DialogContent>

            <Typography>

              <b>{selectedSube?.sube_adi}</b> şubesini silmek istediğinize emin misiniz?

            </Typography>

          </DialogContent>

          <DialogActions>

            <Button onClick={onClose}>
              Vazgeç
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={onDelete}
            >
              Sil
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cari"
                  margin="normal"
                />
              )}
            />

            <TextField
              label="Şube Kodu"
              fullWidth
              margin="normal"
              type="number"
              value={subeKodu}
              onChange={(e) => setSubeKodu(e.target.value)}
            />

            <TextField
              label="Şube Adı"
              fullWidth
              margin="normal"
              value={subeAdi}
              onChange={(e) => setSubeAdi(e.target.value)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={bakimAnlasmasi}
                  onChange={(e) =>
                    setBakimAnlasmasi(e.target.checked)
                  }
                />
              }
              label="Bakım Anlaşması Var"
            />

          </DialogContent>

          <DialogActions>

            <Button onClick={onClose}>
              Vazgeç
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
            >
              Kaydet
            </Button>

          </DialogActions>

        </>

      )}

    </Dialog>

  );

}

export default SubeDialog;