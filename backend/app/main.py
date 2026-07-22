from fastapi import FastAPI

from .database import Base, engine
from . import models

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI()
@app.post("/musteriler", response_model=schemas.MusteriResponse)
def musteri_olustur(
    musteri: schemas.MusteriCreate,
    db: Session = Depends(get_db)
):
    yeni_musteri = models.Musteriler(
        cari_adi=musteri.cari_adi,
        musteri_adi=musteri.musteri_adi
    )

    db.add(yeni_musteri)
    db.commit()
    db.refresh(yeni_musteri)

    return yeni_musteri

@app.get("/musteriler", response_model=list[schemas.MusteriResponse])
def musterileri_listele(db: Session = Depends(get_db)):
    return db.query(models.Musteriler).all()


@app.post("/subeler", response_model=schemas.SubeResponse)
def sube_olustur(
    sube: schemas.SubeCreate,
    db: Session = Depends(get_db)
):
    yeni_sube = models.Subeler(
        musteri_id=sube.musteri_id,
        sube_adi=sube.sube_adi,
        bakim_anlasmasi_var_mi=sube.bakim_anlasmasi_var_mi
    )

    db.add(yeni_sube)
    db.commit()
    db.refresh(yeni_sube)

    return yeni_sube

@app.get("/subeler", response_model=list[schemas.SubeResponse])
def subeleri_listele(db: Session = Depends(get_db)):
    return db.query(models.Subeler).all()

@app.post("/ariza-tipleri", response_model=schemas.ArizaTipiResponse)
def ariza_tipi_olustur(
    ariza_tipi: schemas.ArizaTipiCreate,
    db: Session = Depends(get_db)
):
    yeni_ariza_tipi = models.ArizaTipleri(
        ariza_tipi_adi=ariza_tipi.ariza_tipi_adi
    )

    db.add(yeni_ariza_tipi)
    db.commit()
    db.refresh(yeni_ariza_tipi)

    return yeni_ariza_tipi

@app.get("/ariza-tipleri", response_model=list[schemas.ArizaTipiResponse])
def ariza_tiplerini_getir(db: Session = Depends(get_db)):
    return db.query(models.ArizaTipleri).all()

@app.post("/kullanicilar", response_model=schemas.KullaniciResponse)
def kullanici_olustur(
    kullanici: schemas.KullaniciCreate,
    db: Session = Depends(get_db)
):
    yeni_kullanici = models.Kullanicilar(
        kullanici_adi=kullanici.kullanici_adi,
        sifre=kullanici.sifre
    )

    db.add(yeni_kullanici)
    db.commit()
    db.refresh(yeni_kullanici)

    return yeni_kullanici

@app.get("/kullanicilar", response_model=list[schemas.KullaniciResponse])
def kullanicilari_getir(db: Session = Depends(get_db)):
    return db.query(models.Kullanicilar).all()

@app.post("/cagri-kayitlari", response_model=schemas.CagriResponse)
def cagri_kaydi_olustur(
    cagri: schemas.CagriCreate,
    db: Session = Depends(get_db)
):
    yeni_cagri = models.CagriKayitlari(
        sube_id=cagri.sube_id,
        kullanici_id=cagri.kullanici_id,
        ariza_tipi_id=cagri.ariza_tipi_id,
        telefon=cagri.telefon,
        gorusulen_kisi=cagri.gorusulen_kisi,
        yapilanlar=cagri.yapilanlar,
        sonuc=cagri.sonuc
    )

    db.add(yeni_cagri)
    db.commit()
    db.refresh(yeni_cagri)

    return yeni_cagri

@app.get("/cagri-kayitlari", response_model=list[schemas.CagriResponse])
def cagri_kayitlari_getir(db: Session = Depends(get_db)):
    return db.query(models.CagriKayitlari).all()