import { useEffect, useMemo, useState } from "react";

import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";


const bosForm = {
  musteri_id: "",
  sube_id: "",
  marka: "",
  sicil_no: "",
  baslangic_tarihi: "",
  bitis_tarihi: "",
  kayitli_tel_no: "",
  resmi_unvan:"",
  notlar: "",
};


function YazarKasaDialog({
  open,
  mode,
  selectedYazarkasa,
  musteriler = [],
  subeler = [],
  onClose,
  onSave,
  onDelete,
}) {

  const [form, setForm] =
    useState(bosForm);


  // =========================================================
  // DIALOG AÇILDIĞINDA FORMU HAZIRLA
  // =========================================================

  useEffect(() => {

    if (!open) {
      return;
    }


    // DÜZENLEME
    if (
      mode === "edit" &&
      selectedYazarkasa
    ) {

      const seciliSube =
        subeler.find(
          (sube) =>
            Number(sube.sube_id) ===
            Number(selectedYazarkasa.sube_id)
        );


      setForm({

        musteri_id:
          seciliSube?.musteri_id || "",

        sube_id:
          selectedYazarkasa.sube_id || "",

        marka:
          selectedYazarkasa.marka || "",

        sicil_no:
          selectedYazarkasa.sicil_no || "",

        baslangic_tarihi:
          selectedYazarkasa.baslangic_tarihi || "",

        bitis_tarihi:
          selectedYazarkasa.bitis_tarihi || "",

        kayitli_tel_no:
          selectedYazarkasa.kayitli_tel_no || "",
        
        resmi_unvan:
          selectedYazarkasa.resmi_unvan || "",

        notlar:
          selectedYazarkasa.notlar || "",
          

      });

      return;
    }


    // YENİ KAYIT
    if (mode === "create") {

      setForm(bosForm);

    }

  }, [
    open,
    mode,
    selectedYazarkasa,
    subeler,
  ]);


  // =========================================================
  // SEÇİLİ MÜŞTERİ
  // =========================================================

  const seciliMusteri =
    musteriler.find(
      (musteri) =>
        Number(musteri.musteri_id) ===
        Number(form.musteri_id)
    ) || null;


  // =========================================================
  // MÜŞTERİ ADINI GÖSTER
  // =========================================================

  const getMusteriLabel = (musteri) => {

    if (!musteri) {
      return "";
    }

    return (
      musteri.musteri_adi ||
      musteri.cari_adi ||
      ""
    );

  };


  // =========================================================
  // MÜŞTERİ ARAMA
  //
  // "a" yazılırsa A ile başlayanları getirir.
  // Hem müşteri adı hem cari adı kontrol edilir.
  // =========================================================

  const musteriFiltrele = (
    options,
    { inputValue }
  ) => {

    const aranan =
      inputValue
        .trim()
        .toLocaleLowerCase("tr-TR");


    // Henüz bir şey yazılmadıysa
    // bütün müşterileri göster
    if (!aranan) {
      return options;
    }


    return options.filter(
      (musteri) => {

        const musteriAdi =
          (musteri.musteri_adi || "")
            .trim()
            .toLocaleLowerCase("tr-TR");

        const cariAdi =
          (musteri.cari_adi || "")
            .trim()
            .toLocaleLowerCase("tr-TR");


        return (
          musteriAdi.startsWith(aranan) ||
          cariAdi.startsWith(aranan)
        );

      }
    );

  };


  // =========================================================
  // MÜŞTERİYE GÖRE ŞUBELER
  // =========================================================

  const filtreliSubeler =
    useMemo(() => {

      if (!form.musteri_id) {
        return [];
      }


      return subeler.filter(
        (sube) =>
          Number(sube.musteri_id) ===
          Number(form.musteri_id)
      );

    }, [
      subeler,
      form.musteri_id,
    ]);


  // =========================================================
  // MÜŞTERİ SEÇİMİ
  // =========================================================

  const handleMusteriChange = (
    event,
    yeniMusteri
  ) => {

    setForm((onceki) => ({

      ...onceki,

      musteri_id:
        yeniMusteri
          ? yeniMusteri.musteri_id
          : "",

      // Müşteri değişirse
      // önceki müşterinin şubesi temizlensin
      sube_id: "",

    }));

  };


  // =========================================================
  // DİĞER ALANLAR
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm((onceki) => ({
      ...onceki,
      [name]: value,
    }));

  };


  // =========================================================
  // KAYDET
  // =========================================================

  const handleKaydet = () => {

    if (
      !form.musteri_id ||
      !form.sube_id ||
      !form.marka.trim() ||
      !form.sicil_no.trim()
    ) {
      return;
    }


    onSave({

      sube_id:
        Number(form.sube_id),

      marka:
        form.marka.trim(),

      sicil_no:
        form.sicil_no.trim(),

      baslangic_tarihi:
        form.baslangic_tarihi || null,

      bitis_tarihi:
        form.bitis_tarihi || null,

      kayitli_tel_no:
        form.kayitli_tel_no.trim() || null,
      resmi_unvan:
        form.resmi_unvan.trim() || null,

      notlar:
        form.notlar.trim() || null,

    });

  };


  // =========================================================
  // SİLME MODU
  // =========================================================

  if (mode === "delete") {

    return (

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
      >

        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          Yazar Kasa Kaydını Sil
        </DialogTitle>


        <DialogContent>

          <Typography
            sx={{
              color: "#64748b",
              mt: 1,
            }}
          >

            <strong>
              {selectedYazarkasa?.marka}
            </strong>

            {" - "}

            {selectedYazarkasa?.sicil_no}

            {" "}

            numaralı yazar kasa kaydını
            silmek istediğinize emin misiniz?

          </Typography>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >

          <Button
            onClick={onClose}
            sx={{
              textTransform: "none",
            }}
          >
            İptal
          </Button>


          <Button
            color="error"
            variant="contained"
            onClick={onDelete}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              boxShadow: "none",
              fontWeight: 600,
            }}
          >
            Sil
          </Button>

        </DialogActions>

      </Dialog>

    );

  }


  // =========================================================
  // YENİ / DÜZENLE
  // =========================================================

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >

      <DialogTitle
        sx={{
          fontWeight: 700,
          color: "#1e293b",
        }}
      >

        {mode === "edit"
          ? "Yazar Kasa Düzenle"
          : "Yeni Yazar Kasa"}

      </DialogTitle>


      <DialogContent>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >

          {/* =================================================
              MÜŞTERİ ARA
          ================================================= */}

          <Autocomplete
            fullWidth

            options={musteriler}

            value={seciliMusteri}

            onChange={
              handleMusteriChange
            }

            filterOptions={
              musteriFiltrele
            }

            getOptionLabel={
              getMusteriLabel
            }

            isOptionEqualToValue={(
              option,
              value
            ) =>
              Number(option.musteri_id) ===
              Number(value.musteri_id)
            }

            autoHighlight

            openOnFocus

            noOptionsText="Müşteri bulunamadı"

            renderOption={(
              props,
              option
            ) => (

              <li
                {...props}
                key={option.musteri_id}
              >

                <div>

                  <Typography
                    fontWeight={600}
                    fontSize="14px"
                  >
                    {option.musteri_adi ||
                      option.cari_adi}
                  </Typography>


                  {option.cari_adi &&
                    option.musteri_adi &&
                    option.cari_adi !==
                      option.musteri_adi && (

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {option.cari_adi}
                    </Typography>

                  )}

                </div>

              </li>

            )}

            renderInput={(params) => (

              <TextField
                {...params}

                label="Müşteri"

                placeholder="Müşteri adını yazın..."

                required

                fullWidth
              />

            )}
          />


          {/* =================================================
              ŞUBE
          ================================================= */}

          <TextField
            select
            label="Şube"
            name="sube_id"
            value={form.sube_id}
            onChange={handleChange}
            disabled={!form.musteri_id}
            required
            fullWidth
          >

            {filtreliSubeler.map(
              (sube) => (

                <MenuItem
                  key={sube.sube_id}
                  value={sube.sube_id}
                >
                  {sube.sube_adi}
                </MenuItem>

              )
            )}

          </TextField>
        
                 {/* =================================================
              RESMİ ÜNVAN
          ================================================= */}

          <TextField
  label="Resmi Ünvan"
  name="resmi_unvan"
  value={form.resmi_unvan}
  onChange={handleChange}
  fullWidth
