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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { getMusteriler } from "../api/musteriService";

function Musteriler() {

  const [musteriler, setMusteriler] = useState([]);
  const [arama, setArama] = useState("");

  useEffect(() => {
    loadMusteriler();
  }, []);

  const loadMusteriler = async () => {
    try {
      const response = await getMusteriler();
      setMusteriler(response.data);
    } catch (error) {
      console.error("Müşteriler alınamadı:", error);
    }
  };

  const filtreliMusteriler = musteriler.filter((musteri) =>
    (musteri.cari_adi || "")
      .toLowerCase()
      .includes(arama.toLowerCase()) ||
    (musteri.musteri_adi || "")
      .toLowerCase()
      .includes(arama.toLowerCase())
  );

  return (
    <Paper elevation={0} sx={{ padding: 3, borderRadius: 4 }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Typography variant="h5">
          Müşteri Ayarları
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Yeni Müşteri
        </Button>
      </div>

      <TextField
        fullWidth
        size="small"
        placeholder="Ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        sx={{ marginBottom: 3 }}
      />

      <TableContainer>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>
                Cari Adı
              </TableCell>

              <TableCell>
                Müşteri Adı
              </TableCell>

              <TableCell align="center">
                İşlemler
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filtreliMusteriler.map((musteri) => (

              <TableRow
                key={musteri.musteri_id}
                hover
              >

                <TableCell>
                  {musteri.cari_adi}
                </TableCell>

                <TableCell>
                  {musteri.musteri_adi}
                </TableCell>

                <TableCell align="center">

                  Düzenle | Sil

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>

    </Paper>
  );
}

export default Musteriler;