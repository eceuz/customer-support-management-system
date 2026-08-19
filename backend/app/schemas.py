from typing import Optional

from pydantic import BaseModel


class MusteriCreate(BaseModel):
    cari_kodu: int
    cari_adi:Optional[str] = None
    musteri_adi: str | None = None

class MusteriUpdate(BaseModel):
    cari_kodu:Optional[int] = None
    cari_adi:Optional[str] = None
    musteri_adi: str | None = None


class MusteriResponse(BaseModel):
    musteri_id: int
    cari_kodu: Optional[int] = None
    cari_adi: Optional[str] = None
    musteri_adi: str | None = None

    class Config:
        from_attributes = True

class SubeCreate(BaseModel):
    musteri_id: int
    sube_adi: str
    sube_kodu: Optional[int] = None
    bakim_anlasmasi_var_mi: bool = False


class SubeResponse(BaseModel):
    sube_id: int
    musteri_id: int
    sube_kodu: Optional[int] = None
    sube_adi: str
    bakim_anlasmasi_var_mi: bool

    class Config:
        from_attributes = True

class ArizaTipiCreate(BaseModel):
    ariza_tipi_adi: str


class ArizaTipiResponse(BaseModel):
    ariza_tipi_id: int
    ariza_tipi_adi: str

    class Config:
        from_attributes = True

class KullaniciCreate(BaseModel):
    kullanici_adi: str
    sifre: str
    rol: str = "DESTEK"

class KullaniciUpdate(BaseModel):
    kullanici_adi: str
    sifre: str | None = None
    rol: str

class KullaniciResponse(BaseModel):
    kullanici_id: int
    kullanici_adi: str
    rol: str


from datetime import date, datetime

class CagriCreate(BaseModel):
    sube_id: int
    kullanici_id: int
    ariza_tipi_id: int
    telefon: str | None = None
    gorusulen_kisi: str | None = None
    yapilanlar: str | None = None
    sonuc: str | None = None
    tarih : datetime | None = None


class CagriResponse(BaseModel):
    cagri_kaydi_id: int
    sube_id: int
    kullanici_id: int
    ariza_tipi_id: int
    telefon: str | None
    gorusulen_kisi: str | None
    yapilanlar: str | None
    sonuc: str | None
    tarih: datetime
    bakim_anlasmasi_var_mi: bool


    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    kullanici_adi: str
    sifre: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

from datetime import datetime

class CagriListeResponse(BaseModel):

    cagri_kaydi_id: int

    tarih: datetime

    telefon: str | None

    gorusulen_kisi: str | None

    yapilanlar: str | None

    sonuc: str | None

    musteri_adi: str

    sube_adi: str

    ariza_tipi_adi: str

    kullanici_adi: str

    bakim_anlasmasi_var_mi: bool 

class DashboardResponse(BaseModel):
    bugun_acilan: int
    bekleyen: int
    servise_aktarilan: int
    toplam_musteri: int

from datetime import datetime

class RaporResponse(BaseModel):
    cagri_kayit_id: int
    tarih: datetime
    cari_adi: str
    sube_adi: str
    ariza_tipi_adi: str
    kullanici_adi: str

    class Config:
        from_attributes = True

class YazarkasaCreate(BaseModel):
    sube_id: int
    marka: str
    sicil_no: str
    lisans_tipi: Optional[str] = None
    baslangic_tarihi: Optional[date] = None
    bitis_tarihi: Optional[date] = None
    kayitli_tel_no: Optional[str] = None
    resmi_unvan: Optional[str] = None


class YazarkasaUpdate(BaseModel):
    sube_id: Optional[int] = None
    marka: Optional[str] = None
    sicil_no: Optional[str] = None
    lisans_tipi: Optional[str] = None
    baslangic_tarihi: Optional[date] = None
    bitis_tarihi: Optional[date] = None
    kayitli_tel_no: Optional[str] = None
    resmi_unvan: Optional[str] = None


class YazarkasaResponse(BaseModel):
    yazarkasa_id: int
    sube_id: int
    marka: str
    sicil_no: str
    lisans_tipi: Optional[str] = None
    baslangic_tarihi: Optional[date] = None
    bitis_tarihi: Optional[date] = None
    kayitli_tel_no: Optional[str] = None
    resmi_unvan: Optional[str] = None

    class Config:
        from_attributes = True