import pandas as pd

from app.database import SessionLocal
from app import models

EXCEL_DOSYASI = "musteriler.xlsx"


def musterileri_aktar():

    # Excel'i oku
    df = pd.read_excel(EXCEL_DOSYASI, header=None)

    db = SessionLocal()

    try:
        eklenen = 0
        atlanan = 0

        for _, row in df.iterrows():

            cari_kodu = str(row.iloc[0]).strip()
            musteri_adi = str(row.iloc[1]).strip()

            if not cari_kodu or not musteri_adi:
                continue

            mevcut = (
                db.query(models.Musteriler)
                .filter(models.Musteriler.cari_kodu == cari_kodu)
                .first()
            )

            if mevcut:
                print(f"Zaten mevcut: {cari_kodu} - {musteri_adi}")
                atlanan += 1
                continue

            yeni_musteri = models.Musteriler(
                cari_kodu=cari_kodu,
                musteri_adi=musteri_adi
            )

            db.add(yeni_musteri)
            eklenen += 1

        db.commit()

        print("\n--------------------------------")
        print("Müşteri aktarımı tamamlandı.")
        print(f"Eklenen: {eklenen}")
        print(f"Atlanan: {atlanan}")
        print("--------------------------------")

    except Exception as e:
        db.rollback()
        print("HATA:", e)

    finally:
        db.close()


if __name__ == "__main__":
    musterileri_aktar()