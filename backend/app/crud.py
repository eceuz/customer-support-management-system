from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date
from sqlalchemy import func


def create_musteri(db: Session, musteri: schemas.MusteriCreate):

    yeni_musteri = models.Musteriler(
        cari_adi=musteri.cari_adi,
        musteri_adi=musteri.musteri_adi
    )

    db.add(yeni_musteri)
    db.commit()
    db.refresh(yeni_musteri)

    return yeni_musteri


def get_musteriler(db: Session):

    return db.query(models.Musteriler).all()

def create_sube(db: Session, sube: schemas.SubeCreate):

    yeni_sube = models.Subeler(

        musteri_id=sube.musteri_id,

        sube_adi=sube.sube_adi,

        bakim_anlasmasi_var_mi=sube.bakim_anlasmasi_var_mi

    )

    db.add(yeni_sube)
    db.commit()
    db.refresh(yeni_sube)

    return yeni_sube


def get_subeler(db: Session, musteri_id: int | None = None):

    query = db.query(models.Subeler)

    if musteri_id is not None:
        query = query.filter(
            models.Subeler.musteri_id == musteri_id
        )

    return query.all()

def create_ariza_tipi(db: Session, ariza: schemas.ArizaTipiCreate):

    yeni = models.ArizaTipleri(

        ariza_tipi_adi=ariza.ariza_tipi_adi

    )

    db.add(yeni)
    db.commit()
    db.refresh(yeni)

    return yeni


def get_ariza_tipleri(db: Session):

    return db.query(models.ArizaTipleri).all()

def create_kullanici(db: Session, kullanici: schemas.KullaniciCreate):

    yeni = models.Kullanicilar(

        kullanici_adi=kullanici.kullanici_adi,

        sifre=kullanici.sifre

    )

    db.add(yeni)
    db.commit()
    db.refresh(yeni)

    return yeni


def get_kullanicilar(db: Session):

    return db.query(models.Kullanicilar).all()

def create_cagri(db: Session, cagri: schemas.CagriCreate):

    yeni = models.CagriKayitlari(

        sube_id=cagri.sube_id,

        kullanici_id=cagri.kullanici_id,

        ariza_tipi_id=cagri.ariza_tipi_id,

        telefon=cagri.telefon,

        gorusulen_kisi=cagri.gorusulen_kisi,

        yapilanlar=cagri.yapilanlar,

        sonuc=cagri.sonuc

    )

    db.add(yeni)
    db.commit()
    db.refresh(yeni)

    return yeni


def get_cagri_kayitlari(db: Session):

    return db.query(models.CagriKayitlari).all()

def login(db: Session, kullanici_adi: str, sifre: str):

    return db.query(models.Kullanicilar).filter(

        models.Kullanicilar.kullanici_adi == kullanici_adi,

        models.Kullanicilar.sifre == sifre

    ).first()

from sqlalchemy.orm import joinedload

def get_cagri_listesi(db: Session):

    sonuc = (

        db.query(

            models.CagriKayitlari.cagri_kaydi_id,

            models.CagriKayitlari.tarih,

            models.CagriKayitlari.telefon,

            models.CagriKayitlari.gorusulen_kisi,

            models.CagriKayitlari.yapilanlar,

            models.CagriKayitlari.sonuc,

            models.Musteriler.musteri_adi.label("musteri_adi"),

            models.Subeler.sube_adi.label("sube_adi"),

            models.ArizaTipleri.ariza_tipi_adi.label("ariza_tipi_adi"),

            models.Kullanicilar.kullanici_adi.label("kullanici_adi")

        )

        .join(
            models.Subeler,
            models.CagriKayitlari.sube_id == models.Subeler.sube_id
        )

        .join(
            models.Musteriler,
            models.Subeler.musteri_id == models.Musteriler.musteri_id
        )

        .join(
            models.ArizaTipleri,
            models.CagriKayitlari.ariza_tipi_id == models.ArizaTipleri.ariza_tipi_id
        )

        .join(
            models.Kullanicilar,
            models.CagriKayitlari.kullanici_id == models.Kullanicilar.kullanici_id
        )

        .order_by(models.CagriKayitlari.tarih.desc())

        .all()

    )

    return sonuc

def get_dashboard(db: Session):

    bugun = date.today()

    bugun_acilan = (
        db.query(models.CagriKayitlari)
        .filter(
            func.date(models.CagriKayitlari.tarih) == bugun
        )
        .count()
    )

    bekleyen = (
        db.query(models.CagriKayitlari)
        .filter(
            models.CagriKayitlari.sonuc == "Beklemede"
        )
        .count()
    )

    servise_aktarilan = (
        db.query(models.CagriKayitlari)
        .filter(
            models.CagriKayitlari.sonuc == "Servise Aktarıldı"
        )
        .count()
    )

    toplam_musteri = (
        db.query(models.Musteriler)
        .count()
    )

    return {
        "bugun_acilan": bugun_acilan,
        "bekleyen": bekleyen,
        "servise_aktarilan": servise_aktarilan,
        "toplam_musteri": toplam_musteri
    }
