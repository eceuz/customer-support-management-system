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

import { getMusteriler } from "../api/musteriService";
import { getSubeler } from "../api/subeService";
import { getArizaTipleri } from "../api/arizaService";

import {
  createCagri,
  updateCagri,
  getSonucSecenekleri,
} from "../api/cagriService";

import {
  getUserRole,
  getCurrentUserId,
  getCurrentUsername,
} from "../api/authService";


// =========================================================
// HER ZAMAN GÖRÜNECEK STANDART SONUÇLAR
// =========================================================

const STANDART_SONUCLAR = [
  "Çözüldü",
  "Beklemede",
  "Servise Aktarıldı",
  "Müşteri Dönüş Bekleniyor",
];


// =========================================================
// SONUÇ YAZIMINI DÜZENLE
// =========================================================

const normalizeSonuc = (value) => {
  if (!value) {
    return "";
  }

  const temiz = value
    .trim()
    .replace(/\s+/g, " ");

  const kucuk =
    temiz.toLocaleLowerCase("tr-TR");


  // Dashboard için önemli olan sonuçlar
  // her zaman birebir aynı kaydedilsin.
  const standartSonucMap = {
    "çözüldü": "Çözüldü",
    "beklemede": "Beklemede",
    "servise aktarıldı":
      "Servise Aktarıldı",
    "müşteri dönüş bekleniyor":
      "Müşteri Dönüş Bekleniyor",
  };


  if (standartSonucMap[kucuk]) {
    return standartSonucMap[kucuk];
  }


  // Manuel girilen diğer sonuçların
  // her kelimesinin ilk harfini büyüt.
  return kucuk
    .split(" ")
    .map((kelime) => {
      if (!kelime) {
        return "";
      }

      return (
        kelime
          .charAt(0)
          .toLocaleUpperCase("tr-TR") +
        kelime.slice(1)
      );
    })
    .join(" ");
};


// =========================================================
// STANDART + VERİTABANI SONUÇLARINI BİRLEŞTİR
// =========================================================

