from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from fastapi import Query
from .database import Base, engine, get_db
from . import schemas, crud, models
from .security import create_access_token
from .security import create_access_token, get_current_user, require_roles
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/musteriler", response_model=schemas.MusteriResponse)
def musteri_olustur(
    musteri: schemas.MusteriCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):
    return crud.create_musteri(db, musteri)


@app.get("/musteriler", response_model=list[schemas.MusteriResponse])
def musterileri_listele(db: Session = Depends(get_db)):
    return crud.get_musteriler(db)


@app.post("/subeler", response_model=schemas.SubeResponse)
def sube_olustur(
    sube: schemas.SubeCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
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
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
            require_roles("ADMİN", "DESTEK")
        )
):
    return crud.create_ariza_tipi(db, ariza_tipi)


@app.get("/ariza-tipleri", response_model=list[schemas.ArizaTipiResponse])
def ariza_tiplerini_getir(db: Session = Depends(get_db)):
    return crud.get_ariza_tipleri(db)



@app.post("/kullanicilar", response_model=schemas.KullaniciResponse)
def kullanici_olustur(
    kullanici: schemas.KullaniciCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN")
    )
):
    return crud.create_kullanici(db, kullanici)


@app.get("/kullanicilar", response_model=list[schemas.KullaniciResponse])
def kullanicilari_getir(
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN")
    )
):
    return crud.get_kullanicilar(db)


@app.post("/cagri-kayitlari")
def cagri_kaydi_olustur(
    cagri: schemas.CagriCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):
    cagri.kullanici_id = current_user.kullanici_id

    crud.create_cagri(db, cagri)

    return {"message": "Kayıt başarıyla oluşturuldu"}


@app.get("/cagri-kayitlari", response_model=list[schemas.CagriResponse])
def cagri_kayitlari_getir(db: Session = Depends(get_db)):
    return crud.get_cagri_listesi(db)

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

        "username": kullanici.kullanici_adi,

        "rol": kullanici.rol

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

@app.put(
    "/musteriler/{musteri_id}",
    response_model=schemas.MusteriResponse
)
def musteri_guncelle(
    musteri_id: int,
    musteri: schemas.MusteriUpdate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):

    sonuc = crud.update_musteri(
        db,
        musteri_id,
        musteri
    )

    if sonuc is None:
        raise HTTPException(
            status_code=404,
            detail="Müşteri bulunamadı."
        )

    return sonuc

@app.delete("/musteriler/{musteri_id}")
def musteri_sil(
    musteri_id: int,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):

    sonuc = crud.delete_musteri(
        db,
        musteri_id
    )

    if sonuc is None:
        raise HTTPException(
            status_code=404,
            detail="Müşteri bulunamadı."
        )

    return {
        "message": "Müşteri silindi."
    }

@app.put("/subeler/{sube_id}", response_model=schemas.SubeResponse)
def sube_guncelle(
    sube_id: int,
    sube: schemas.SubeCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):
    return crud.update_sube(db, sube_id, sube)


@app.delete("/subeler/{sube_id}")
def sube_sil(
    sube_id: int,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):
    return crud.delete_sube(db, sube_id)

@app.put("/kullanicilar/{kullanici_id}", response_model=schemas.KullaniciResponse)
def kullanici_guncelle(
    kullanici_id: int,
    kullanici: schemas.KullaniciUpdate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN")
    )
):

    izinli_roller = ["ADMİN", "DESTEK", "İZLEYİCİ"]

    if kullanici.rol not in izinli_roller:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz rol."
        )

    sonuc = crud.update_kullanici(
        db,
        kullanici_id,
        kullanici
    )

    if sonuc is None:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )

    return sonuc

@app.delete("/kullanicilar/{kullanici_id}")
def kullanici_sil(
    kullanici_id: int,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN")
    )
):
    return crud.delete_kullanici(db, kullanici_id)

@app.put(
    "/ariza-tipleri/{ariza_tipi_id}",
    response_model=schemas.ArizaTipiResponse
)
def ariza_tipi_guncelle(
    ariza_tipi_id: int,
    ariza_tipi: schemas.ArizaTipiCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):
    return crud.update_ariza_tipi(
        db,
        ariza_tipi_id,
        ariza_tipi
    ) 

@app.delete("/ariza-tipleri/{ariza_tipi_id}")
def ariza_tipi_sil(
    ariza_tipi_id: int,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):
    return crud.delete_ariza_tipi(
        db,
        ariza_tipi_id
    )    

@app.put("/cagri-kayitlari/{cagri_id}")
def update_cagri(
    cagri_id: int,
    cagri: schemas.CagriCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):

    db_cagri = (
        db.query(models.CagriKayitlari)
        .filter(
            models.CagriKayitlari.cagri_kaydi_id == cagri_id
        )
        .first()
    )

    if db_cagri is None:
        raise HTTPException(
            status_code=404,
            detail="Çağrı bulunamadı."
        )

    if (
        current_user.rol != "ADMİN"
        and db_cagri.kullanici_id != current_user.kullanici_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Başka bir kullanıcının çağrı kaydını düzenleyemezsiniz."
        )

    sonuc = crud.update_cagri(
        db,
        cagri_id,
        cagri
    )

    return sonuc

@app.delete("/cagri-kayitlari/{cagri_id}")
def delete_cagri(
    cagri_id: int,
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(
        require_roles("ADMİN", "DESTEK")
    )
):

    db_cagri = (
        db.query(models.CagriKayitlari)
        .filter(
            models.CagriKayitlari.cagri_kaydi_id == cagri_id
        )
        .first()
    )

    if db_cagri is None:
        raise HTTPException(
            status_code=404,
            detail="Çağrı bulunamadı."
        )

    if (
        current_user.rol != "ADMİN"
        and db_cagri.kullanici_id != current_user.kullanici_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Başka bir kullanıcının çağrı kaydını silemezsiniz."
        )

    crud.delete_cagri(
        db,
        cagri_id
    )

    return {
        "message": "Çağrı kaydı silindi."
    }

@app.get(
    "/cagri-listesi/son-24-saat",
    response_model=list[schemas.CagriListeResponse]
)
def son_24_saat_cagri_listesi(
    db: Session = Depends(get_db)
):
    return crud.get_son_24_saat_cagrilari(db)

@app.get("/sonuc-secenekleri")
def sonuc_secenekleri(
    db: Session = Depends(get_db),
    current_user: models.Kullanicilar = Depends(get_current_user)
):
    sonuclar = (
        db.query(models.CagriKayitlari.sonuc)
        .filter(models.CagriKayitlari.sonuc.isnot(None))
        .filter(models.CagriKayitlari.sonuc != "")
        .distinct()
        .order_by(models.CagriKayitlari.sonuc)
        .all()
    )

    return [
        sonuc[0]
        for sonuc in sonuclar
        if sonuc[0]
    ]