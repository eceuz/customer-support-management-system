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

import SubeDialog from "./SubeDialog";

import {
  getTumSubeler,
  createSube,
  updateSube,
  deleteSube,
} from "../api/subeService";

import { getMusteriler } from "../api/musteriService";

function Subeler() {

  const [subeler, setSubeler] = useState([]);
  const [musteriler, setMusteriler] = useState([]);

  const [arama, setArama] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [dialogMode, setDialogMode] = useState("create");

  const [selectedSube, setSelectedSube] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadSubeler();
    loadMusteriler();
  }, []);

  const loadSubeler = async () => {
    try {

      const response = await getTumSubeler();

      setSubeler(response.data);

    } catch (error) {

      console.error(error);

    }
  };

  const loadMusteriler = async () => {

    try {

      const response = await getMusteriler();

      setMusteriler(response.data);

    } catch (error) {

      console.error(error);

    }

  };

  const handleYeni = () => {

    setDialogMode("create");

    setSelectedSube(null);

    setDialogOpen(true);

  };

  const handleEdit = (sube) => {

    setDialogMode("edit");

    setSelectedSube(sube);

    setDialogOpen(true);

  };

  const handleDeleteClick = (sube) => {

    setDialogMode("delete");

    setSelectedSube(sube);

    setDialogOpen(true);

  };

  const handleClose = () => {

    setDialogOpen(false);

    setSelectedSube(null);

  };

  const handleSave = async (sube) => {

    try {

      if (dialogMode === "create") {

        await createSube(sube);

        setSnackbar({

          open: true,

          message: "Şube eklendi.",

          severity: "success",

        });

      } else {

        await updateSube(

          selectedSube.sube_id,

          sube

        );

        setSnackbar({

          open: true,

          message: "Şube güncellendi.",

          severity: "success",

        });

      }

      handleClose();

      loadSubeler();

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

      await deleteSube(selectedSube.sube_id);

      setSnackbar({

        open: true,

        message: "Şube silindi.",

        severity: "success",

      });

      handleClose();

      loadSubeler();

    } catch {

      setSnackbar({

        open: true,

        message: "Bu şubeye bağlı çağrı kayıtları bulunduğu için silinemiyor.",

        severity: "error",

      });

    }

  };

  const filtreliSubeler = subeler.filter((sube) => {

    const musteri = musteriler.find(
      (m) => m.musteri_id === sube.musteri_id
    );

    return (

      (sube.sube_kodu || "")
        .toString()
        .toLowerCase()
        .includes(arama.toLowerCase()) ||

      (sube.sube_adi || "")
        .toLowerCase()
        .includes(arama.toLowerCase()) ||

      (musteri?.musteri_adi || "")
        .toLowerCase()
        .includes(arama.toLowerCase())

    );

  });

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

          Şube Ayarları

        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleYeni}
        >

          Yeni Şube

        </Button>

      </div>

      <TextField
        fullWidth
        size="small"
        placeholder="Şube Kodu, Cari veya Şube Ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>

                Şube Kodu

              </TableCell>

              <TableCell>

                Cari Adı

              </TableCell>

              <TableCell>

                Şube Adı

              </TableCell>

              <TableCell>

                Bakım Anlaşması

              </TableCell>

              <TableCell align="center">

                İşlemler

              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filtreliSubeler.map((sube) => {

              const musteri = musteriler.find(
                (m) => m.musteri_id === sube.musteri_id
              );

              return (

                <TableRow
                  key={sube.sube_id}
                  hover
                >

                  <TableCell>

                    {sube.sube_kodu}

                  </TableCell>

                  <TableCell>

                    {musteri?.musteri_adi}

                  </TableCell>

                  <TableCell>

                    {sube.sube_adi}

                  </TableCell>

                  <TableCell>

                    {sube.bakim_anlasmasi_var_mi
                      ? "Var"
                      : "Yok"}

                  </TableCell>

                  <TableCell align="center">

                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(sube)}
                    >

                      <EditIcon />

                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(sube)}
                    >

                      <DeleteIcon />

                    </IconButton>

                  </TableCell>

                </TableRow>

              );

            })}

          </TableBody>

        </Table>

      </TableContainer>

      <SubeDialog

        open={dialogOpen}

        mode={dialogMode}

        selectedSube={selectedSube}

        musteriler={musteriler}

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

export default Subeler;