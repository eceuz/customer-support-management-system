import { useEffect, useState } from "react";
import "../styles/callForm.css";

import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Autocomplete,
  Grid,
  Alert,
} from "@mui/material";

import { jwtDecode } from "jwt-decode";

import { getMusteriler } from "../api/musteriService";
import { getSubeler } from "../api/subeService";
import { getArizaTipleri } from "../api/arizaService";
import { createCagri, updateCagri } from "../api/cagriService";

function CallForm({
  selectedCall,
  setSelectedCall,
  refreshTable,
}) {
  const [musteriler, setMusteriler] = useState([]);
  const [subeler, setSubeler] = useState([]);
  const [arizaTipleri, setArizaTipleri] = useState([]);

  const [musteri, setMusteri] = useState(null);
  const [sube, setSube] = useState(null);
  const [arizaTipi, setArizaTipi] = useState(null);

  const [telefon, setTelefon] = useState("");
  const [gorusulenKisi, setGorusulenKisi] = useState("");
  const [yapilanlar, setYapilanlar] = useState("");
  const [sonuc, setSonuc] = useState("");

  const getFormattedLocalDateTime = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [tarih, setTarih] = useState(getFormattedLocalDateTime());

  const [mesaj, setMesaj] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const musteriResponse = await getMusteriler();
        setMusteriler(musteriResponse.data);

        const arizaResponse = await getArizaTipleri();
        setArizaTipleri(arizaResponse.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedCall) {
      setMusteri(null);
      setSube(null);
      setArizaTipi(null);
      setTelefon("");
      setGorusulenKisi("");
      setYapilanlar("");
      setSonuc("");
      setTarih(getFormattedLocalDateTime());
      setSubeler([]);
      setMesaj(null);
      return;
    }

    setTelefon(selectedCall.telefon || "");
    setGorusulenKisi(selectedCall.gorusulen_kisi || "");
    setYapilanlar(selectedCall.yapilanlar || "");
    setSonuc(selectedCall.sonuc || "");
    setTarih(getFormattedLocalDateTime(selectedCall.tarih));

    // Arıza tipini eşleştir
    const seciliAriza = arizaTipleri.find(
      (a) => a.ariza_tipi_adi === selectedCall.ariza_tipi_adi
    );
    if (seciliAriza) {
      setArizaTipi(seciliAriza);
    }

    // Müşteri ve Şube bilgilerini eşleştirmek için önce müşteriyi bulup şubelerini çekiyoruz
    if (selectedCall.musteri_adi && musteriler.length > 0) {
     const seciliMusteri = musteriler.find(
  (m) => m.musteri_id === selectedCall.musteri_id
);
      if (seciliMusteri) {
        setMusteri(seciliMusteri);

        // Şubeleri getir ve eşleşen şubeyi seç
        getSubeler(seciliMusteri.musteri_id)
          .then((res) => {
            setSubeler(res.data);
            const seciliSube = res.data.find(
              (s) => s.sube_adi === selectedCall.sube_adi
            );
            if (seciliSube) {
              setSube(seciliSube);
            }
          })
          .catch((err) => console.error(err));
      }
    }
  }, [selectedCall, musteriler, arizaTipleri]);

  // Formu sıfırlama yardımcı fonksiyonu
  const resetForm = () => {
    setSelectedCall(null);
    setMusteri(null);
    setSube(null);
    setArizaTipi(null);
    setTelefon("");
    setGorusulenKisi("");
    setYapilanlar("");
    setSonuc("");
    setTarih(getFormattedLocalDateTime());
    setSubeler([]);
  };

  const handleSave = async () => {
    if (!musteri || !sube || !arizaTipi) {
      setMesaj({ text: "Lütfen tüm zorunlu alanları doldurun.", severity: "error" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      // Yerel saat kaymasını (UTC hatasını) önleyen dönüşüm
      const formatLocalDateTimeToISO = (dateStr) => {
        const d = new Date(dateStr);
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString();
      };

      const payload = {
        sube_id: sube.sube_id,
        kullanici_id: Number(decoded.sub),
        ariza_tipi_id: arizaTipi.ariza_tipi_id,
        telefon,
        gorusulen_kisi: gorusulenKisi,
        yapilanlar,
        sonuc,
        // Sadece güncelleme modunda saat kayması olmadan tarihi gönderiyoruz
        ...(selectedCall && { tarih: formatLocalDateTimeToISO(tarih) }),
      };

      if (selectedCall) {
        // GÜNCELLEME İŞLEMİ
        await updateCagri(selectedCall.cagri_kaydi_id, payload);
        setMesaj({ text: "Kayıt başarıyla güncellendi.", severity: "success" });
      } else {
        // YENİ KAYIT İŞLEMİ
        await createCagri(payload);
        setMesaj({ text: "Kayıt başarıyla oluşturuldu.", severity: "success" });
      }

      resetForm();
      refreshTable(); // Tabloyu yenile
    } catch (error) {
      console.error(error);
      setMesaj({ 
        text: selectedCall ? "Kayıt güncellenemedi." : "Kayıt oluşturulamadı.", 
        severity: "error" 
      });
    }
  };

  return (
    <Paper elevation={0} className="call-form">
      <Typography className="form-title" variant="h5">
        {selectedCall ? "✏️ Çağrı Güncelle" : "📞 Yeni Destek Kaydı"}
      </Typography>

      {/* Uygulama içi şık bildirim alanı */}
      {mesaj && (
        <Alert 
          sx={{ mb: 2 }} 
          severity={mesaj.severity}
          onClose={() => setMesaj(null)}
        >
          {mesaj.text}
        </Alert>
      )}

      {/* Tarih ve Saat Alanı - SADECE GÜNCELLEME EKRANINDA GÖRÜNÜR */}
      {selectedCall && (
        <div className="form-section" style={{ marginBottom: "15px" }}>
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Çağrı Tarihi ve Saati"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              input: {
                sx: { color: "text.primary" },
              },
            }}
          />
        </div>
      )}

      <div className="form-section">
        <Typography className="section-title">
          Müşteri Bilgileri
        </Typography>

        <Autocomplete
  options={musteriler}
  value={musteri}
  getOptionLabel={(option) => option.musteri_adi || ""}
  isOptionEqualToValue={(option, value) =>
    option.musteri_id === value.musteri_id
  }
  renderOption={(props, option) => (
    <li {...props} key={option.musteri_id}>
      {option.musteri_adi}
    </li>
  )}
  onChange={async (e, value) => {
    setMusteri(value);
    setSube(null);

    if (!value) {
      setSubeler([]);
      return;
    }

    try {
      const response = await getSubeler(value.musteri_id);
      setSubeler(response.data);
    } catch (error) {
      console.error(error);
    }
  }}
  renderInput={(params) => (
    <TextField {...params} label="Müşteri Ara" />
  )}
