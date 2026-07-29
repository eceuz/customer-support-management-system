from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Musteriler(Base):
    __tablename__ = "MUSTERILER"

    musteri_id = Column(Integer, primary_key=True, index=True)
    cari_adi = Column(String(150), nullable=False)
    musteri_adi = Column(String(150), nullable=True)
    cari_kodu = Column(Integer, unique=True, nullable=False)

    # Relationship
    subeler = relationship("Subeler", back_populates="musteri")


class Subeler(Base):
    __tablename__ = "SUBELER"

    sube_id = Column(Integer, primary_key=True, index=True)
    musteri_id = Column(Integer, ForeignKey("MUSTERILER.musteri_id"), nullable=False)
    sube_adi = Column(String(100), nullable=False)
    sube_kodu = Column(Integer, nullable=True)
    bakim_anlasmasi_var_mi = Column(Boolean, default=False)

    # Relationships
    musteri = relationship("Musteriler", back_populates="subeler")
    cagri_kayitlari = relationship("CagriKayitlari", back_populates="sube")


class Kullanicilar(Base):
    __tablename__ = "KULLANICILAR"

    kullanici_id = Column(Integer, primary_key=True, index=True)
    kullanici_adi = Column(String(100), nullable=False)
    sifre = Column(String(255), nullable=False)

    # Relationship
    cagri_kayitlari = relationship("CagriKayitlari", back_populates="kullanici")


class ArizaTipleri(Base):
    __tablename__ = "ARIZA_TIPLERI"

    ariza_tipi_id = Column(Integer, primary_key=True, index=True)
    ariza_tipi_adi = Column(String(100), nullable=False)

    # Relationship
    cagri_kayitlari = relationship("CagriKayitlari", back_populates="ariza_tipi")


class CagriKayitlari(Base):
    __tablename__ = "CAGRI_KAYITLARI"

    cagri_kaydi_id = Column(Integer, primary_key=True, index=True)
    sube_id = Column(Integer, ForeignKey("SUBELER.sube_id"), nullable=False)
    kullanici_id = Column(Integer, ForeignKey("KULLANICILAR.kullanici_id"), nullable=False)
    ariza_tipi_id = Column(Integer, ForeignKey("ARIZA_TIPLERI.ariza_tipi_id"), nullable=False)
    telefon = Column(String(20), nullable=True)
    gorusulen_kisi = Column(String(100), nullable=True)
    yapilanlar = Column(Text, nullable=True)
    sonuc = Column(String(50), nullable=True)
    tarih = Column(DateTime, default=datetime.utcnow)
    cozum_saati = Column(DateTime, nullable=True)

    # Relationships
    sube = relationship("Subeler", back_populates="cagri_kayitlari")
    kullanici = relationship("Kullanicilar", back_populates="cagri_kayitlari")
    ariza_tipi = relationship("ArizaTipleri", back_populates="cagri_kayitlari")