from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from fastapi import Query
from .database import Base, engine, get_db
from . import schemas, crud
from .security import create_access_token
from fastapi import HTTPException

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/musteriler", response_model=schemas.MusteriResponse)
def musteri_olustur(
    musteri: schemas.MusteriCreate,
    db: Session = Depends(get_db)
):
    return crud.create_musteri(db, musteri)


@app.get("/musteriler", response_model=list[schemas.MusteriResponse])
def musterileri_listele(db: Session = Depends(get_db)):
    return crud.get_musteriler(db)


@app.post("/subeler", response_model=schemas.SubeResponse)
def sube_olustur(
    sube: schemas.SubeCreate,
    db: Session = Depends(get_db)
):
    return crud.create_sube(db, sube)


@app.get("/subeler", response_model=list[schemas.SubeResponse])
def subeleri_listele(
    musteri_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_subeler(db, musteri_id)



@app.post("/ariza-tipleri", response_model=schemas.ArizaTipiResponse)
def ariza_tipi_olustur(
    ariza_tipi: schemas.ArizaTipiCreate,
    db: Session = Depends(get_db)
):
    return crud.create_ariza_tipi(db, ariza_tipi)


@app.get("/ariza-tipleri", response_model=list[schemas.ArizaTipiResponse])
def ariza_tiplerini_getir(db: Session = Depends(get_db)):
    return crud.get_ariza_tipleri(db)



@app.post("/kullanicilar", response_model=schemas.KullaniciResponse)
def kullanici_olustur(
    kullanici: schemas.KullaniciCreate,
    db: Session = Depends(get_db)
):
    return crud.create_kullanici(db, kullanici)


@app.get("/kullanicilar", response_model=list[schemas.KullaniciResponse])
def kullanicilari_getir(db: Session = Depends(get_db)):
    return crud.get_kullanicilar(db)


@app.post("/cagri-kayitlari", response_model=schemas.CagriResponse)
def cagri_kaydi_olustur(
    cagri: schemas.CagriCreate,
    db: Session = Depends(get_db)
):
    return crud.create_cagri(db, cagri)


@app.get("/cagri-kayitlari", response_model=list[schemas.CagriResponse])
def cagri_kayitlari_getir(db: Session = Depends(get_db)):
    return crud.get_cagri_kayitlari(db)

@app.post("/login", response_model=schemas.TokenResponse)
def login(
    request: schemas.LoginRequest,
    db: Session = Depends(get_db)
):

    kullanici = crud.login(
        db,
        request.kullanici_adi,
        request.sifre
    )

    if not kullanici:
        raise HTTPException(
            status_code=401,
            detail="Kullanıcı adı veya şifre hatalı."
        )

    token = create_access_token({

        "sub": str(kullanici.kullanici_id),

        "username": kullanici.kullanici_adi

    })

    return {

        "access_token": token,

        "token_type": "bearer"

    }

@app.get(
    "/cagri-listesi",
    response_model=list[schemas.CagriListeResponse]
)
def cagri_listesi(
    db: Session = Depends(get_db)
):

    return crud.get_cagri_listesi(db)

@app.get(
    "/dashboard",
    response_model=schemas.DashboardResponse
)
def dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard(db)