from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Date,
    Text,
    Numeric
)
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from .database import Base


# =========================================================
# MÜŞTERİLER
# =========================================================

class Musteriler(Base):
    __tablename__ = "MUSTERILER"

    musteri_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    cari_adi = Column(
        String(150),
        nullable=False
    )

    musteri_adi = Column(
        String(150),
        nullable=True
    )

    cari_kodu = Column(
        Integer,
        unique=True,
        nullable=False
    )

    # Relationships
    subeler = relationship(
        "Subeler",
        back_populates="musteri"
    )


# =========================================================
# ŞUBELER
# =========================================================

class Subeler(Base):
    __tablename__ = "SUBELER"

    sube_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    musteri_id = Column(
        Integer,
        ForeignKey("MUSTERILER.musteri_id"),
        nullable=False
    )

    sube_adi = Column(
        String(100),
        nullable=False
    )

    sube_kodu = Column(
        Integer,
        nullable=True
    )

    bakim_anlasmasi_var_mi = Column(
        Boolean,
        default=False
    )

    # Relationships
    musteri = relationship(
        "Musteriler",
        back_populates="subeler"
    )

    cagri_kayitlari = relationship(
        "CagriKayitlari",
        back_populates="sube"
    )

    yazarkasalar = relationship(
        "Yazarkasalar",
        back_populates="sube"
    )

    # Yerinde destek
    ariza_kayitlari = relationship(
        "ArizaKayitlari",
        back_populates="sube"
    )


# =========================================================
# KULLANICILAR
# =========================================================

class Kullanicilar(Base):
    __tablename__ = "KULLANICILAR"

    kullanici_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    kullanici_adi = Column(
        String(100),
        nullable=False
    )

    sifre = Column(
        String(255),
        nullable=False
    )

    rol = Column(
        String(20),
        nullable=False
    )

    # Çağrı kayıtları
    cagri_kayitlari = relationship(
        "CagriKayitlari",
        back_populates="kullanici"
    )

    # Kullanıcının oluşturduğu yerinde destek arızaları
    olusturulan_arizalar = relationship(
        "ArizaKayitlari",
        foreign_keys="ArizaKayitlari.olusturan_kullanici_id",
        back_populates="olusturan_kullanici"
    )

    # Kullanıcının üzerine atanmış işler
    atanan_arizalar = relationship(
        "ArizaKayitlari",
        foreign_keys="ArizaKayitlari.atanan_kullanici_id",
        back_populates="atanan_kullanici"
    )

    # Kullanıcının arızalara eklediği işlemler
    ariza_islemleri = relationship(
        "ArizaIslemleri",
        back_populates="kullanici"
    )


# =========================================================
# ÇAĞRI KAYITLARI İÇİN ARIZA TİPLERİ
# =========================================================

class ArizaTipleri(Base):
    __tablename__ = "ARIZA_TIPLERI"

    ariza_tipi_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ariza_tipi_adi = Column(
        String(100),
        nullable=False
    )

    cagri_kayitlari = relationship(
        "CagriKayitlari",
        back_populates="ariza_tipi"
    )


# =========================================================
# ÇAĞRI KAYITLARI
# =========================================================

class CagriKayitlari(Base):
    __tablename__ = "CAGRI_KAYITLARI"

    cagri_kaydi_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    sube_id = Column(
        Integer,
        ForeignKey("SUBELER.sube_id"),
        nullable=False
    )

    kullanici_id = Column(
        Integer,
        ForeignKey("KULLANICILAR.kullanici_id"),
        nullable=False
    )

    ariza_tipi_id = Column(
        Integer,
        ForeignKey("ARIZA_TIPLERI.ariza_tipi_id"),
        nullable=False
    )

    telefon = Column(
        String(20),
        nullable=True
    )

    gorusulen_kisi = Column(
        String(100),
        nullable=True
    )

    yapilanlar = Column(
        Text,
        nullable=True
    )

    sonuc = Column(
        String(50),
        nullable=True
    )

    tarih = Column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(hours=3)
    )

    cozum_saati = Column(
        DateTime,
        nullable=True
    )

    # Relationships
    sube = relationship(
        "Subeler",
        back_populates="cagri_kayitlari"
    )

    kullanici = relationship(
        "Kullanicilar",
        back_populates="cagri_kayitlari"
    )

    ariza_tipi = relationship(
        "ArizaTipleri",
        back_populates="cagri_kayitlari"
    )


