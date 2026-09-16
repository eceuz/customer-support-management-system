import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Alert,
} from "@mui/material";

import "../styles/callForm.css";

import { getMusteriler } from "../api/musteriService";
import { getSubeler } from "../api/subeService";
import { getUserRole } from "../api/authService";

import { createAriza } from "../api/yerindeDestekService";


function YerindeDestekForm({ onRefresh }) {

  const [musteriler, setMusteriler] = useState([]);
  const [subeler, setSubeler] = useState([]);

  const [musteri, setMusteri] = useState(null);
  const [sube, setSube] = useState(null);

  const [sorun, setSorun] = useState("");

  const [mesaj, setMesaj] = useState(null);

  const rol = getUserRole();
  const izleyiciMi = rol === "İZLEYİCİ";


  // =========================================================
  // MÜŞTERİLERİ YÜKLE
  // =========================================================

  useEffect(() => {

    const loadMusteriler = async () => {

      try {

        const response = await getMusteriler();

        setMusteriler(
          response.data || []
        );

      } catch (error) {

        console.error(
          "Müşteriler yüklenemedi:",
          error
        );

      }

    };

    loadMusteriler();

  }, []);


  // =========================================================
  // FORMU TEMİZLE
  // =========================================================

  const resetForm = () => {

    setMusteri(null);
    setSube(null);

    setSubeler([]);

    setSorun("");

  };


  // =========================================================
  // KAYDET
  // =========================================================

  const handleSave = async () => {

    if (izleyiciMi) {

      setMesaj({
        text: "Bu işlemi yapmaya yetkiniz bulunmuyor.",
        severity: "warning",
      });

      return;
    }


    if (
      !musteri ||
      !sube ||
      !sorun.trim()
    ) {

      setMesaj({
        text: "Lütfen müşteri, şube ve sorun alanlarını doldurun.",
        severity: "error",
      });

      return;
    }


    const payload = {

      sube_id: sube.sube_id,

      sorun: sorun.trim(),

    };


    try {

      await createAriza(payload);


      setMesaj({
        text: "Yerinde destek kaydı başarıyla oluşturuldu.",
        severity: "success",
      });


      resetForm();


      if (onRefresh) {
        onRefresh();
      }


    } catch (error) {

      console.error(
        "Yerinde destek kaydı oluşturulamadı:",
        error
      );


      setMesaj({
        text:
          error.response?.data?.detail ||
          "Yerinde destek kaydı oluşturulamadı.",
        severity: "error",
      });

    }

  };


  // =========================================================
  // EKRAN
  // =========================================================

  return (

    <Paper
      elevation={0}
      className="call-form"
    >

      <Typography
        className="form-title"
        variant="h5"
      >
        🛠️ Yeni Yerinde Destek Kaydı
      </Typography>


      {izleyiciMi && (

        <Alert
          severity="info"
          sx={{
            mb: 2,
            borderRadius: "10px",
          }}
        >
          Yerinde destek kayıtlarını görüntüleyebilirsiniz.
          Yeni kayıt oluşturma yetkiniz bulunmamaktadır.
        </Alert>

      )}


      {mesaj && (

        <Alert
          sx={{
            mb: 2,
          }}
          severity={mesaj.severity}
          onClose={() =>
            setMesaj(null)
          }
        >
          {mesaj.text}
        </Alert>

      )}

      <div className="form-section">

        <Typography className="section-title">
          Müşteri Bilgileri
        </Typography>


        {/* MÜŞTERİ */}

        <Autocomplete
          options={musteriler}
          value={musteri}
          disabled={izleyiciMi}

          getOptionLabel={(option) =>
            option.musteri_adi ||
            option.cari_adi ||
            ""
          }

          isOptionEqualToValue={(
            option,
            value
          ) =>
            option.musteri_id ===
            value.musteri_id
          }

          onChange={async (
            event,
            value
          ) => {

            setMusteri(value);

            setSube(null);
            setSubeler([]);


            if (!value) {
              return;
            }


            try {

              const response =
                await getSubeler(
                  value.musteri_id
                );


              setSubeler(
                response.data || []
              );


            } catch (error) {

              console.error(
                "Şubeler alınamadı:",
                error
              );

            }

          }}

          renderInput={(params) => (

            <TextField
              {...params}
              label="Müşteri Ara"
            />

          )}
        />


        {/* ŞUBE */}

        <Autocomplete
          sx={{
            mt: 2,
          }}

          options={subeler}
          value={sube}

          disabled={
            !musteri ||
            izleyiciMi
          }

          getOptionLabel={(option) =>
            option.sube_adi || ""
          }

          isOptionEqualToValue={(
            option,
            value
          ) =>
            option.sube_id ===
            value.sube_id
          }

          onChange={(event, value) =>
            setSube(value)
          }

          renderInput={(params) => (

            <TextField
              {...params}
              label="Şube"
              placeholder={
                musteri
                  ? "Şube seçiniz"
                  : "Önce müşteri seçiniz"
              }
            />

          )}
        />

      </div>


      {/* ================================================= */}
      {/* SORUN */}
      {/* ================================================= */}

      <div className="form-section">

        <Typography className="section-title">
          Arıza Bilgisi
        </Typography>


        <TextField
          fullWidth
          multiline
          rows={7}

          label="Sorun"

          value={sorun}

          disabled={izleyiciMi}

          onChange={(e) =>
            setSorun(
              e.target.value
            )
          }
        />


        {!izleyiciMi && (

          <div
            className="button-area"
            style={{
              marginTop: "15px",
            }}
          >

            <Button
              variant="contained"
              className="save-button"
              fullWidth
              onClick={handleSave}
            >
              Kaydı Kaydet
            </Button>

          </div>

        )}

      </div>

    </Paper>

  );

}


export default YerindeDestekForm;