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
    >

      <DialogTitle>

        {mode === "create" && "Yeni Kullanıcı"}

        {mode === "edit" && "Kullanıcı Düzenle"}

        {mode === "delete" && "Kullanıcı Sil"}

      </DialogTitle>

      {mode === "delete" ? (

        <>

          <DialogContent>

            <Typography>

              <b>{selectedKullanici?.kullanici_adi}</b> kullanıcısını silmek istediğinize emin misiniz?

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

              label="Kullanıcı Adı"

              fullWidth

              margin="normal"

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

              value={sifre}

              onChange={(e) =>
                setSifre(e.target.value)
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

export default KullaniciDialog;