/>


          {/* =================================================
              MARKA
          ================================================= */}

          <TextField
            label="Marka"
            name="marka"
            value={form.marka}
            onChange={handleChange}
            placeholder="Örn: INGENICO, PAVO, BEKO"
            required
            fullWidth
          />


          {/* =================================================
              SİCİL NO
          ================================================= */}

          <TextField
            label="Sicil No"
            name="sicil_no"
            value={form.sicil_no}
            onChange={handleChange}
            required
            fullWidth
          />


          {/* =================================================
              TARİHLER
          ================================================= */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 2,
            }}
          >

            <TextField
              label="Başlangıç Tarihi"
              name="baslangic_tarihi"
              type="date"
              value={
                form.baslangic_tarihi
              }
              onChange={
                handleChange
              }
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />


            <TextField
              label="Bitiş Tarihi"
              name="bitis_tarihi"
              type="date"
              value={
                form.bitis_tarihi
              }
              onChange={
                handleChange
              }
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

          </Box>


          {/* =================================================
              TELEFON
          ================================================= */}

          <TextField
            label="Kayıtlı Telefon No"
            name="kayitli_tel_no"
            value={
              form.kayitli_tel_no
            }
            onChange={
              handleChange
            }
            fullWidth
          />

          {/* =================================================
              NOTLAR
          ================================================= */}

          <TextField
            label="Notlar"
            name="notlar"
            value={form.notlar}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
            placeholder="Yazar kasa ile ilgili notları buraya yazabilirsiniz..."
          />

        </Box>

      </DialogContent>


      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
        }}
      >

        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
          }}
        >
          İptal
        </Button>


        <Button
          variant="contained"
          onClick={
            handleKaydet
          }
          disabled={
            !form.musteri_id ||
            !form.sube_id ||
            !form.marka.trim() ||
            !form.sicil_no.trim()
          }
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            boxShadow: "none",
            fontWeight: 600,
          }}
        >

          {mode === "edit"
            ? "Güncelle"
            : "Kaydet"}

        </Button>

      </DialogActions>

    </Dialog>

  );

}


export default YazarKasaDialog;