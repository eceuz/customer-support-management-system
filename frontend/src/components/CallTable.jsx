import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { useEffect, useState } from "react";
import "../styles/callTable.css";

import {
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

import { getCagriListesi } from "../api/cagriService";

function CallTable() {

  const [rows, setRows] = useState([]);
  const [arama, setArama] = useState("");

  useEffect(() => {
    loadCagrilar();
  }, []);

  const loadCagrilar = async () => {

    try {

      const response = await getCagriListesi();

      setRows(response.data);

    } catch (error) {

      console.error("Çağrı kayıtları alınamadı:", error);

    }

  };

  const filtreliKayitlar = rows.filter((row) => {

    const aranan = arama.toLowerCase();

    return (

      (row.musteri_adi ?? "").toLowerCase().includes(aranan) ||

      (row.sube_adi ?? "").toLowerCase().includes(aranan) ||

      (row.ariza_tipi_adi ?? "").toLowerCase().includes(aranan) ||

      (row.kullanici_adi ?? "").toLowerCase().includes(aranan) ||

      (row.sonuc ?? "").toLowerCase().includes(aranan)

    );

  });

  return (

    <Paper elevation={0} className="call-table">

      <div className="table-header">

        <Typography variant="h6">

          Çağrı Kayıtları

        </Typography>

        <TextField
  size="small"
  placeholder="Ara"
  value={arama}
  onChange={(e) => setArama(e.target.value)}
  sx={{ width: 250 }}
  slotProps={{
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon fontSize="small" />
        </InputAdornment>
      ),
    },
  }}
/>


      </div>

      <TableContainer>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>Tarih</TableCell>

              <TableCell>Müşteri</TableCell>

              <TableCell>Şube</TableCell>

              <TableCell>Arıza Tipi</TableCell>

              <TableCell width="35%">Yapılan İşlem</TableCell>

              <TableCell>Destek Veren</TableCell>

              <TableCell>Durum</TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filtreliKayitlar.map((row) => (

              <TableRow
                key={row.cagri_kaydi_id}
                hover
              >

                <TableCell>

                  {new Date(row.tarih).toLocaleString("tr-TR")}

                </TableCell>

                <TableCell>

                  {row.musteri_adi}

                </TableCell>

                <TableCell>

                  {row.sube_adi}

                </TableCell>

                <TableCell>

                  {row.ariza_tipi_adi}

                </TableCell>

                <TableCell className="description-cell">

                  {row.yapilanlar}

                </TableCell>

                <TableCell>

                  {row.kullanici_adi}

                </TableCell>

                <TableCell>

                  <Chip
                    label={row.sonuc}
                    size="small"
                    color={
                      row.sonuc === "Çözüldü"
                        ? "success"
                        : row.sonuc === "Beklemede"
                        ? "warning"
                        : row.sonuc === "Müşteri Dönüş Bekleniyor"
                        ? "info"
                        : "error"
                    }
                  />

                </TableCell>

              </TableRow>

            ))}

            {filtreliKayitlar.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={7}
                  align="center"
                >

                  Aramanıza uygun kayıt bulunamadı.

                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </TableContainer>

    </Paper>

  );

}

export default CallTable;