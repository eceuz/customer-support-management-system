from pydantic import BaseModel


class MusteriCreate(BaseModel):
    cari_adi: str
    musteri_adi: str | None = None


class MusteriResponse(BaseModel):
    musteri_id: int
    cari_adi: str
    musteri_adi: str | None = None

    class Config:
        from_attributes = True

class SubeCreate(BaseModel):
    musteri_id: int
    sube_adi: str
    bakim_anlasmasi_var_mi: bool = False


class SubeResponse(BaseModel):
    sube_id: int
    musteri_id: int
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


class KullaniciResponse(BaseModel):
    kullanici_id: int
    kullanici_adi: str

    class Config:
        from_attributes = True

from datetime import datetime

class CagriCreate(BaseModel):
    sube_id: int
    kullanici_id: int
    ariza_tipi_id: int
    telefon: str | None = None
    gorusulen_kisi: str | None = None
    yapilanlar: str | None = None
    sonuc: str | None = None


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

    class Config:
        from_attributes = True