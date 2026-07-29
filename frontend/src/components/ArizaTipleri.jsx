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

import ArizaTipiDialog from "./ArizaTipiDialog";

import {
  getArizaTipleri,
  createArizaTipi,
  updateArizaTipi,
  deleteArizaTipi,
} from "../api/arizaService";

function ArizaTipleri() {

  const [arizaTipleri, setArizaTipleri] = useState([]);
  const [arama, setArama] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedArizaTipi, setSelectedArizaTipi] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadArizaTipleri();
  }, []);

  const loadArizaTipleri = async () => {

    try {

      const response = await getArizaTipleri();

      setArizaTipleri(response.data);

    } catch (error) {

      console.error(error);

    }

  };

  const handleYeni = () => {

    setDialogMode("create");
    setSelectedArizaTipi(null);
    setDialogOpen(true);

  };

  const handleEdit = (arizaTipi) => {

    setDialogMode("edit");
    setSelectedArizaTipi(arizaTipi);
    setDialogOpen(true);

  };

  const handleDeleteClick = (arizaTipi) => {

    setDialogMode("delete");
    setSelectedArizaTipi(arizaTipi);
    setDialogOpen(true);

  };

  const handleClose = () => {

    setDialogOpen(false);
    setSelectedArizaTipi(null);

  };

  const handleSave = async (arizaTipi) => {

    try {

      if (dialogMode === "create") {

        await createArizaTipi(arizaTipi);

        setSnackbar({
          open: true,
          message: "Arıza tipi eklendi.",
          severity: "success",
        });

      } else {

        await updateArizaTipi(
          selectedArizaTipi.ariza_tipi_id,
          arizaTipi
        );

        setSnackbar({
          open: true,
          message: "Arıza tipi güncellendi.",
          severity: "success",
        });

      }

      handleClose();
      loadArizaTipleri();

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

      await deleteArizaTipi(
        selectedArizaTipi.ariza_tipi_id
      );

      setSnackbar({
        open: true,
        message: "Arıza tipi silindi.",
        severity: "success",
      });

      handleClose();
      loadArizaTipleri();

    } catch {

      setSnackbar({
        open: true,
        message: "Bu arıza tipi kullanıldığı için silinemiyor.",
        severity: "error",
      });

    }

  };

  const filtreliArizaTipleri = arizaTipleri.filter((tip) =>
    (tip.ariza_tipi_adi || "")
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

          Arıza Tipi Ayarları

        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleYeni}
        >

          Yeni Arıza Tipi

        </Button>

      </div>

      <TextField
        fullWidth
        size="small"
        placeholder="Arıza tipi ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>

                Arıza Tipi

              </TableCell>

              <TableCell align="center">

                İşlemler

              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filtreliArizaTipleri.map((tip) => (

              <TableRow
                key={tip.ariza_tipi_id}
                hover
              >

                <TableCell>

                  {tip.ariza_tipi_adi}

                </TableCell>

                <TableCell align="center">

                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(tip)}
                  >

                    <EditIcon />

                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(tip)}
                  >

                    <DeleteIcon />

                  </IconButton>

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>

      <ArizaTipiDialog

        open={dialogOpen}

        mode={dialogMode}

        selectedArizaTipi={selectedArizaTipi}

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

export default ArizaTipleri;