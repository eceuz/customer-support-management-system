import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
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

import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import {
  getArizalar,
  getArizaIslemleri,
} from "../api/yerindeDestekService";

function YerindeDestekRaporlari() {
  const [kayitlar, setKayitlar] = useState([]);
  const [filtrelenmisKayitlar, setFiltrelenmisKayitlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [uyari, setUyari] = useState(null);

  const [filters, setFilters] = useState({
    baslangic: "",
    bitis: "",
    musteri: "",
    sube: "",
    personel: "",
    durum: "",
    ucretBilgisi: "",
    konsinye: "",
  });

  useEffect(() => {
    veriYukle();
  }, []);

  const veriYukle = async () => {
    try {
      setYukleniyor(true);
      setUyari(null);

      const arizaResponse = await getArizalar();
      const arizalar = arizaResponse.data || [];

      let yetkisizUcretVar = false;

      const ucretliKayitlar = await Promise.all(
        arizalar.map(async (ariza) => {
          try {
            const islemResponse = await getArizaIslemleri(
              ariza.ariza_kaydi_id
            );

            const islemler = islemResponse.data || [];

            const toplamUcret = islemler.reduce((toplam, islem) => {
              const deger = Number(islem.ucret);
              return toplam + (Number.isFinite(deger) ? deger : 0);
            }, 0);

            const ucretBilgisiVar = islemler.some(
              (islem) =>
                islem.ucret !== null &&
                islem.ucret !== undefined &&
                islem.ucret !== ""
            );

            const konsinyeUrunler = Array.from(
              new Set(
                islemler
                  .map((islem) =>
                    islem.konsinye_urun_bilgisi?.trim()
                  )
                  .filter(Boolean)
              )
            );

            return {
              ...ariza,
              toplam_ucret: toplamUcret,
              ucret_bilgisi_var: ucretBilgisiVar,
              konsinye_urun_bilgisi: konsinyeUrunler.length
                ? konsinyeUrunler.join(", ")
                : "Yok",
              ucret_goruntulenebilir: true,
            };
          } catch (error) {
            if (error.response?.status === 403) {
              yetkisizUcretVar = true;
            }

            return {
              ...ariza,
              toplam_ucret: null,
              ucret_bilgisi_var: null,
              konsinye_urun_bilgisi: null,
              ucret_goruntulenebilir: false,
            };
          }
        })
      );

      const sirali = [...ucretliKayitlar].sort((a, b) => {
        const tarihA = a.olusturma_tarihi
          ? new Date(a.olusturma_tarihi).getTime()
          : 0;
        const tarihB = b.olusturma_tarihi
          ? new Date(b.olusturma_tarihi).getTime()
          : 0;

        return tarihB - tarihA;
      });

      setKayitlar(sirali);
      setFiltrelenmisKayitlar(sirali);

      if (yetkisizUcretVar) {
        setUyari({
          severity: "info",
          text: "Bazı ücret bilgileri mevcut yetkiler nedeniyle görüntülenemiyor.",
        });
      }
    } catch (error) {
      console.error("Yerinde destek raporları yüklenemedi:", error);
      setKayitlar([]);
      setFiltrelenmisKayitlar([]);
      setUyari({
        severity: "error",
        text: "Yerinde destek raporları yüklenemedi.",
      });
    } finally {
      setYukleniyor(false);
    }
  };

  const durumYazisi = (durum) => {
    const map = {
      atama_bekliyor: "Atama Bekliyor",
      atandi: "Atandı",
      devam_ediyor: "Devam Ediyor",
      tamamlandi: "Tamamlandı",
    };

    return map[durum] || durum || "-";
  };

  const durumRengi = (durum) => {
    const map = {
      atama_bekliyor: "warning",
      atandi: "info",
      devam_ediyor: "primary",
      tamamlandi: "success",
    };

    return map[durum] || "default";
  };

  const tarihFormatla = (tarih) => {
    if (!tarih) return "-";

    return new Date(tarih).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paraFormatla = (deger) => {
    if (deger === null || deger === undefined) return "-";

    return Number(deger).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " TL";
  };

  const personelSecenekleri = useMemo(() => {
    return Array.from(
      new Set(
        kayitlar
          .map((item) => item.atanan_kullanici_adi)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "tr"));
  }, [kayitlar]);

  const handleChange = (e) => {
    setFilters((onceki) => ({
      ...onceki,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFilter = () => {
    let sonuc = [...kayitlar];

    if (filters.baslangic) {
      sonuc = sonuc.filter((item) => {
        const tarih = item.olusturma_tarihi?.split("T")[0] || "";
        return tarih >= filters.baslangic;
      });
    }

    if (filters.bitis) {
      sonuc = sonuc.filter((item) => {
        const tarih = item.olusturma_tarihi?.split("T")[0] || "";
        return tarih <= filters.bitis;
      });
    }

    if (filters.musteri.trim()) {
      const aranan = filters.musteri.trim().toLocaleLowerCase("tr-TR");
      sonuc = sonuc.filter((item) =>
        (item.musteri_adi || "")
          .toLocaleLowerCase("tr-TR")
          .includes(aranan)
      );
    }

    if (filters.sube.trim()) {
      const aranan = filters.sube.trim().toLocaleLowerCase("tr-TR");
      sonuc = sonuc.filter((item) =>
        (item.sube_adi || "")
          .toLocaleLowerCase("tr-TR")
          .includes(aranan)
      );
    }

    if (filters.personel) {
      sonuc = sonuc.filter(
        (item) => item.atanan_kullanici_adi === filters.personel
      );
    }

    if (filters.durum) {
      sonuc = sonuc.filter((item) => item.durum === filters.durum);
    }

    if (filters.ucretBilgisi === "var") {
      sonuc = sonuc.filter(
        (item) => item.ucret_bilgisi_var === true
      );
    }

    if (filters.ucretBilgisi === "yok") {
      sonuc = sonuc.filter(
        (item) => item.ucret_bilgisi_var === false
      );
    }

    if (filters.konsinye === "var") {
      sonuc = sonuc.filter(
        (item) =>
          item.konsinye_urun_bilgisi &&
          item.konsinye_urun_bilgisi !== "Yok"
      );
    }

    if (filters.konsinye === "yok") {
      sonuc = sonuc.filter(
        (item) => item.konsinye_urun_bilgisi === "Yok"
      );
    }

    setFiltrelenmisKayitlar(sonuc);
  };

  const handleClear = () => {
    setFilters({
      baslangic: "",
      bitis: "",
      musteri: "",
      sube: "",
      personel: "",
      durum: "",
      ucretBilgisi: "",
      konsinye: "",
    });

    setFiltrelenmisKayitlar(kayitlar);
  };

  const csvDegeri = (value) => {
    if (value === null || value === undefined) return "";

    const text = String(value);

    if (text.includes(";") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  const handleExport = () => {
    if (filtrelenmisKayitlar.length === 0) {
      alert("Dışarı aktarılacak yerinde destek kaydı bulunamadı!");
      return;
    }

    const headers = [
      "Oluşturulma Tarihi",
      "Müşteri",
      "Şube",
      "Sorun",
      "Atanan Personel",
      "Durum",
      "Atanma Tarihi",
      "İşe Başlama Tarihi",
      "Ücret",
      "Konsinye Ürün",
    ];

    const rows = filtrelenmisKayitlar.map((item) => [
      tarihFormatla(item.olusturma_tarihi),
      item.musteri_adi || "",
      item.sube_adi || "",
      item.sorun || "",
      item.atanan_kullanici_adi || "",
      durumYazisi(item.durum),
      tarihFormatla(item.atanma_tarihi),
      tarihFormatla(item.ise_baslama_tarihi),
      item.toplam_ucret === null || item.toplam_ucret === undefined
        ? ""
        : item.toplam_ucret,
      item.konsinye_urun_bilgisi || "",
    ]);

    const csvContent =
      "\uFEFF" +
      [
        headers.map(csvDegeri).join(";"),
        ...rows.map((row) => row.map(csvDegeri).join(";")),
      ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `yerinde_destek_raporlari_${new Date().toISOString().slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
    },
  };

  const filterButtonSx = {
    height: "40px",
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
  };

  const excelButtonSx = {
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    backgroundColor: "#16a34a",
    boxShadow: "none",
    py: 1,
    px: 3,
    "&:hover": {
      backgroundColor: "#15803d",
      boxShadow: "none",
    },
  };

  return (
    <>
      {uyari && (
        <Alert severity={uyari.severity} sx={{ mb: 2 }}>
          {uyari.text}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          mb: 3,
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Grid container spacing={2.5} sx={{ alignItems: "flex-end" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.8, fontWeight: 600, color: "#64748b" }}
            >
              Başlangıç Tarihi
            </Typography>
            <TextField
              fullWidth
              type="date"
              size="small"
              name="baslangic"
              value={filters.baslangic}
              onChange={handleChange}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.8, fontWeight: 600, color: "#64748b" }}
            >
              Bitiş Tarihi
            </Typography>
            <TextField
              fullWidth
              type="date"
              size="small"
              name="bitis"
              value={filters.bitis}
              onChange={handleChange}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Müşteri"
              name="musteri"
              value={filters.musteri}
              onChange={handleChange}
              sx={fieldSx}
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
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Personel"
              name="personel"
              value={filters.personel}
              onChange={handleChange}
              sx={fieldSx}
            >
              <MenuItem value="">Tümü</MenuItem>
              {personelSecenekleri.map((personel) => (
                <MenuItem key={personel} value={personel}>
                  {personel}
                </MenuItem>
              ))}
            </TextField>
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
              sx={fieldSx}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="atama_bekliyor">Atama Bekliyor</MenuItem>
              <MenuItem value="atandi">Atandı</MenuItem>
              <MenuItem value="devam_ediyor">Devam Ediyor</MenuItem>
              <MenuItem value="tamamlandi">Tamamlandı</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Ücret Bilgisi"
              name="ucretBilgisi"
              value={filters.ucretBilgisi}
              onChange={handleChange}
              sx={fieldSx}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="var">Var</MenuItem>
              <MenuItem value="yok">Yok</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Konsinye Ürün"
              name="konsinye"
              value={filters.konsinye}
              onChange={handleChange}
              sx={fieldSx}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="var">Var</MenuItem>
              <MenuItem value="yok">Yok</MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{
              display: "flex",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" },
              "& .MuiButton-root": { width: { xs: "100%", sm: "auto" } },
            }}
          >
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleFilter}
              size="small"
              sx={{
                ...filterButtonSx,
                flex: 1,
                boxShadow: "none",
                backgroundColor: "#2563eb",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                  boxShadow: "none",
                },
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
                ...filterButtonSx,
                borderColor: "#cbd5e1",
                color: "#475569",
                "&:hover": {
                  borderColor: "#94a3b8",
                  backgroundColor: "#f1f5f9",
                },
              }}
            >
              Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            mb: 2,
            gap: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#334155" }}>
            Yerinde Destek Kayıtları
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              justifyContent: { xs: "space-between", sm: "flex-end" },
              flexWrap: "wrap",
              "& .MuiButton-root": { width: { xs: "100%", sm: "auto" } },
            }}
          >
            <Chip
              label={`Toplam: ${filtrelenmisKayitlar.length}`}
              size="small"
              sx={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontWeight: 600 }}
            />

            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              sx={excelButtonSx}
            >
              Excel'e Aktar
            </Button>
          </Box>
        </Box>

        <TableContainer
          sx={{
            width: "100%",
            overflowX: "auto",
            borderRadius: "12px",
            border: "1px solid #f1f5f9",
          }}
        >
          <Table sx={{ minWidth: "1300px" }}>
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Oluşturulma
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Müşteri
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Şube
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Sorun
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Personel
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Durum
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Atanma
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  İşe Başlama
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Ücret
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                  Konsinye Ürün
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {yukleniyor ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5, color: "#94a3b8" }}>
                    Raporlar yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filtrelenmisKayitlar.length > 0 ? (
                filtrelenmisKayitlar.map((row) => (
                  <TableRow key={row.ariza_kaydi_id} hover>
                    <TableCell>{tarihFormatla(row.olusturma_tarihi)}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {row.musteri_adi || "-"}
                    </TableCell>
                    <TableCell>{row.sube_adi || "-"}</TableCell>
                    <TableCell sx={{ maxWidth: "280px", whiteSpace: "normal" }}>
                      {row.sorun || "-"}
                    </TableCell>
                    <TableCell>{row.atanan_kullanici_adi || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={durumYazisi(row.durum)}
                        color={durumRengi(row.durum)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{tarihFormatla(row.atanma_tarihi)}</TableCell>
                    <TableCell>{tarihFormatla(row.ise_baslama_tarihi)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {paraFormatla(row.toplam_ucret)}
                    </TableCell>
                    <TableCell sx={{ maxWidth: "240px", whiteSpace: "normal" }}>
                      {row.konsinye_urun_bilgisi || "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5, color: "#94a3b8" }}>
                    Kriterlere uygun yerinde destek kaydı bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}

export default YerindeDestekRaporlari;
