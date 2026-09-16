from typing import Optional, Literal
from decimal import Decimal
from datetime import date, datetime

from pydantic import BaseModel


RolTipi = Literal["ADMİN", "YÖNETİCİ", "DESTEK", "İZLEYİCİ"]


class MusteriCreate(BaseModel):
    cari_kodu: int
    cari_adi: Optional[str] = None
    musteri_adi: str | None = None


class MusteriUpdate(BaseModel):
    cari_kodu: Optional[int] = None
    cari_adi: Optional[str] = None
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
    rol: RolTipi = "DESTEK"


class KullaniciUpdate(BaseModel):
    kullanici_adi: str
    sifre: str | None = None
    rol: RolTipi


class KullaniciResponse(BaseModel):
    kullanici_id: int
    kullanici_adi: str
    rol: str


class CagriCreate(BaseModel):
    sube_id: int
    kullanici_id: int
    ariza_tipi_id: int
    telefon: str | None = None
    gorusulen_kisi: str | None = None
    yapilanlar: str | None = None
    sonuc: str | None = None
    tarih: datetime | None = None


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
    notlar: Optional[str] = None


class YazarkasaUpdate(BaseModel):
    sube_id: Optional[int] = None
    marka: Optional[str] = None
    sicil_no: Optional[str] = None
    lisans_tipi: Optional[str] = None
    baslangic_tarihi: Optional[date] = None
    bitis_tarihi: Optional[date] = None
    kayitli_tel_no: Optional[str] = None
    resmi_unvan: Optional[str] = None
    notlar: Optional[str] = None


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
    notlar: Optional[str] = None

    class Config:
        from_attributes = True


class ArizaKaydiCreate(BaseModel):
    sube_id: int
    sorun: str


class ArizaAtama(BaseModel):
    atanan_kullanici_id: int


class ArizaKaydiResponse(BaseModel):
    ariza_kaydi_id: int
    sube_id: int
    olusturan_kullanici_id: int
    atanan_kullanici_id: Optional[int] = None
    sorun: str
    durum: str
    olusturma_tarihi: datetime
    atanma_tarihi: Optional[datetime] = None
    ise_baslama_tarihi: Optional[datetime] = None
    tamamlanma_tarihi: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArizaListeResponse(BaseModel):
    ariza_kaydi_id: int
    musteri_adi: str
    sube_adi: str
    sorun: str
    durum: str
    olusturan_kullanici_adi: str
    atanan_kullanici_id: Optional[int] = None
    atanan_kullanici_adi: Optional[str] = None
    olusturma_tarihi: datetime
    atanma_tarihi: Optional[datetime] = None
    ise_baslama_tarihi: Optional[datetime] = None
    tamamlanma_tarihi: Optional[datetime] = None


class ArizaIslemCreate(BaseModel):
    yapilan_islem: str
    ucret: Optional[Decimal] = None
    konsinye_urun_bilgisi: Optional[str] = None


class ArizaIslemResponse(BaseModel):
    islem_id: int
    ariza_kaydi_id: int
    kullanici_id: int
    yapilan_islem: str
    ucret: Optional[Decimal] = None
    konsinye_urun_bilgisi: Optional[str] = None
    islem_tarihi: datetime

    class Config:
        from_attributes = True