const sonucListesiOlustur = (dbSonuclari = []) => {
  const tumSonuclar = [
    ...STANDART_SONUCLAR,
    ...dbSonuclari,
  ];

  const gorulenler = new Set();

  return tumSonuclar
    .map((sonuc) =>
      normalizeSonuc(sonuc)
    )
    .filter((sonuc) => {
      if (!sonuc) {
        return false;
      }

      // "Diğer" bizim özel menü seçeneğimiz.
      if (
        sonuc.toLocaleLowerCase("tr-TR") ===
        "diğer"
      ) {
        return false;
      }

      const anahtar =
        sonuc.toLocaleLowerCase("tr-TR");

      if (gorulenler.has(anahtar)) {
        return false;
      }

      gorulenler.add(anahtar);

      return true;
    });
};


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

  // SONUÇ
  const [
    sonucSecenekleri,
    setSonucSecenekleri
  ] = useState(STANDART_SONUCLAR);

  const [
    sonucSecimi,
    setSonucSecimi
  ] = useState("");

  const [
    manuelSonuc,
    setManuelSonuc
  ] = useState("");

  const [mesaj, setMesaj] = useState(null);


  const rol = getUserRole();
  const izleyiciMi = rol === "İZLEYİCİ";


  // =========================================================
  // TARİH FORMATLAMA
  // =========================================================

  const getFormattedLocalDateTime = (dateString) => {
    const date = dateString
      ? new Date(dateString)
      : new Date();

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };


  const [tarih, setTarih] = useState(
    getFormattedLocalDateTime()
  );


  // =========================================================
  // İLK VERİLERİ YÜKLE
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {

        const [
          musteriResponse,
          arizaResponse,
          sonucResponse,
        ] = await Promise.all([
          getMusteriler(),
          getArizaTipleri(),
          getSonucSecenekleri(),
        ]);


        setMusteriler(
          musteriResponse.data
        );


        setArizaTipleri(
          arizaResponse.data
        );


        // Standart sonuçlar +
        // CAGRI_KAYITLARI.sonuc içindeki sonuçlar
        setSonucSecenekleri(
          sonucListesiOlustur(
            sonucResponse.data
          )
        );

      } catch (error) {
        console.error(
          "Form verileri yüklenemedi:",
          error
        );
      }
    };


    loadData();

  }, []);


  // =========================================================
  // DÜZENLENECEK ÇAĞRIYI FORMA YÜKLE
  // =========================================================

  useEffect(() => {

    // YENİ KAYIT
    if (!selectedCall) {

      setMusteri(null);
      setSube(null);
      setArizaTipi(null);

      setTelefon("");
      setGorusulenKisi("");
      setYapilanlar("");

      setSonucSecimi("");
      setManuelSonuc("");

      setTarih(
        getFormattedLocalDateTime()
      );

      setSubeler([]);

      return;
    }


    // =====================================================
    // TEMEL BİLGİLER
    // =====================================================

    setTelefon(
      selectedCall.telefon || ""
    );


    setGorusulenKisi(
      selectedCall.gorusulen_kisi || ""
    );


    setYapilanlar(
      selectedCall.yapilanlar || ""
    );


    // =====================================================
    // SONUÇ
    // =====================================================

    const kayitSonucu =
      normalizeSonuc(
        selectedCall.sonuc || ""
      );


    if (!kayitSonucu) {

      setSonucSecimi("");
      setManuelSonuc("");

    } else {

      const bulunanSonuc =
        sonucSecenekleri.find(
          (item) =>
            item.toLocaleLowerCase(
              "tr-TR"
            ) ===
            kayitSonucu.toLocaleLowerCase(
              "tr-TR"
            )
        );


      if (bulunanSonuc) {

        // Daha önce kullanılmış bir sonuçsa
        // dropdown'da doğrudan seç.
        setSonucSecimi(
          bulunanSonuc
        );

        setManuelSonuc("");

      } else {

        // Herhangi bir nedenle listede yoksa
        // Diğer alanında göster.
        setSonucSecimi("Diğer");

        setManuelSonuc(
          kayitSonucu
        );

      }

    }


    // =====================================================
    // TARİH
    // =====================================================

    setTarih(
      getFormattedLocalDateTime(
        selectedCall.tarih
      )
    );


    // =====================================================
    // ARIZA TİPİ
    // =====================================================

    const seciliAriza =
      arizaTipleri.find(
        (a) =>
          a.ariza_tipi_adi ===
          selectedCall.ariza_tipi_adi
      );


    if (seciliAriza) {
      setArizaTipi(seciliAriza);
    }


    // =====================================================
    // MÜŞTERİ VE ŞUBE
    // =====================================================

    if (
      selectedCall.musteri_adi &&
      musteriler.length > 0
    ) {

      const seciliMusteri =
        musteriler.find(
          (m) =>
            m.musteri_id ===
            selectedCall.musteri_id
        );


      if (seciliMusteri) {

        setMusteri(seciliMusteri);


        getSubeler(
          seciliMusteri.musteri_id
        )
          .then((res) => {

            setSubeler(res.data);


            const seciliSube =
              res.data.find(
                (s) =>
                  s.sube_adi ===
                  selectedCall.sube_adi
              );


            if (seciliSube) {
              setSube(seciliSube);
            }

          })
          .catch((err) =>
            console.error(err)
          );

      }

    }

  }, [
    selectedCall,
    musteriler,
    arizaTipleri,
    sonucSecenekleri,
  ]);


  // =========================================================
  // FORMU TEMİZLE
  // =========================================================

  const resetForm = () => {

    setSelectedCall(null);

    setMusteri(null);
    setSube(null);
    setArizaTipi(null);

    setTelefon("");
    setGorusulenKisi("");
    setYapilanlar("");

    setSonucSecimi("");
    setManuelSonuc("");

    setTarih(
      getFormattedLocalDateTime()
    );

    setSubeler([]);

  };


  // =========================================================
  // YETKİ KONTROLÜ
  // =========================================================

  const selectedCallDuzenlenebilirMi = () => {

    // Yeni kayıt
    if (!selectedCall) {
      return (
        rol === "ADMİN" ||
        rol === "DESTEK"
      );
    }


    // Admin tüm çağrıları düzenleyebilir
    if (rol === "ADMİN") {
      return true;
    }


    // İzleyici düzenleyemez
    if (rol === "İZLEYİCİ") {
      return false;
    }


    // Destek sadece kendi çağrısını düzenleyebilir
    if (rol === "DESTEK") {

      const currentUserId =
        getCurrentUserId();

      const currentUsername =
        getCurrentUsername();


      if (
        selectedCall.kullanici_id !==
          undefined &&
        selectedCall.kullanici_id !==
          null &&
        currentUserId !== null
      ) {

        return (
          Number(
            selectedCall.kullanici_id
          ) ===
          Number(currentUserId)
        );

      }


      return (
        currentUsername &&
        selectedCall.kullanici_adi ===
          currentUsername
      );

    }


    return false;
  };


  // =========================================================
  // KAYDET
  // =========================================================

  const handleSave = async () => {

    // YETKİ
    if (!selectedCallDuzenlenebilirMi()) {

      if (
        rol === "DESTEK" &&
        selectedCall
      ) {

        setMesaj({
          text:
            "Sadece kendi çağrı kayıtlarınızı düzenleyebilirsiniz.",
          severity: "warning",
        });

      } else {

        setMesaj({
          text:
            "Bu işlemi yapmaya yetkili değilsiniz.",
          severity: "warning",
        });

      }

      return;
    }


    // ZORUNLU ALANLAR
    if (
      !musteri ||
      !sube ||
      !arizaTipi
    ) {

      setMesaj({
        text:
          "Lütfen tüm zorunlu alanları doldurun.",
        severity: "error",
      });

      return;
    }


    // DİĞER SEÇİLDİ AMA YAZI YOK
    if (
      sonucSecimi === "Diğer" &&
      !manuelSonuc.trim()
    ) {

      setMesaj({
        text:
          "Lütfen manuel sonuç bilgisini giriniz.",
        severity: "warning",
      });

      return;
    }


    // KAYDEDİLECEK SONUÇ
    const kaydedilecekSonuc =
      sonucSecimi === "Diğer"
        ? normalizeSonuc(
            manuelSonuc
          )
        : normalizeSonuc(
            sonucSecimi
          );


    try {

      const currentUserId =
        getCurrentUserId();


      if (!currentUserId) {

        setMesaj({
          text:
            "Oturum bilgisi alınamadı.",
          severity: "error",
        });

        return;
      }


      const formatLocalDateTimeToISO = (
        dateStr
      ) => {

        const d =
          new Date(dateStr);

        const tzOffset =
          d.getTimezoneOffset() *
          60000;

        return new Date(
          d.getTime() - tzOffset
        ).toISOString();

      };


      const payload = {

        sube_id:
          sube.sube_id,

        kullanici_id:
          currentUserId,

        ariza_tipi_id:
          arizaTipi.ariza_tipi_id,

        telefon,

        gorusulen_kisi:
          gorusulenKisi,

        yapilanlar,

        sonuc:
          kaydedilecekSonuc,

        ...(selectedCall && {
          tarih:
            formatLocalDateTimeToISO(
              tarih
            ),
        }),

      };


      // ===================================================
      // GÜNCELLEME / YENİ KAYIT
      // ===================================================

      if (selectedCall) {

        await updateCagri(
          selectedCall.cagri_kaydi_id,
          payload
        );


        setMesaj({
          text:
            "Kayıt başarıyla güncellendi.",
          severity: "success",
        });


      } else {

        await createCagri(payload);


        setMesaj({
          text:
            "Kayıt başarıyla oluşturuldu.",
          severity: "success",
        });

      }


      // ===================================================
      // YENİ MANUEL SONUCU ANINDA DROPDOWN'A EKLE
      // ===================================================

      if (kaydedilecekSonuc) {

        setSonucSecenekleri(
          (onceki) =>
            sonucListesiOlustur([
              ...onceki,
              kaydedilecekSonuc,
            ])
        );

      }


      resetForm();

      refreshTable();


    } catch (error) {

      console.error(error);


      if (
        error.response?.status === 403
      ) {

        setMesaj({
          text:
            error.response?.data?.detail ||
            "Bu işlemi yapmaya yetkili değilsiniz.",
          severity: "warning",
        });

        return;
      }


      setMesaj({
        text: selectedCall
          ? "Kayıt güncellenemedi."
          : "Kayıt oluşturulamadı.",
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
        {selectedCall
          ? "✏️ Çağrı Güncelle"
          : "📞 Yeni Destek Kaydı"}
      </Typography>


      {/* İZLEYİCİ */}
      {izleyiciMi && (

        <Alert
          severity="info"
          sx={{
            mb: 2,
            borderRadius: "10px",
          }}
        >
          Destek kayıtlarını görüntüleyebilirsiniz. Yeni destek kaydı oluşturma
          veya mevcut kayıtları değiştirme yetkiniz bulunmamaktadır.
        </Alert>

      )}


      {/* MESAJ */}
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


      {/* TARİH */}
      {selectedCall && (

        <div
          className="form-section"
          style={{
            marginBottom: "15px",
          }}
        >

          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Çağrı Tarihi ve Saati"
            value={tarih}
            disabled={izleyiciMi}
            onChange={(e) =>
              setTarih(
                e.target.value
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              input: {
                sx: {
                  color: "text.primary",
                },
              },
            }}
          />

        </div>

      )}


      {/* ================================================= */}
      {/* MÜŞTERİ BİLGİLERİ */}
      {/* ================================================= */}

      <div className="form-section">

        <Typography className="section-title">
          Müşteri Bilgileri
        </Typography>


        <Autocomplete
          options={musteriler}
          value={musteri}
          disabled={izleyiciMi}
          getOptionLabel={(option) =>
            option.musteri_adi || ""
          }
          isOptionEqualToValue={(
            option,
            value
          ) =>
            option.musteri_id ===
            value.musteri_id
          }
          renderOption={(
            props,
            option
          ) => (

            <li
              {...props}
              key={option.musteri_id}
            >
              {option.musteri_adi}
            </li>

          )}
          onChange={async (
            e,
            value
          ) => {

            setMusteri(value);
            setSube(null);


            if (!value) {
              setSubeler([]);
              return;
            }


            try {

              const response =
                await getSubeler(
                  value.musteri_id
                );

              setSubeler(
                response.data
              );

            } catch (error) {

              console.error(error);

            }

          }}
          renderInput={(params) => (

            <TextField
              {...params}
              label="Müşteri Ara"
            />

          )}
        />


        <Autocomplete
          sx={{
            mt: 2,
          }}
          disabled={
            !musteri ||
            izleyiciMi
          }
          options={subeler}
          value={sube}
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
          onChange={(e, value) =>
            setSube(value)
          }
          renderInput={(params) => (

            <TextField
              {...params}
              label="Şube"
            />

          )}
        />


        {sube && (

          <Alert
            sx={{
              mt: 2,
            }}
            severity={
              sube.bakim_anlasmasi_var_mi
                ? "success"
                : "error"
            }
          >
            {sube.bakim_anlasmasi_var_mi
              ? "Bu şubenin telefon destek anlaşması bulunmaktadır."
              : "Bu şubenin telefon destek anlaşması bulunmamaktadır."}
          </Alert>

        )}

      </div>


      {/* ================================================= */}
      {/* ÇAĞRI BİLGİLERİ */}
      {/* ================================================= */}

      <div className="form-section">

        <Typography className="section-title">
          Çağrı Bilgileri
        </Typography>


        <Grid
          container
          spacing={2}
        >

          <Grid
            size={{
              xs: 6,
            }}
          >

            <TextField
              fullWidth
              label="Telefon"
              value={telefon}
              disabled={izleyiciMi}
              onChange={(e) =>
                setTelefon(
                  e.target.value
                )
              }
            />

          </Grid>


          <Grid
            size={{
              xs: 6,
            }}
          >

            <TextField
              fullWidth
              label="Görüşülen Kişi"
              value={gorusulenKisi}
              disabled={izleyiciMi}
              onChange={(e) =>
                setGorusulenKisi(
                  e.target.value
                )
              }
            />

          </Grid>

        </Grid>


        {/* ARIZA TİPİ */}
        <Autocomplete
          sx={{
            mt: 2,
          }}
          options={arizaTipleri}
          value={arizaTipi}
          disabled={izleyiciMi}
          getOptionLabel={(option) =>
            option.ariza_tipi_adi || ""
          }
          isOptionEqualToValue={(
            option,
            value
          ) =>
            option.ariza_tipi_id ===
            value.ariza_tipi_id
          }
          onChange={(e, value) =>
            setArizaTipi(value)
          }
          renderInput={(params) => (

            <TextField
              {...params}
              label="Arıza Tipi"
            />

          )}
        />


        {/* YAPILAN İŞLEM */}
        <TextField
          sx={{
            mt: 2,
          }}
          fullWidth
          multiline
          rows={7}
          label="Yapılan İşlem"
          value={yapilanlar}
          disabled={izleyiciMi}
          onChange={(e) =>
            setYapilanlar(
              e.target.value
            )
          }
        />


        {/* ================================================= */}
        {/* SONUÇ DROPDOWN */}
        {/* ================================================= */}

        <TextField
          sx={{
            mt: 2,
          }}
          fullWidth
          select
          label="Sonuç"
          value={sonucSecimi}
          disabled={izleyiciMi}
          onChange={(e) => {

            const value =
              e.target.value;

            setSonucSecimi(
              value
            );


            if (value !== "Diğer") {
              setManuelSonuc("");
            }

          }}
        >

          <MenuItem value="">
            Sonuç Seçiniz
          </MenuItem>


          {/* DB'DEN + STANDART SONUÇLAR */}
          {sonucSecenekleri.map(
            (secenek) => (

              <MenuItem
                key={secenek}
                value={secenek}
              >
                {secenek}
              </MenuItem>

            )
          )}


          <MenuItem value="Diğer">
            Diğer...
          </MenuItem>

        </TextField>


        {/* ================================================= */}
        {/* MANUEL SONUÇ */}
        {/* ================================================= */}

        {sonucSecimi === "Diğer" && (

          <TextField
            sx={{
              mt: 2,
            }}
            fullWidth
            label="Yeni Sonuç"
            value={manuelSonuc}
            disabled={izleyiciMi}
            onChange={(e) =>
              setManuelSonuc(
                e.target.value
              )
            }
            slotProps={{
              htmlInput: {
                maxLength: 50,
              },
            }}
            helperText={`${manuelSonuc.length}/50`}
          />

        )}


        {/* BUTONLAR */}
        <div
          className="button-area"
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
          }}
        >

          {!izleyiciMi && (
            <Button
              variant="contained"
              className="save-button"
              color={
                selectedCall
                  ? "warning"
                  : "primary"
              }
              onClick={handleSave}
              fullWidth
            >
              {selectedCall
                ? "Güncellemeyi Kaydet"
                : "Kaydı Kaydet"}
            </Button>
          )}


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