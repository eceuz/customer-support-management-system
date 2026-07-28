import api from "./api";

export const login = async (kullanici_adi, sifre) => {

    const response = await api.post("/login", {

        kullanici_adi,
        sifre

    });

    return response;
};