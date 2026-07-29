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
    >

      <DialogTitle>

        {mode === "create" && "Yeni Arıza Tipi"}

        {mode === "edit" && "Arıza Tipi Düzenle"}

        {mode === "delete" && "Arıza Tipi Sil"}

      </DialogTitle>

      {mode === "delete" ? (

        <>

          <DialogContent>

            <Typography>

              <b>{selectedArizaTipi?.ariza_tipi_adi}</b> arıza tipini silmek istediğinize emin misiniz?

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

            <TextField

              label="Arıza Tipi"

              fullWidth

              margin="normal"

              value={arizaTipi}

              onChange={(e) =>
                setArizaTipi(e.target.value)
              }

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

export default ArizaTipiDialog;