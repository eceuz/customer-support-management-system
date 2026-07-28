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