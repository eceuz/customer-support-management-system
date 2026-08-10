
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

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

import {
  deleteCagri,
  getSon24SaatCagriListesi,
} from "../api/cagriService";

import "../styles/callTable.css";

function CallTable({ setSelectedCall, refreshTable }) {
  const [rows, setRows] = useState([]);
  const [arama, setArama] = useState("");

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadCagrilar();
  }, [refreshTable]);

  const loadCagrilar = async () => {
    try {
      const response = await getSon24SaatCagriListesi();
      setRows(response.data);
    } catch (error) {
      console.error("Çağrı kayıtları alınamadı:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCagri(selectedId);

      setOpenDelete(false);
      setSelectedId(null);

      loadCagrilar();
    } catch (error) {
      console.error("Kayıt silinemedi:", error);
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

      case "Servise Aktarıldı":
        return "error";

      default:
        return "error";
    }
  };

  return (
    <Paper elevation={0} className="call-table">

      {/* TABLO BAŞLIĞI */}
      <div className="table-header">

        <Typography variant="h6">
          Son 24 Saatteki Çağrılar
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

      {/* TABLO */}
      <TableContainer>
        <Table
          sx={{
            tableLayout: "fixed",
            width: "100%",
          }}
        >

          <TableHead>
            <TableRow>

              <TableCell width="10%">
                Tarih
              </TableCell>

              <TableCell width="12%">
                Cari
              </TableCell>

              <TableCell width="14%">
                Şube
              </TableCell>

              <TableCell width="12%">
                İletişim
              </TableCell>

              <TableCell width="10%">
                Arıza Tipi
              </TableCell>

              <TableCell width="20%">
                Yapılan İşlem
              </TableCell>

              <TableCell width="7%">
                Destek
              </TableCell>

              <TableCell width="9%">
                Durum
              </TableCell>

              <TableCell width="6%">
                İşlem
              </TableCell>

            </TableRow>
          </TableHead>

          <TableBody>

            {filtreliKayitlar.map((row) => (

              <TableRow
                key={row.cagri_kaydi_id}
                hover
              >

                {/* TARİH */}
                <TableCell>

                  <Typography className="date">
                    {new Date(row.tarih).toLocaleDateString(
                      "tr-TR"
                    )}
                  </Typography>

                  <Typography className="time">
                    {new Date(row.tarih).toLocaleTimeString(
                      "tr-TR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Typography>

                </TableCell>

                {/* CARİ */}
                <TableCell>

                  <Typography className="customer-name">
                    {row.musteri_adi}
                  </Typography>

                </TableCell>

                {/* ŞUBE */}
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

                {/* İLETİŞİM */}
                <TableCell>

                  <Typography className="contact-name">
                    {row.gorusulen_kisi || "-"}
                  </Typography>

                  <Typography className="contact-phone">
                    {row.telefon || "-"}
                  </Typography>

                </TableCell>

                {/* ARIZA TİPİ */}
                <TableCell>

                  <Chip
                    label={row.ariza_tipi_adi}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />

                </TableCell>

                {/* YAPILAN İŞLEM */}
                <TableCell
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >

                  <Typography className="description-cell">
                    {row.yapilanlar || "-"}
                  </Typography>

                </TableCell>

                {/* DESTEK VEREN */}
                <TableCell>

                  <Typography fontWeight={600}>
                    {row.kullanici_adi}
                  </Typography>

                </TableCell>

                {/* DURUM */}
                <TableCell>

                  <Chip
                    label={row.sonuc || "-"}
                    color={durumRengi(row.sonuc)}
                    size="small"
                  />

                </TableCell>

                {/* İŞLEMLER */}
                <TableCell>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      alignItems: "center",
                    }}
                  >

                    {/* DÜZENLE */}
                    <Tooltip
                      title="Düzenle"
                      arrow
                      placement="left"
                    >
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() =>
                          setSelectedCall(row)
                        }
                        sx={{
                          backgroundColor:
                            "rgba(25, 118, 210, 0.04)",

                          "&:hover": {
                            backgroundColor:
                              "rgba(25, 118, 210, 0.12)",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* SİL */}
                    <Tooltip
                      title="Sil"
                      arrow
                      placement="left"
                    >
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() =>
                          handleDeleteClick(
                            row.cagri_kaydi_id
                          )
                        }
                        sx={{
                          backgroundColor:
                            "rgba(211, 47, 47, 0.04)",

                          "&:hover": {
                            backgroundColor:
                              "rgba(211, 47, 47, 0.12)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                  </div>

                </TableCell>

              </TableRow>

            ))}

            {/* KAYIT YOK */}
            {filtreliKayitlar.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ py: 6 }}
                >

                  <Typography color="text.secondary">
                    Son 24 saatte kayıt bulunamadı.
                  </Typography>

                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>
      </TableContainer>

      {/* SİLME ONAY PENCERESİ */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
      >

        <DialogTitle>
          Çağrı Kaydını Sil
        </DialogTitle>

        <DialogContent>
          Bu çağrı kaydını silmek istediğinize emin misiniz?
        </DialogContent>

        <DialogActions>

          <Button
            onClick={() => setOpenDelete(false)}
          >
            İptal
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
          >
            Sil
          </Button>

        </DialogActions>

      </Dialog>

    </Paper>
  );
}

export default CallTable;