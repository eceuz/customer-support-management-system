import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { getCagriListesi } from "../api/cagriService";
import "../styles/callTable.css";

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
      console.error(error);
    }
  };

  const filtreliKayitlar = rows.filter((row) => {
    const aranan = arama.toLowerCase();

    return (
      (row.musteri_adi ?? "").toLowerCase().includes(aranan) ||
      (row.sube_adi ?? "").toLowerCase().includes(aranan) ||
      (row.gorusulen_kisi ?? "").toLowerCase().includes(aranan) ||
      (row.telefon ?? "").toLowerCase().includes(aranan) ||
      (row.ariza_tipi_adi ?? "").toLowerCase().includes(aranan) ||
      (row.kullanici_adi ?? "").toLowerCase().includes(aranan) ||
      (row.yapilanlar ?? "").toLowerCase().includes(aranan)
    );
  });

  const durumRengi = (durum) => {
    switch (durum) {
      case "Çözüldü":
        return "success";
      case "Beklemede":
        return "warning";
      case "Müşteri Dönüş Bekleniyor":
        return "info";
      default:
        return "error";
    }
  };

  return (
    <Paper elevation={0} className="call-table">
      <div className="table-header">
        <Typography variant="h6">
          Çağrı Kayıtları
        </Typography>

        <TextField
          size="small"
          placeholder="Cari, Şube, Telefon..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          sx={{ width: 280 }}
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
        <Table
          sx={{
            tableLayout: "fixed",
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell width="10%">Tarih</TableCell>
              <TableCell width="12%">Cari</TableCell>
              <TableCell width="14%">Şube</TableCell>
              <TableCell width="12%">İletişim</TableCell>
              <TableCell width="10%">Arıza Tipi</TableCell>
              <TableCell width="22%">Yapılan İşlem</TableCell>
              <TableCell width="5%">Destek</TableCell>
              <TableCell width="15%">Durum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtreliKayitlar.map((row) => (
              <TableRow
                key={row.cagri_kaydi_id}
                hover
              >
                <TableCell>
                  <Typography className="date">
                    {new Date(row.tarih).toLocaleDateString("tr-TR")}
                  </Typography>
                  <Typography className="time">
                    {new Date(row.tarih).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography className="customer-name">
                    {row.musteri_adi}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography className="branch-name">
                    {row.sube_adi}
                  </Typography>
                  <Typography
                    className={
                      row.bakim_anlasmasi_var_mi
                        ? "maintenance yes"
                        : "maintenance no"
                    }
                  >
                    {row.bakim_anlasmasi_var_mi
                      ? "✓ Bakım Anlaşması Var"
                      : "✕ Bakım Anlaşması Yok"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography className="contact-name">
                    {row.gorusulen_kisi || "-"}
                  </Typography>
                  <Typography className="contact-phone">
                    {row.telefon || "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={row.ariza_tipi_adi}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>

                <TableCell sx={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                  <Typography className="description-cell">
                    {row.yapilanlar}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography fontWeight={600}>
                    {row.kullanici_adi}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={row.sonuc || "-"}
                    color={durumRengi(row.sonuc)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}

            {filtreliKayitlar.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography color="text.secondary">
                    Kayıt bulunamadı.
                  </Typography>
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