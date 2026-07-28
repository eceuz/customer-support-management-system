import api from "./api";

export const getMusteriler = async () => {

    const response = await api.get("/musteriler");

    return response;
};