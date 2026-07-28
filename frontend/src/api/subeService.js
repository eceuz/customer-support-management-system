import api from "./api";

export const getSubeler = async (musteriId) => {

    return await api.get(`/subeler?musteri_id=${musteriId}`);

};