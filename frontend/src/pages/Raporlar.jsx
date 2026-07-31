import Header from "../components/Header";
import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import "../styles/raporlar.css";

function Reports() {
  const [cagrilar, setCagrilar] = useState([]);
  const [filtrelenmisCagrilar, setFiltrelenmisCagrilar] = useState([]);

  const [filters, setFilters] = useState({
    baslangic: "",
    bitis: "",
    cari: "",
    sube: "",
    ariza: "",
    destek: "",
    durum: "",
  });

  useEffect(() => {
    veriYukle();
  }, []);

  const veriYukle = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/cagri-listesi");
      setCagrilar(response.data);
      setFiltrelenmisCagrilar(response.data);
    } catch (error) {
      console.error("Veriler yüklenirken hata oluştu:", error);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilter = () => {
    let sonuc = cagrilar;

    if (filters.baslangic) {
      sonuc = sonuc.filter((item) => {
        const itemTarih = item.tarih ? item.tarih.split("T")[0] : "";
        return itemTarih >= filters.baslangic;
      });
    }

    if (filters.bitis) {
      sonuc = sonuc.filter((item) => {
        const itemTarih = item.tarih ? item.tarih.split("T")[0] : "";
        return itemTarih <= filters.bitis;
      });
    }

    if (filters.cari) {
      sonuc = sonuc.filter((item) =>
        item.musteri_adi?.toLowerCase().includes(filters.cari.toLowerCase())
      );
    }

    if (filters.sube) {
      sonuc = sonuc.filter((item) =>
        item.sube_adi?.toLowerCase().includes(filters.sube.toLowerCase())
      );
    }

    if (filters.ariza) {
      sonuc = sonuc.filter((item) =>
        item.ariza_tipi_adi?.toLowerCase().includes(filters.ariza.toLowerCase())
      );
    }

    if (filters.destek) {
      sonuc = sonuc.filter((item) =>
        item.kullanici_adi?.toLowerCase().includes(filters.destek.toLowerCase())
      );
    }

    if (filters.durum) {
      sonuc = sonuc.filter((item) => (item.sonuc || item.durum) === filters.durum);
    }

    setFiltrelenmisCagrilar(sonuc);
  };

  const handleClear = () => {
    setFilters({
      baslangic: "",
      bitis: "",
      cari: "",
      sube: "",
      ariza: "",
      destek: "",
      durum: "",
    });
    setFiltrelenmisCagrilar(cagrilar);
  };

  const handleExportExcel = () => {
    if (filtrelenmisCagrilar.length === 0) {
      alert("Dışarı aktarılacak kayıt bulunamadı!");
      return;
    }

    const headers = [
      "Tarih", 
      "Cari", 
      "Şube", 
      "Bakım Anlaşması", 
      "İletişim", 
      "Telefon", 
      "Arıza Tipi", 
      "Yapılan İşlem", 
      "Destek", 
      "Durum"
    ];

    const rows = filtrelenmisCagrilar.map((item) => [
      item.tarih ? new Date(item.tarih).toLocaleString("tr-TR") : "",
      item.musteri_adi || "",
      item.sube_adi || "",
      item.bakim_anlasmasi_var_mi ? "Bakım Anlaşması Var" : "Bakım Anlaşması Yok",
      item.gorusulen_kisi || "",
      item.telefon || "",
      item.ariza_tipi_adi || "",
      item.yapilanlar || "",
      item.kullanici_adi || "",
      item.sonuc || item.durum || ""
    ]);

    let csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cagri_raporlari_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header />

      <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        
        {/* Başlık */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.5px" }}>
          Raporlar & Çağrı Analizi
        </Typography>

        {/* Filtreleme Kartı */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: "16px", 
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
          }}
        >
          <Grid container spacing={2.5} sx={{ alignItems: "flex-end" }}>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 600, color: "#64748b" }}>
                Başlangıç Tarihi
              </Typography>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="baslangic"
                value={filters.baslangic}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" sx={{ display: "block", mb: 0.8, fontWeight: 600, color: "#64748b" }}>
                Bitiş Tarihi
              </Typography>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="bitis"
                value={filters.bitis}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Cari"
                name="cari"
                value={filters.cari}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Şube"
                name="sube"
                value={filters.sube}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Arıza Tipi"
                name="ariza"
                value={filters.ariza}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Destek Veren"
                name="destek"
                value={filters.destek}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Durum"
                name="durum"
                value={filters.durum}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="Çözüldü">Çözüldü</MenuItem>
                <MenuItem value="Beklemede">Beklemede</MenuItem>
                <MenuItem value="Müşteri Dönüş Bekleniyor">
                  Müşteri Dönüş Bekleniyor
                </MenuItem>
                <MenuItem value="Çözülemedi">Çözülemedi</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", gap: 1.5 }}>
              <Button 
                variant="contained" 
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                size="small"
                sx={{ 
                  flex: 1, 
                  height: "40px", 
                  borderRadius: "10px", 
                  textTransform: "none", 
                  fontWeight: 600,
                  boxShadow: "none",
                  backgroundColor: "#2563eb",
                  "&:hover": { backgroundColor: "#1d4ed8", boxShadow: "none" }
                }}
              >
                Filtrele
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<RestartAltIcon />}
                onClick={handleClear}
                size="small"
                sx={{ 
                  height: "40px", 
                  borderRadius: "10px", 
                  textTransform: "none", 
                  fontWeight: 600,
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" }
                }}
              >
                Temizle
              </Button>
            </Grid>

          </Grid>
        </Paper>

        {/* Tablo Kartı */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: "16px", 
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            mb: 3
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#334155" }}>
              Çağrı Kayıtları
            </Typography>
            <Chip 
              label={`Toplam: ${filtrelenmisCagrilar.length}`} 
              size="small" 
              sx={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontWeight: 600 }} 
            />
          </Box>

          <TableContainer sx={{ borderRadius: "12px", border: "1px solid #f1f5f9" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Cari</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Şube</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>İletişim</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Arıza Tipi</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Yapılan İşlem</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Destek</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrelenmisCagrilar.length > 0 ? (
                  filtrelenmisCagrilar.map((row) => (
                    <TableRow 
                      key={row.cagri_kaydi_id} 
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 }, transition: "background-color 0.2s" }}
                    >
                      <TableCell sx={{ color: "#334155" }}>
                        {row.tarih ? (
                          <>
                            {new Date(row.tarih).toLocaleDateString("tr-TR")}
                            <br />
                            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                              {new Date(row.tarih).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        ) : ""}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{row.musteri_adi}</TableCell>
                      
                      <TableCell>
                        <span style={{ fontWeight: 500, color: "#1e293b" }}>{row.sube_adi}</span>
                        <br />
                        <span 
                          style={{ 
                            color: row.bakim_anlasmasi_var_mi ? "#16a34a" : "#dc2626", 
                            fontSize: "11px", 
                            fontWeight: 600 
                          }}
                        >
                          {row.bakim_anlasmasi_var_mi ? "✓ Bakım Anlaşması Var" : "✕ Bakım Anlaşması Yok"}
                        </span>
                      </TableCell>

                      <TableCell sx={{ color: "#475569" }}>
                        {row.gorusulen_kisi || "-"}
                        <br />
                        <span style={{ color: "#94a3b8", fontSize: "11px" }}>{row.telefon || ""}</span>
                      </TableCell>
                      <TableCell>
                        {row.ariza_tipi_adi ? (
                          <Chip 
                            label={row.ariza_tipi_adi} 
                            size="small" 
                            sx={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 500, borderRadius: "6px" }} 
                          />
                        ) : ""}
                      </TableCell>
                      <TableCell sx={{ color: "#475569" }}>{row.yapilanlar || "-"}</TableCell>
                      <TableCell sx={{ color: "#475569", fontWeight: 500 }}>{row.kullanici_adi}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{row.sonuc || row.durum || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#94a3b8" }}>
                      Kriterlere uygun kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Excel Aktar Butonu */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button 
            variant="contained" 
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{ 
              borderRadius: "10px", 
              textTransform: "none", 
              fontWeight: 600, 
              backgroundColor: "#16a34a", 
              boxShadow: "none",
              py: 1,
              px: 3,
              "&:hover": { backgroundColor: "#15803d", boxShadow: "none" }
            }}
          >
            Excel'e Aktar
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default Reports;