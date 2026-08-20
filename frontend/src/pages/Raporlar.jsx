import Header from "../components/Header";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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
  Tabs,
  Tab,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import api from "../api/api";

import { getMusteriler } from "../api/musteriService";
import { getTumSubeler } from "../api/subeService";
import { getYazarkasalar } from "../api/yazarkasaService";

import "../styles/raporlar.css";


function Reports() {
  const [searchParams] = useSearchParams();
  const [aktifSekme, setAktifSekme] = useState(0);


  // =========================================================
  // ÇAĞRI KAYITLARI
  // =========================================================

  const [cagrilar, setCagrilar] = useState([]);
  const [filtrelenmisCagrilar, setFiltrelenmisCagrilar] =
    useState([]);

  const [filters, setFilters] = useState({
    baslangic: "",
    bitis: "",
    cari: "",
    sube: "",
    ariza: "",
    destek: "",
    durum: "",
  });


  // CAGRI_KAYITLARI içindeki mevcut sonuçlardan
  // dinamik Durum seçenekleri oluştur.
  const durumSecenekleri = Array.from(
    new Map(
      cagrilar
        .map((item) =>
          (item.sonuc || item.durum || "").trim()
        )
        .filter(Boolean)
        .map((durum) => [
          durum.toLocaleLowerCase("tr-TR"),
          durum,
        ])
    ).values()
  ).sort((a, b) =>
    a.localeCompare(b, "tr")
  );


  // =========================================================
  // MÜŞTERİLER & ŞUBELER
  // =========================================================

  const [musteriler, setMusteriler] = useState([]);
  const [subeler, setSubeler] = useState([]);

  const [
    filtrelenmisMusteriSubeler,
    setFiltrelenmisMusteriSubeler,
  ] = useState([]);

  const [musteriSubeFilters, setMusteriSubeFilters] = useState({
    musteriKodu: "",
    musteriAdi: "",
    subeKodu: "",
    subeAdi: "",
    bakim: "",
  });


  // =========================================================
  // YAZARKASALAR
  // =========================================================

  const [yazarkasalar, setYazarkasalar] = useState([]);
  const [filtrelenmisYazarkasalar, setFiltrelenmisYazarkasalar] =
    useState([]);

  const [yazarkasaFilters, setYazarkasaFilters] = useState({
    musteri: "",
    sube: "",
    resmiUnvan: "",
    marka: "",
    sicilNo: "",
    notlar: "",
    baslangic: "",
    bitis: "",
    bitisDurumu: "",
  });


  // =========================================================
  // VERİLERİ YÜKLE
  // =========================================================

  useEffect(() => {
    const sekme = searchParams.get("sekme");

    if (sekme === "yazarkasalar") {
      setAktifSekme(2);
    }
  }, [searchParams]);


  useEffect(() => {
    veriYukle();
  }, []);


  const veriYukle = async () => {
    try {
      const [
        cagriResponse,
        musteriResponse,
        subeResponse,
        yazarkasaResponse,
      ] = await Promise.all([
        api.get("/cagri-listesi"),
        getMusteriler(),
        getTumSubeler(),
        getYazarkasalar(),
      ]);

      setCagrilar(cagriResponse.data);
      setFiltrelenmisCagrilar(cagriResponse.data);

      const musteriVerileri = musteriResponse.data || [];
      const subeVerileri = subeResponse.data || [];

      setMusteriler(musteriVerileri);

      const siraliSubeler = musteriKodunaGoreSirala(
        subeVerileri,
        musteriVerileri
      );
      setSubeler(siraliSubeler);
      setFiltrelenmisMusteriSubeler(siraliSubeler);

      const siraliYazarkasalar =
        yazarkasalariBitiseGoreSirala(
          yazarkasaResponse.data || []
        );

      setYazarkasalar(siraliYazarkasalar);
      setFiltrelenmisYazarkasalar(siraliYazarkasalar);

    } catch (error) {
      console.error(
        "Rapor verileri yüklenirken hata oluştu:",
        error
      );
    }
  };


  // =========================================================
  // CSV / EXCEL
  // =========================================================

  const csvDegeri = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    const text = String(value);

    if (
      text.includes(";") ||
      text.includes('"') ||
      text.includes("\n")
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };


  const csvIndir = (headers, rows, dosyaAdi) => {
    const csvContent =
      "\uFEFF" +
      [
        headers.map(csvDegeri).join(";"),
        ...rows.map((row) =>
          row.map(csvDegeri).join(";")
        ),
      ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", dosyaAdi);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  // =========================================================
  // ÇAĞRI FİLTRELERİ
  // =========================================================

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
        const itemTarih = item.tarih
          ? item.tarih.split("T")[0]
          : "";

        return itemTarih >= filters.baslangic;
      });
    }


    if (filters.bitis) {
      sonuc = sonuc.filter((item) => {
        const itemTarih = item.tarih
          ? item.tarih.split("T")[0]
          : "";

        return itemTarih <= filters.bitis;
      });
    }


    if (filters.cari) {
      sonuc = sonuc.filter((item) =>
        item.musteri_adi
          ?.toLowerCase()
          .includes(filters.cari.toLowerCase())
      );
    }


    if (filters.sube) {
      sonuc = sonuc.filter((item) =>
        item.sube_adi
          ?.toLowerCase()
          .includes(filters.sube.toLowerCase())
      );
    }


    if (filters.ariza) {
      sonuc = sonuc.filter((item) =>
        item.ariza_tipi_adi
          ?.toLowerCase()
          .includes(filters.ariza.toLowerCase())
      );
    }


    if (filters.destek) {
      sonuc = sonuc.filter((item) =>
        item.kullanici_adi
          ?.toLowerCase()
          .includes(filters.destek.toLowerCase())
      );
    }


    if (filters.durum) {
      const seciliDurum =
        filters.durum
          .trim()
          .toLocaleLowerCase("tr-TR");

      sonuc = sonuc.filter((item) => {
        const kayitDurumu =
          (item.sonuc || item.durum || "")
            .trim()
            .toLocaleLowerCase("tr-TR");

        return kayitDurumu === seciliDurum;
      });
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


  const handleExportCagri = () => {
    if (filtrelenmisCagrilar.length === 0) {
      alert("Dışarı aktarılacak kayıt bulunamadı!");
      return;
    }


    const headers = [
      "Tarih",
      "Cari",
      "Şube",
      "Telefon Destek Anlaşması",
      "İletişim",
      "Telefon",
      "Arıza Tipi",
      "Yapılan İşlem",
      "Destek",
      "Durum",
    ];


    const rows = filtrelenmisCagrilar.map((item) => [
      item.tarih
        ? new Date(item.tarih).toLocaleString("tr-TR")
        : "",

      item.musteri_adi || "",

      item.sube_adi || "",

      item.bakim_anlasmasi_var_mi
        ? "Telefon Destek Anlaşması Var"
        : "Telefon Destek Anlaşması Yok",

      item.gorusulen_kisi || "",

      item.telefon || "",

      item.ariza_tipi_adi || "",

      item.yapilanlar || "",

      item.kullanici_adi || "",

      item.sonuc || item.durum || "",
    ]);


    csvIndir(
      headers,
      rows,
      `cagri_raporlari_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
  };


  // =========================================================
  // MÜŞTERİ & ŞUBE YARDIMCI FONKSİYONLARI
  // =========================================================

  const musteriKodunaGoreSirala = (
    liste,
    musteriListesi = musteriler
  ) => {
    return [...liste].sort((a, b) => {
      const musteriA = musteriListesi.find(
        (musteri) =>
          Number(musteri.musteri_id) ===
          Number(a.musteri_id)
      );

      const musteriB = musteriListesi.find(
        (musteri) =>
          Number(musteri.musteri_id) ===
          Number(b.musteri_id)
      );

      const kodA = musteriA?.cari_kodu;
      const kodB = musteriB?.cari_kodu;

      const kodAYok =
        kodA === null ||
        kodA === undefined ||
        kodA === "";

      const kodBYok =
        kodB === null ||
        kodB === undefined ||
        kodB === "";

      if (kodAYok && kodBYok) {
        return 0;
      }

      if (kodAYok) {
        return 1;
      }

      if (kodBYok) {
        return -1;
      }

      const sayiA = Number(kodA);
      const sayiB = Number(kodB);

      if (
        !Number.isNaN(sayiA) &&
        !Number.isNaN(sayiB)
      ) {
        const musteriKodSirasi =
          sayiA - sayiB;

        if (musteriKodSirasi !== 0) {
          return musteriKodSirasi;
        }

        // Aynı müşterinin birden fazla şubesi varsa
        // kendi içinde şube koduna göre düzenli kalsın.
        return (
          Number(a.sube_kodu || 0) -
          Number(b.sube_kodu || 0)
        );
      }

      const metinSirasi =
        String(kodA).localeCompare(
          String(kodB),
          "tr",
          {
            numeric: true,
            sensitivity: "base",
          }
        );

      if (metinSirasi !== 0) {
        return metinSirasi;
      }

      return String(a.sube_kodu || "").localeCompare(
        String(b.sube_kodu || ""),
        "tr",
        {
          numeric: true,
          sensitivity: "base",
        }
      );
    });
  };


  const getMusteriById = (musteriId) => {
    return musteriler.find(
      (musteri) =>
        Number(musteri.musteri_id) ===
        Number(musteriId)
    );
  };


  const getMusteriRaporAdi = (musteri) => {
    return (
      musteri?.musteri_adi ||
      musteri?.cari_adi ||
      "-"
    );
  };


  // =========================================================
  // MÜŞTERİ & ŞUBE FİLTRELERİ
  // =========================================================

  const handleMusteriSubeChange = (e) => {
    setMusteriSubeFilters({
      ...musteriSubeFilters,
      [e.target.name]: e.target.value,
    });
  };


  const handleMusteriSubeFilter = () => {
    let sonuc = [...subeler];

    const musteriKoduAranan =
      musteriSubeFilters.musteriKodu
        .trim()
        .toLocaleLowerCase("tr-TR");

    const musteriAdiAranan =
      musteriSubeFilters.musteriAdi
        .trim()
        .toLocaleLowerCase("tr-TR");

    const subeKoduAranan =
      musteriSubeFilters.subeKodu
        .trim()
        .toLocaleLowerCase("tr-TR");

    const subeAdiAranan =
      musteriSubeFilters.subeAdi
        .trim()
        .toLocaleLowerCase("tr-TR");


    if (musteriKoduAranan) {
      sonuc = sonuc.filter((sube) => {
        const musteri = getMusteriById(
          sube.musteri_id
        );

        return String(
          musteri?.cari_kodu || ""
        )
          .toLocaleLowerCase("tr-TR")
          .includes(musteriKoduAranan);
      });
    }


    if (musteriAdiAranan) {
      sonuc = sonuc.filter((sube) => {
        const musteri = getMusteriById(
          sube.musteri_id
        );

        return getMusteriRaporAdi(musteri)
          .toLocaleLowerCase("tr-TR")
          .includes(musteriAdiAranan);
      });
    }


    if (subeKoduAranan) {
      sonuc = sonuc.filter((sube) =>
        String(sube.sube_kodu || "")
          .toLocaleLowerCase("tr-TR")
          .includes(subeKoduAranan)
      );
    }


    if (subeAdiAranan) {
      sonuc = sonuc.filter((sube) =>
        (sube.sube_adi || "")
          .toLocaleLowerCase("tr-TR")
          .includes(subeAdiAranan)
      );
    }


    if (musteriSubeFilters.bakim !== "") {
      const anlasmaVar =
        musteriSubeFilters.bakim === "var";

      sonuc = sonuc.filter(
        (sube) =>
          Boolean(
            sube.bakim_anlasmasi_var_mi
          ) === anlasmaVar
      );
    }


    setFiltrelenmisMusteriSubeler(
      musteriKodunaGoreSirala(sonuc)
    );
  };


  const handleMusteriSubeClear = () => {
    setMusteriSubeFilters({
      musteriKodu: "",
      musteriAdi: "",
      subeKodu: "",
      subeAdi: "",
      bakim: "",
    });

    setFiltrelenmisMusteriSubeler(
      musteriKodunaGoreSirala(subeler)
    );
  };


  const handleExportMusteriSube = () => {
    if (
      filtrelenmisMusteriSubeler.length === 0
    ) {
      alert(
        "Dışarı aktarılacak müşteri / şube kaydı bulunamadı!"
      );

      return;
    }


    const headers = [
      "Müşteri Kodu",
      "Müşteri Adı",
      "Şube Kodu",
      "Şube Adı",
      "Telefon Destek Anlaşması",
    ];


    const rows =
      filtrelenmisMusteriSubeler.map(
        (sube) => {
          const musteri = getMusteriById(
            sube.musteri_id
          );

          return [
            musteri?.cari_kodu || "",
            getMusteriRaporAdi(musteri),
            sube.sube_kodu || "",
            sube.sube_adi || "",
            sube.bakim_anlasmasi_var_mi
              ? "Var"
              : "Yok",
          ];
        }
      );


    csvIndir(
      headers,
      rows,
      `musteriler_subeler_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
  };


  // =========================================================
  // YAZARKASA YARDIMCI FONKSİYONLARI
  // =========================================================

  const getYazarkasaSube = (subeId) => {
    return subeler.find(
      (sube) => Number(sube.sube_id) === Number(subeId)
    );
  };


  const getYazarkasaMusteri = (subeId) => {
    const sube = getYazarkasaSube(subeId);

    if (!sube) {
      return null;
    }

    return musteriler.find(
      (musteri) =>
        Number(musteri.musteri_id) === Number(sube.musteri_id)
    );
  };


  const getYazarkasaMusteriAdi = (subeId) => {
    const musteri = getYazarkasaMusteri(subeId);

    return (
      musteri?.musteri_adi ||
      musteri?.cari_adi ||
      "-"
    );
  };


  const getYazarkasaSubeAdi = (subeId) => {
    const sube = getYazarkasaSube(subeId);

    return sube?.sube_adi || "-";
  };


  const formatYazarkasaTarih = (tarih) => {
    if (!tarih) {
      return "-";
    }

    return new Date(
      `${tarih}T00:00:00`
    ).toLocaleDateString("tr-TR");
  };


  const getYazarkasaBitisDurumu = (bitisTarihi) => {
    if (!bitisTarihi) {
      return null;
    }

    const bugun = new Date();

    const bugunUTC = Date.UTC(
      bugun.getFullYear(),
      bugun.getMonth(),
      bugun.getDate()
    );

    const [yil, ay, gun] = bitisTarihi
      .split("-")
      .map(Number);

    const bitisUTC = Date.UTC(
      yil,
      ay - 1,
      gun
    );

    const gunFarki = Math.round(
      (bitisUTC - bugunUTC) /
        (1000 * 60 * 60 * 24)
    );


    // Tarihi geçmiş yazarkasalar
    if (gunFarki < 0) {
      return {
        label: "Bitti",
        color: "#b91c1c",
        backgroundColor: "#fee2e2",
        rowBackground: "#fff7f7",
      };
    }


    // Bugün biten yazarkasalar
    if (gunFarki === 0) {
      return {
        label: "Bugün Bitiyor",
        color: "#c2410c",
        backgroundColor: "#ffedd5",
        rowBackground: "#fffaf5",
      };
    }


    // 1 - 5 gün arasında kalan yazarkasalar
    if (
      gunFarki >= 1 &&
      gunFarki <= 5
    ) {
      return {
        label: `${gunFarki} Gün Kaldı`,
        color: "#a16207",
        backgroundColor: "#fef3c7",
        rowBackground: "#fffdf5",
      };
    }


    return null;
  };




  const yazarkasalariBitiseGoreSirala = (liste) => {

    return [...liste].sort((a, b) => {

      const tarihA = a.bitis_tarihi;
      const tarihB = b.bitis_tarihi;


      if (!tarihA && !tarihB) {
        return 0;
      }


      if (!tarihA) {
        return 1;
      }


      if (!tarihB) {
        return -1;
      }


      return tarihA.localeCompare(tarihB);

    });

  };


  // =========================================================
  // YAZARKASA FİLTRELERİ
  // =========================================================

  const handleYazarkasaChange = (e) => {
    setYazarkasaFilters({
      ...yazarkasaFilters,
      [e.target.name]: e.target.value,
    });
  };


  const handleYazarkasaFilter = () => {
    let sonuc = yazarkasalar;


    if (yazarkasaFilters.musteri) {
      const aranan = yazarkasaFilters.musteri
        .trim()
        .toLocaleLowerCase("tr-TR");

      sonuc = sonuc.filter((item) =>
        getYazarkasaMusteriAdi(item.sube_id)
          .toLocaleLowerCase("tr-TR")
          .includes(aranan)
      );
    }


    if (yazarkasaFilters.sube) {
      const aranan = yazarkasaFilters.sube
        .trim()
        .toLocaleLowerCase("tr-TR");

      sonuc = sonuc.filter((item) =>
        getYazarkasaSubeAdi(item.sube_id)
          .toLocaleLowerCase("tr-TR")
          .includes(aranan)
      );
    }


    if (yazarkasaFilters.resmiUnvan) {
      const aranan = yazarkasaFilters.resmiUnvan
        .trim()
        .toLocaleLowerCase("tr-TR");

      sonuc = sonuc.filter((item) =>
        (item.resmi_unvan || "")
          .toLocaleLowerCase("tr-TR")
          .includes(aranan)
      );
    }


    if (yazarkasaFilters.marka) {
      const aranan = yazarkasaFilters.marka
        .trim()
        .toLocaleLowerCase("tr-TR");

      sonuc = sonuc.filter((item) =>
        (item.marka || "")
          .toLocaleLowerCase("tr-TR")
          .includes(aranan)
      );
    }


    if (yazarkasaFilters.sicilNo) {
      const aranan = yazarkasaFilters.sicilNo
        .trim()
        .toLocaleLowerCase("tr-TR");

      sonuc = sonuc.filter((item) =>
        (item.sicil_no || "")
          .toLocaleLowerCase("tr-TR")
          .includes(aranan)
      );
    }


    if (yazarkasaFilters.notlar) {
      const aranan = yazarkasaFilters.notlar
        .trim()
        .toLocaleLowerCase("tr-TR");

      sonuc = sonuc.filter((item) =>
        (item.notlar || "")
          .toLocaleLowerCase("tr-TR")
          .includes(aranan)
      );
    }


    if (yazarkasaFilters.baslangic) {
      sonuc = sonuc.filter(
        (item) =>
          item.baslangic_tarihi &&
          item.baslangic_tarihi >= yazarkasaFilters.baslangic
      );
    }


    if (yazarkasaFilters.bitis) {
      sonuc = sonuc.filter(
        (item) =>
          item.bitis_tarihi &&
          item.bitis_tarihi <= yazarkasaFilters.bitis
      );
    }


    if (yazarkasaFilters.bitisDurumu) {

      const bugun = new Date();

      const bugunUTC = Date.UTC(
        bugun.getFullYear(),
        bugun.getMonth(),
        bugun.getDate()
      );


      sonuc = sonuc.filter((item) => {

        if (!item.bitis_tarihi) {
          return false;
        }


        const [yil, ay, gun] =
          item.bitis_tarihi
            .split("-")
            .map(Number);


        const bitisUTC = Date.UTC(
          yil,
          ay - 1,
          gun
        );


        const gunFarki = Math.round(
          (bitisUTC - bugunUTC) /
          (1000 * 60 * 60 * 24)
        );


        // Bitiş tarihi geçmiş kayıtlar
        if (
          yazarkasaFilters.bitisDurumu ===
          "tarihiGecmis"
        ) {
          return gunFarki < 0;
        }


        // Bugün dahil önümüzdeki 30 gün içinde bitecek kayıtlar
        if (
          yazarkasaFilters.bitisDurumu ===
          "yaklasan"
        ) {
          return (
            gunFarki >= 0 &&
            gunFarki <= 30
          );
        }


        // 30 günden daha uzun süresi olan kayıtlar
        if (
          yazarkasaFilters.bitisDurumu ===
          "aktif"
        ) {
          return gunFarki > 30;
        }


        return true;

      });

    }


    setFiltrelenmisYazarkasalar(
      yazarkasalariBitiseGoreSirala(
        sonuc
      )
    );
  };


  const handleYazarkasaClear = () => {
    setYazarkasaFilters({
      musteri: "",
      sube: "",
      resmiUnvan: "",
      marka: "",
      sicilNo: "",
      notlar: "",
      baslangic: "",
      bitis: "",
      bitisDurumu: "",
    });

    setFiltrelenmisYazarkasalar(
      yazarkasalariBitiseGoreSirala(
        yazarkasalar
      )
    );
  };


  const handleExportYazarkasa = () => {
    if (filtrelenmisYazarkasalar.length === 0) {
      alert(
        "Dışarı aktarılacak yazarkasa kaydı bulunamadı!"
      );

      return;
    }


    const headers = [
      "Müşteri",
      "Şube",
      "Resmi Ünvan",
      "Marka",
      "Sicil No",
      "Başlangıç Tarihi",
      "Bitiş Tarihi",
      "Kayıtlı Telefon",
      "Notlar",
    ];


    const rows = filtrelenmisYazarkasalar.map((item) => [
      getYazarkasaMusteriAdi(item.sube_id),
      getYazarkasaSubeAdi(item.sube_id),
      item.resmi_unvan || "",
      item.marka || "",
      item.sicil_no || "",
      item.baslangic_tarihi
        ? formatYazarkasaTarih(item.baslangic_tarihi)
        : "",
      item.bitis_tarihi
        ? formatYazarkasaTarih(item.bitis_tarihi)
        : "",
      item.kayitli_tel_no || "",
      item.notlar || "",
    ]);


    csvIndir(
      headers,
      rows,
      `yazarkasalar_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
  };


  // =========================================================
  // ORTAK EXCEL BUTONU
  // =========================================================

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


  // =========================================================
  // SAYFA
  // =========================================================

  return (
    <>
      <Header />


      <Box
        sx={{
          p: 3,
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        {/* BAŞLIK */}
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 700,
            color: "#1e293b",
            letterSpacing: "-0.5px",
          }}
        >
          Raporlar & Çağrı Analizi
        </Typography>


        {/* SEKME ALANI */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={aktifSekme}
            onChange={(e, value) =>
              setAktifSekme(value)
            }
            variant="fullWidth"
          >
            <Tab label="Çağrı Kayıtları" />

            <Tab label="Müşteriler & Şubeler" />

            <Tab label="Yazar Kasalar" />
          </Tabs>
        </Paper>


        {/* ================================================= */}
        {/* ÇAĞRI RAPORLARI */}
        {/* ================================================= */}

        {aktifSekme === 0 && (
          <>
            {/* FİLTRELEME KARTI */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Grid
                container
                spacing={2.5}
                sx={{
                  alignItems: "flex-end",
                }}
              >
                {/* BAŞLANGIÇ */}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.8,
                      fontWeight: 600,
                      color: "#64748b",
                    }}
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                {/* BİTİŞ */}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.8,
                      fontWeight: 600,
                      color: "#64748b",
                    }}
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                {/* CARİ */}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Cari"
                    name="cari"
                    value={filters.cari}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                {/* ŞUBE */}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Şube"
                    name="sube"
                    value={filters.sube}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                {/* ARIZA */}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Arıza Tipi"
                    name="ariza"
                    value={filters.ariza}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                {/* DESTEK */}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Destek Veren"
                    name="destek"
                    value={filters.destek}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                {/* DURUM */}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Durum"
                    name="durum"
                    value={filters.durum}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  >
                    <MenuItem value="">
                      Tümü
                    </MenuItem>

                    {durumSecenekleri.map((durum) => (
                      <MenuItem
                        key={durum}
                        value={durum}
                      >
                        {durum}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>


                {/* BUTONLAR */}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                  }}
                >
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
                      height: "40px",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
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


            {/* ÇAĞRI TABLOSU */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.02)",
                mb: 3,
              }}
            >
              {/* TABLO ÜST KISMI */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  gap: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#334155",
                  }}
                >
                  Çağrı Kayıtları
                </Typography>


                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Chip
                    label={`Toplam: ${filtrelenmisCagrilar.length}`}
                    size="small"
                    sx={{
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                      fontWeight: 600,
                    }}
                  />


                  <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportCagri}
                    sx={excelButtonSx}
                  >
                    Excel'e Aktar
                  </Button>
                </Box>
              </Box>


              <TableContainer
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  overflowX: "auto",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                }}
              >
                <Table
                  sx={{
                    minWidth: "1250px",
                  }}
                >
                  <TableHead
                    sx={{
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Tarih
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Cari
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Şube
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "#475569",
                        }}
                      >
                        İletişim
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Arıza Tipi
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Yapılan İşlem
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Destek
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Durum
                      </TableCell>
                    </TableRow>
                  </TableHead>


                  <TableBody>
                    {filtrelenmisCagrilar.length > 0 ? (
                      filtrelenmisCagrilar.map((row) => (
                        <TableRow
                          key={row.cagri_kaydi_id}
                          hover
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                            transition:
                              "background-color 0.2s",
                          }}
                        >
                          {/* TARİH */}
                          <TableCell
                            sx={{
                              color: "#334155",
                            }}
                          >
                            {row.tarih ? (
                              <>
                                {new Date(
                                  row.tarih
                                ).toLocaleDateString(
                                  "tr-TR"
                                )}

                                <br />

                                <span
                                  style={{
                                    color: "#94a3b8",
                                    fontSize: "11px",
                                  }}
                                >
                                  {new Date(
                                    row.tarih
                                  ).toLocaleTimeString(
                                    "tr-TR",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                          </TableCell>


                          {/* CARİ */}
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              color: "#1e293b",
                            }}
                          >
                            {row.musteri_adi}
                          </TableCell>


                          {/* ŞUBE */}
                          <TableCell>
                            <span
                              style={{
                                fontWeight: 500,
                                color: "#1e293b",
                              }}
                            >
                              {row.sube_adi}
                            </span>

                            <br />

                            <span
                              style={{
                                color:
                                  row.bakim_anlasmasi_var_mi
                                    ? "#16a34a"
                                    : "#dc2626",

                                fontSize: "11px",

                                fontWeight: 600,
                              }}
                            >
                              {row.bakim_anlasmasi_var_mi
                                ? "✓ Telefon Destek Anlaşması Var"
                                : "✕ Telefon Destek Anlaşması Yok"}
                            </span>
                          </TableCell>


                          {/* İLETİŞİM */}
                          <TableCell
                            sx={{
                              color: "#475569",
                            }}
                          >
                            {row.gorusulen_kisi || "-"}

                            <br />

                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize: "11px",
                              }}
                            >
                              {row.telefon || ""}
                            </span>
                          </TableCell>


                          {/* ARIZA */}
                          <TableCell>
                            {row.ariza_tipi_adi ? (
                              <Chip
                                label={row.ariza_tipi_adi}
                                size="small"
                                sx={{
                                  backgroundColor: "#eff6ff",
                                  color: "#1d4ed8",
                                  fontWeight: 500,
                                  borderRadius: "6px",
                                }}
                              />
                            ) : (
                              ""
                            )}
                          </TableCell>


                          {/* YAPILAN İŞLEM */}
                          <TableCell
                            sx={{
                              color: "#475569",
                            }}
                          >
                            {row.yapilanlar || "-"}
                          </TableCell>


                          {/* DESTEK */}
                          <TableCell
                            sx={{
                              color: "#475569",
                              fontWeight: 500,
                            }}
                          >
                            {row.kullanici_adi}
                          </TableCell>


                          {/* DURUM */}
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              color: "#334155",
                            }}
                          >
                            {row.sonuc ||
                              row.durum ||
                              "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          align="center"
                          sx={{
                            py: 4,
                            color: "#94a3b8",
                          }}
                        >
                          Kriterlere uygun kayıt bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}


        {/* ================================================= */}
        {/* MÜŞTERİLER & ŞUBELER RAPORU */}
        {/* ================================================= */}

        {aktifSekme === 1 && (
          <>
            {/* FİLTRELER */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Grid
                container
                spacing={2.5}
                sx={{
                  alignItems: "flex-end",
                }}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Müşteri Kodu"
                    name="musteriKodu"
                    value={
                      musteriSubeFilters.musteriKodu
                    }
                    onChange={handleMusteriSubeChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Müşteri Adı"
                    name="musteriAdi"
                    value={
                      musteriSubeFilters.musteriAdi
                    }
                    onChange={handleMusteriSubeChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Şube Kodu"
                    name="subeKodu"
                    value={
                      musteriSubeFilters.subeKodu
                    }
                    onChange={handleMusteriSubeChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Şube Adı"
                    name="subeAdi"
                    value={
                      musteriSubeFilters.subeAdi
                    }
                    onChange={handleMusteriSubeChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Telefon Destek Anlaşması"
                    name="bakim"
                    value={
                      musteriSubeFilters.bakim
                    }
                    onChange={handleMusteriSubeChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  >
                    <MenuItem value="">
                      Tümü
                    </MenuItem>

                    <MenuItem value="var">
                      Var
                    </MenuItem>

                    <MenuItem value="yok">
                      Yok
                    </MenuItem>
                  </TextField>
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<FilterListIcon />}
                    onClick={handleMusteriSubeFilter}
                    size="small"
                    sx={{
                      flex: 1,
                      height: "40px",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
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
                    onClick={handleMusteriSubeClear}
                    size="small"
                    sx={{
                      height: "40px",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
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


            {/* MÜŞTERİ & ŞUBE TABLOSU */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.02)",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  gap: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#334155",
                  }}
                >
                  Müşteri & Şube Listesi
                </Typography>


                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Chip
                    label={`Toplam: ${filtrelenmisMusteriSubeler.length}`}
                    size="small"
                    sx={{
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                      fontWeight: 600,
                    }}
                  />


                  <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportMusteriSube}
                    sx={excelButtonSx}
                  >
                    Excel'e Aktar
                  </Button>
                </Box>
              </Box>


              <TableContainer
                sx={{
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                }}
              >
                <Table>
                  <TableHead
                    sx={{
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Müşteri Kodu
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Müşteri Adı
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Şube Kodu
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Şube Adı
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Telefon Destek Anlaşması
                      </TableCell>
                    </TableRow>
                  </TableHead>


                  <TableBody>
                    {filtrelenmisMusteriSubeler.length > 0 ? (
                      filtrelenmisMusteriSubeler.map(
                        (sube) => {
                          const musteri =
                            getMusteriById(
                              sube.musteri_id
                            );

                          return (
                            <TableRow
                              key={sube.sube_id}
                              hover
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  color: "#334155",
                                  fontWeight: 500,
                                }}
                              >
                                {musteri?.cari_kodu || "-"}
                              </TableCell>


                              <TableCell
                                sx={{
                                  color: "#1e293b",
                                  fontWeight: 600,
                                }}
                              >
                                {getMusteriRaporAdi(
                                  musteri
                                )}
                              </TableCell>


                              <TableCell
                                sx={{
                                  color: "#334155",
                                  fontWeight: 600,
                                }}
                              >
                                {sube.sube_kodu || "-"}
                              </TableCell>


                              <TableCell
                                sx={{
                                  color: "#475569",
                                  fontWeight: 500,
                                }}
                              >
                                {sube.sube_adi || "-"}
                              </TableCell>


                              <TableCell>
                                <span
                                  style={{
                                    color:
                                      sube.bakim_anlasmasi_var_mi
                                        ? "#16a34a"
                                        : "#dc2626",

                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}
                                >
                                  {sube.bakim_anlasmasi_var_mi
                                    ? "✓ Telefon Destek Anlaşması Var"
                                    : "✕ Telefon Destek Anlaşması Yok"}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{
                            py: 4,
                            color: "#94a3b8",
                          }}
                        >
                          Kriterlere uygun müşteri / şube
                          kaydı bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}


        {/* ================================================= */}
        {/* YAZARKASA RAPORU */}
        {/* ================================================= */}

        {aktifSekme === 2 && (
          <>
            {/* FİLTRELER */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Grid
                container
                spacing={2.5}
                sx={{
                  alignItems: "flex-end",
                }}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Müşteri"
                    name="musteri"
                    value={yazarkasaFilters.musteri}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Şube"
                    name="sube"
                    value={yazarkasaFilters.sube}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Resmi Ünvan"
                    name="resmiUnvan"
                    value={yazarkasaFilters.resmiUnvan}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Marka"
                    name="marka"
                    value={yazarkasaFilters.marka}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Sicil No"
                    name="sicilNo"
                    value={yazarkasaFilters.sicilNo}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Notlar"
                    name="notlar"
                    value={yazarkasaFilters.notlar}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.8,
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Başlangıç Tarihi
                  </Typography>

                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    name="baslangic"
                    value={yazarkasaFilters.baslangic}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.8,
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Bitiş Tarihi
                  </Typography>

                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    name="bitis"
                    value={yazarkasaFilters.bitis}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Bitiş Durumu"
                    name="bitisDurumu"
                    value={yazarkasaFilters.bitisDurumu}
                    onChange={handleYazarkasaChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  >
                    <MenuItem value="">
                      Tümü
                    </MenuItem>

                    <MenuItem value="tarihiGecmis">
                      Tarihi Geçmiş
                    </MenuItem>

                    <MenuItem value="yaklasan">
                      Yaklaşan (30 Gün İçinde)
                    </MenuItem>

                    <MenuItem value="aktif">
                      Aktif
                    </MenuItem>
                  </TextField>
                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    md: 4,
                  }}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<FilterListIcon />}
                    onClick={handleYazarkasaFilter}
                    size="small"
                    sx={{
                      flex: 1,
                      height: "40px",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
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
                    onClick={handleYazarkasaClear}
                    size="small"
                    sx={{
                      height: "40px",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
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


            {/* YAZARKASA TABLOSU */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.02)",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  gap: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#334155",
                  }}
                >
                  Yazar Kasa Listesi
                </Typography>


                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Chip
                    label={`Toplam: ${filtrelenmisYazarkasalar.length}`}
                    size="small"
                    sx={{
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                      fontWeight: 600,
                    }}
                  />


                  <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportYazarkasa}
                    sx={excelButtonSx}
                  >
                    Excel'e Aktar
                  </Button>
                </Box>
              </Box>


              <TableContainer
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  overflowX: "auto",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                }}
              >
                <Table
                  sx={{
                    minWidth: "1480px",
                  }}
                >
                  <TableHead
                    sx={{
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Müşteri
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Şube
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          minWidth: "240px",
                          width: "280px",
                        }}
                      >
                        Resmi Ünvan
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Marka
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Sicil No
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Başlangıç
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Bitiş
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Kayıtlı Telefon
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          minWidth: "240px",
                          width: "280px",
                        }}
                      >
                        Notlar
                      </TableCell>
                    </TableRow>
                  </TableHead>


                  <TableBody>
                    {filtrelenmisYazarkasalar.length > 0 ? (
                      filtrelenmisYazarkasalar.map((row) => {
                        const bitisDurumu =
                          getYazarkasaBitisDurumu(
                            row.bitis_tarihi
                          );

                        return (
                          <TableRow
                            key={row.yazarkasa_id}
                            hover
                            sx={{
                              backgroundColor:
                                bitisDurumu?.rowBackground ||
                                "transparent",

                              "&:hover": {
                                backgroundColor:
                                  bitisDurumu?.rowBackground ||
                                  "#f8fafc",
                              },

                              "&:last-child td, &:last-child th": {
                                border: 0,
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                color: "#1e293b",
                                fontWeight: 600,
                              }}
                            >
                              {getYazarkasaMusteriAdi(row.sube_id)}
                            </TableCell>


                            <TableCell
                              sx={{
                                color: "#475569",
                                fontWeight: 500,
                              }}
                            >
                              {getYazarkasaSubeAdi(row.sube_id)}
                            </TableCell>


                            <TableCell
                              sx={{
                                color: "#475569",
                                minWidth: "240px",
                                width: "280px",
                                maxWidth: "320px",
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                lineHeight: 1.45,
                                verticalAlign: "top",
                              }}
                            >
                              {row.resmi_unvan || "-"}
                            </TableCell>


                            <TableCell
                              sx={{
                                color: "#334155",
                                fontWeight: 600,
                              }}
                            >
                              {row.marka || "-"}
                            </TableCell>


                            <TableCell
                              sx={{
                                color: "#334155",
                                fontWeight: 500,
                              }}
                            >
                              {row.sicil_no || "-"}
                            </TableCell>


                            <TableCell
                              sx={{
                                color: "#475569",
                              }}
                            >
                              {formatYazarkasaTarih(
                                row.baslangic_tarihi
                              )}
                            </TableCell>


                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  gap: 0.7,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color:
                                      bitisDurumu?.color ||
                                      "#475569",
                                    fontWeight:
                                      bitisDurumu
                                        ? 700
                                        : 400,
                                  }}
                                >
                                  {formatYazarkasaTarih(
                                    row.bitis_tarihi
                                  )}
                                </Typography>


                                {bitisDurumu && (
                                  <Chip
                                    label={bitisDurumu.label}
                                    size="small"
                                    sx={{
                                      height: "22px",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      color:
                                        bitisDurumu.color,
                                      backgroundColor:
                                        bitisDurumu.backgroundColor,
                                      borderRadius: "6px",

                                      "& .MuiChip-label": {
                                        px: 1,
                                      },
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>


                            <TableCell
                              sx={{
                                color: "#475569",
                              }}
                            >
                              {row.kayitli_tel_no || "-"}
                            </TableCell>


                            <TableCell
                              sx={{
                                color: "#475569",
                                minWidth: "240px",
                                width: "280px",
                                maxWidth: "320px",
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                lineHeight: 1.45,
                                verticalAlign: "top",
                              }}
                            >
                              {row.notlar || "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          align="center"
                          sx={{
                            py: 4,
                            color: "#94a3b8",
                          }}
                        >
                          Kriterlere uygun yazar kasa kaydı
                          bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    </>
  );
}


export default Reports;