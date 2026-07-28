import api from "./api";

export const getArizaTipleri = async () => {

    return await api.get("/ariza-tipleri");

};