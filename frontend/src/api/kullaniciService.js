import api from "./api";

export const getKullanicilar = async () => {
  return await api.get("/kullanicilar");
};

export const createKullanici = async (kullanici) => {
  return await api.post("/kullanicilar", kullanici);
};

export const updateKullanici = async (id, kullanici) => {
  return await api.put(`/kullanicilar/${id}`, kullanici);
};

export const deleteKullanici = async (id) => {
  return await api.delete(`/kullanicilar/${id}`);
};