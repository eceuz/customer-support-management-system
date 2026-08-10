import api from "./api";

export const createCagri = (data) => {
    return api.post("/cagri-kayitlari", data);
};

export const getCagrilar = () => {
    return api.get("/cagri-kayitlari");
};

export const getCagriListesi = () => {
    return api.get("/cagri-listesi");
};

// ÇAĞRI SİL
export const deleteCagri = (id) => {
    return api.delete(`/cagri-kayitlari/${id}`);
};

// ÇAĞRI GÜNCELLE
export const updateCagri = (id, data) => {
    return api.put(`/cagri-kayitlari/${id}`, data);
};
export const getSon24SaatCagriListesi = async () => {
  return api.get("/cagri-listesi/son-24-saat");
};