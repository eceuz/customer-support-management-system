import api from "./api";


// YENİ ARIZA OLUŞTUR

export const createAriza = (data) => {
    return api.post("/arizalar", data);
};


// TÜM ARIZALARI GETİR

export const getArizalar = () => {
    return api.get("/arizalar");
};


// BANA ATANAN İŞLERİ GETİR

export const getBanaAtananArizalar = () => {
    return api.get("/arizalar/bana-atananlar");
};


// PERSONELE İŞ ATA

export const arizaAta = (id, kullaniciId) => {
    return api.put(
        `/arizalar/${id}/ata`,
        {
            atanan_kullanici_id: kullaniciId
        }
    );
};


// İŞE BAŞLA

export const arizaIseBasla = (id) => {
    return api.put(
        `/arizalar/${id}/ise-basla`
    );
};


// ARIZAYA İŞLEM EKLE

export const arizaIslemEkle = (id, data) => {
    return api.post(
        `/arizalar/${id}/islemler`,
        data
    );
};


// ARIZANIN İŞLEMLERİNİ GETİR

export const getArizaIslemleri = (id) => {
    return api.get(
        `/arizalar/${id}/islemler`
    );
};


// ARIZAYI TAMAMLA

export const arizaTamamla = (id) => {
    return api.put(
        `/arizalar/${id}/tamamla`
    );
};