# =========================================================
# YAZARKASALAR
# =========================================================

class Yazarkasalar(Base):
    __tablename__ = "YAZARKASALAR"

    yazarkasa_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    sube_id = Column(
        Integer,
        ForeignKey("SUBELER.sube_id"),
        nullable=False,
        index=True
    )

    marka = Column(
        String(50),
        nullable=False
    )

    sicil_no = Column(
        String(100),
        nullable=False,
        index=True
    )

    lisans_tipi = Column(
        String(50),
        nullable=True
    )

    baslangic_tarihi = Column(
        Date,
        nullable=True
    )

    bitis_tarihi = Column(
        Date,
        nullable=True,
        index=True
    )

    kayitli_tel_no = Column(
        String(30),
        nullable=True
    )

    resmi_unvan = Column(
        String(100),
        nullable=True
    )

    notlar = Column(
        Text,
        nullable=True
    )

    # Relationship
    sube = relationship(
        "Subeler",
        back_populates="yazarkasalar"
    )


# =========================================================
# YERİNDE DESTEK - ARIZA KAYITLARI
# =========================================================

class ArizaKayitlari(Base):
    __tablename__ = "ARIZA_KAYITLARI"

    ariza_kaydi_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    sube_id = Column(
        Integer,
        ForeignKey("SUBELER.sube_id"),
        nullable=False
    )

    # Arızayı sisteme kim açtı?
    olusturan_kullanici_id = Column(
        Integer,
        ForeignKey("KULLANICILAR.kullanici_id"),
        nullable=False
    )

    # Yönetici işi kime atadı?
    # Arıza ilk açıldığında henüz kimseye atanmayabileceği için nullable=True
    atanan_kullanici_id = Column(
        Integer,
        ForeignKey("KULLANICILAR.kullanici_id"),
        nullable=True
    )

    sorun = Column(
        Text,
        nullable=False
    )

    durum = Column(
        String(30),
        nullable=False,
        default="atama_bekliyor"
    )

    olusturma_tarihi = Column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(hours=3)
    )

    atanma_tarihi = Column(
        DateTime,
        nullable=True
    )

    ise_baslama_tarihi = Column(
        DateTime,
        nullable=True
    )

    tamamlanma_tarihi = Column(
        DateTime,
        nullable=True
    )

    # Relationships

    sube = relationship(
        "Subeler",
        back_populates="ariza_kayitlari"
    )

    olusturan_kullanici = relationship(
        "Kullanicilar",
        foreign_keys=[olusturan_kullanici_id],
        back_populates="olusturulan_arizalar"
    )

    atanan_kullanici = relationship(
        "Kullanicilar",
        foreign_keys=[atanan_kullanici_id],
        back_populates="atanan_arizalar"
    )

    islemler = relationship(
        "ArizaIslemleri",
        back_populates="ariza"
    )


# =========================================================
# YERİNDE DESTEK - ARIZAYA YAPILAN İŞLEMLER
# =========================================================

class ArizaIslemleri(Base):
    __tablename__ = "ARIZA_ISLEMLERI"

    islem_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ariza_kaydi_id = Column(
        Integer,
        ForeignKey("ARIZA_KAYITLARI.ariza_kaydi_id"),
        nullable=False
    )

    # Bu işlemi hangi personel yaptı?
    kullanici_id = Column(
        Integer,
        ForeignKey("KULLANICILAR.kullanici_id"),
        nullable=False
    )

    yapilan_islem = Column(
        Text,
        nullable=False
    )

    ucret = Column(
        Numeric(10, 2),
        nullable=True
    )

    konsinye_urun_bilgisi = Column(
        Text,
        nullable=True
    )

    islem_tarihi = Column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(hours=3)
    )

    # Relationships

    ariza = relationship(
        "ArizaKayitlari",
        back_populates="islemler"
    )

    kullanici = relationship(
        "Kullanicilar",
        back_populates="ariza_islemleri"
    )