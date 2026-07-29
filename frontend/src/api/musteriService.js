import api from "./api";

export const getMusteriler = async () => {
    return await api.get("/musteriler");
};

export const createMusteri = async (musteri) => {
    return await api.post("/musteriler", musteri);
};

export const updateMusteri = async (id, musteri) => {
    return await api.put(`/musteriler/${id}`, musteri);
};

export const deleteMusteri = async (id) => {
    return await api.delete(`/musteriler/${id}`);
};