/>

        <Autocomplete
          sx={{ mt: 2 }}
          disabled={!musteri}
          options={subeler}
          value={sube}
          getOptionLabel={(option) => option.sube_adi || ""}
          isOptionEqualToValue={(option, value) =>
            option.sube_id === value.sube_id
          }
          onChange={(e, value) => setSube(value)}
          renderInput={(params) => (
            <TextField {...params} label="Şube" />
          )}
        />

        {sube && (
          <Alert
            sx={{ mt: 2 }}
            severity={
              sube.bakim_anlasmasi_var_mi ? "success" : "error"
            }
          >
            {sube.bakim_anlasmasi_var_mi
              ? "Bu şubenin bakım anlaşması bulunmaktadır."
              : "Bu şubenin bakım anlaşması bulunmamaktadır."}
          </Alert>
        )}
      </div>

      <div className="form-section">
        <Typography className="section-title">
          Çağrı Bilgileri
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Telefon"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Görüşülen Kişi"
              value={gorusulenKisi}
              onChange={(e) => setGorusulenKisi(e.target.value)}
            />
          </Grid>
        </Grid>

        <Autocomplete
          sx={{ mt: 2 }}
          options={arizaTipleri}
          value={arizaTipi}
          getOptionLabel={(option) => option.ariza_tipi_adi || ""}
          isOptionEqualToValue={(option, value) =>
            option.ariza_tipi_id === value.ariza_tipi_id
          }
          onChange={(e, value) => setArizaTipi(value)}
          renderInput={(params) => (
            <TextField {...params} label="Arıza Tipi" />
          )}
        />

        <TextField
          sx={{ mt: 2 }}
          fullWidth
          multiline
          rows={7}
          label="Yapılan İşlem"
          value={yapilanlar}
          onChange={(e) => setYapilanlar(e.target.value)}
        />

        <TextField
          sx={{ mt: 2 }}
          fullWidth
          select
          label="Sonuç"
          value={sonuc}
          onChange={(e) => setSonuc(e.target.value)}
        >
          <MenuItem value="Çözüldü">Çözüldü</MenuItem>
          <MenuItem value="Beklemede">Beklemede</MenuItem>
          <MenuItem value="Servise Aktarıldı">
            Servise Aktarıldı
          </MenuItem>
          <MenuItem value="Müşteri Dönüş Bekleniyor">
            Müşteri Dönüş Bekleniyor
          </MenuItem>
        </TextField>

        <div className="button-area" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <Button
            variant="contained"
            className="save-button"
            color={selectedCall ? "warning" : "primary"}
            onClick={handleSave}
            fullWidth
          >
            {selectedCall ? "Güncellemeyi Kaydet" : "Kaydı Kaydet"}
          </Button>

          {selectedCall && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={resetForm}
            >
              İptal
            </Button>
          )}
        </div>
      </div>
    </Paper>
  );
}

export default CallForm;