from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date, timedelta, datetime
from sqlalchemy import func
from zoneinfo import ZoneInfo


def create_musteri(db: Session, musteri: schemas.MusteriCreate):

    yeni_musteri = models.Musteriler(
        cari_kodu=musteri.cari_kodu,
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
        sube_kodu=sube.sube_kodu,
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
        sifre=kullanici.sifre,
        rol=kullanici.rol
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

            models.ArizaTipleri.ariza_tipi_adi.label("ariza_tipi_adi"),

            models.Kullanicilar.kullanici_adi.label("kullanici_adi"),

            models.Subeler.bakim_anlasmasi_var_mi.label("bakim_anlasmasi_var_mi")

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

def update_musteri(
    db: Session,
    musteri_id: int,
    musteri: schemas.MusteriUpdate
):

    db_musteri = db.query(models.Musteriler).filter(
        models.Musteriler.musteri_id == musteri_id
    ).first()

    if not db_musteri:
        return None

    db_musteri.cari_adi = musteri.cari_adi
    db_musteri.musteri_adi = musteri.musteri_adi
    db_musteri.cari_kodu = musteri.cari_kodu


    db.commit()
    db.refresh(db_musteri)

    return db_musteri

def delete_musteri(
    db: Session,
    musteri_id: int
):

    db_musteri = db.query(models.Musteriler).filter(
        models.Musteriler.musteri_id == musteri_id
    ).first()

    if not db_musteri:
        return None

    db.delete(db_musteri)

    db.commit()

    return db_musteri

def update_sube(
    db: Session,
    sube_id: int,
    sube: schemas.SubeCreate
):

    mevcut_sube = (
        db.query(models.Subeler)
        .filter(models.Subeler.sube_id == sube_id)
        .first()
    )

    if not mevcut_sube:
        return None

    mevcut_sube.musteri_id = sube.musteri_id
    mevcut_sube.sube_adi = sube.sube_adi
    mevcut_sube.sube_kodu = sube.sube_kodu  
    mevcut_sube.bakim_anlasmasi_var_mi = sube.bakim_anlasmasi_var_mi

    db.commit()
    db.refresh(mevcut_sube)

    return mevcut_sube


def delete_sube(
    db: Session,
    sube_id: int
):

    sube = (
        db.query(models.Subeler)
        .filter(models.Subeler.sube_id == sube_id)
        .first()
    )

    if not sube:
        return None

    db.delete(sube)
    db.commit()

    return {"message": "Şube silindi"}

def update_kullanici(
    db: Session,
    kullanici_id: int,
    kullanici: schemas.KullaniciUpdate
):

    mevcut_kullanici = (
        db.query(models.Kullanicilar)
        .filter(models.Kullanicilar.kullanici_id == kullanici_id)
        .first()
    )

    if not mevcut_kullanici:
        return None

    mevcut_kullanici.kullanici_adi = kullanici.kullanici_adi
    if kullanici.sifre:
        mevcut_kullanici.sifre = kullanici.sifre
    mevcut_kullanici.rol = kullanici.rol

    db.commit()
    db.refresh(mevcut_kullanici)

    return mevcut_kullanici

def delete_kullanici(
    db: Session,
    kullanici_id: int
):

    kullanici = (
        db.query(models.Kullanicilar)
        .filter(models.Kullanicilar.kullanici_id == kullanici_id)
        .first()
    )

    if not kullanici:
        return None

    db.delete(kullanici)
    db.commit()

    return {"message": "Kullanıcı silindi"}

def update_ariza_tipi(
    db: Session,
    ariza_tipi_id: int,
    ariza_tipi: schemas.ArizaTipiCreate
):

    mevcut_ariza_tipi = (
        db.query(models.ArizaTipleri)
        .filter(models.ArizaTipleri.ariza_tipi_id == ariza_tipi_id)
        .first()
    )

    if not mevcut_ariza_tipi:
        return None

    mevcut_ariza_tipi.ariza_tipi_adi = ariza_tipi.ariza_tipi_adi

    db.commit()
    db.refresh(mevcut_ariza_tipi)

    return mevcut_ariza_tipi

def delete_ariza_tipi(
    db: Session,
    ariza_tipi_id: int
):

    ariza_tipi = (
        db.query(models.ArizaTipleri)
        .filter(models.ArizaTipleri.ariza_tipi_id == ariza_tipi_id)
        .first()
    )

    if not ariza_tipi:
        return None

    db.delete(ariza_tipi)
    db.commit()

    return {"message": "Arıza tipi silindi"}   

def update_cagri(
    db: Session,
    cagri_id: int,
    cagri: schemas.CagriCreate
):
    db_cagri = (
        db.query(models.CagriKayitlari)
        .filter(models.CagriKayitlari.cagri_kaydi_id == cagri_id)
        .first()
    )

    if not db_cagri:
        return None

    db_cagri.sube_id = cagri.sube_id
    db_cagri.ariza_tipi_id = cagri.ariza_tipi_id
    db_cagri.telefon = cagri.telefon
    db_cagri.gorusulen_kisi = cagri.gorusulen_kisi
    db_cagri.yapilanlar = cagri.yapilanlar
    db_cagri.sonuc = cagri.sonuc
    db_cagri.tarih = cagri.tarih

    db.commit()
    db.refresh(db_cagri)

    return db_cagri

def delete_cagri(
    db: Session,
    cagri_id: int
):

    db_cagri = (
        db.query(models.CagriKayitlari)
        .filter(models.CagriKayitlari.cagri_kaydi_id == cagri_id)
        .first()
    )

    if not db_cagri:
        return False

    db.delete(db_cagri)
    db.commit()

    return True 

def get_son_24_saat_cagrilari(db: Session):

    yirmi_dort_saat_once = datetime.now() - timedelta(hours=24)

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

            models.Kullanicilar.kullanici_adi.label("kullanici_adi"),

            models.Subeler.bakim_anlasmasi_var_mi.label(
                "bakim_anlasmasi_var_mi"
            )
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
            models.CagriKayitlari.ariza_tipi_id
            == models.ArizaTipleri.ariza_tipi_id
        )

        .join(
            models.Kullanicilar,
            models.CagriKayitlari.kullanici_id
            == models.Kullanicilar.kullanici_id
        )

        .filter(
            models.CagriKayitlari.tarih >= yirmi_dort_saat_once
        )

        .order_by(
            models.CagriKayitlari.tarih.desc()
        )

        .all()
    )

    return sonuc