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
import { createCagri } from "../api/cagriService";

function CallForm() {
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

  const handleSave = async () => {
    if (!musteri || !sube || !arizaTipi) {
      alert("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      await createCagri({
        sube_id: sube.sube_id,
        kullanici_id: Number(decoded.sub),
        ariza_tipi_id: arizaTipi.ariza_tipi_id,
        telefon,
        gorusulen_kisi: gorusulenKisi,
        yapilanlar,
        sonuc,
      });

      alert("Kayıt başarıyla oluşturuldu.");

      setMusteri(null);
      setSube(null);
      setArizaTipi(null);

      setTelefon("");
      setGorusulenKisi("");
      setYapilanlar("");
      setSonuc("");

      setSubeler([]);
    } catch (error) {
      console.error(error);
      alert("Kayıt oluşturulamadı.");
    }
  };

  return (
    <Paper elevation={0} className="call-form">
      <Typography className="form-title" variant="h5">
        📞 Yeni Destek Kaydı
      </Typography>

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
          onChange={async (e, value) => {
            setMusteri(value);
            setSube(null);

            if (!value) {
              setSubeler([]);
              return;
            }

            try {
              const response = await getSubeler(value.musteri_id);

              console.log("Müşteri ID:", value.musteri_id);
              console.log("Gelen şubeler:", response.data);

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
          <Grid xs={6}>
            <TextField
              fullWidth
              label="Telefon"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
          </Grid>

          <Grid xs={6}>
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

        <div className="button-area">
          <Button
            variant="contained"
            className="save-button"
            onClick={handleSave}
          >
            Kaydı Kaydet
          </Button>
        </div>
      </div>
    </Paper>
  );
}

export default CallForm;