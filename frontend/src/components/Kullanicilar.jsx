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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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

    <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >

        <Typography variant="h5">

          Kullanıcı Ayarları

        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleYeni}
        >

          Yeni Kullanıcı

        </Button>

      </div>

      <TextField
        fullWidth
        size="small"
        placeholder="Kullanıcı ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>

                Kullanıcı Adı

              </TableCell>

              <TableCell align="center">

                İşlemler

              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filtreliKullanicilar.map((kullanici) => (

              <TableRow
                key={kullanici.kullanici_id}
                hover
              >

                <TableCell>

                  {kullanici.kullanici_adi}

                </TableCell>

                <TableCell align="center">

                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(kullanici)}
                  >

                    <EditIcon />

                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(kullanici)}
                  >

                    <DeleteIcon />

                  </IconButton>

                </TableCell>

              </TableRow>

            ))}

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