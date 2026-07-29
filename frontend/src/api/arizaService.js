import api from "./api";

export const getArizaTipleri = async () => {
  return await api.get("/ariza-tipleri");
};

export const createArizaTipi = async (arizaTipi) => {
  return await api.post("/ariza-tipleri", arizaTipi);
};

export const updateArizaTipi = async (id, arizaTipi) => {
  return await api.put(`/ariza-tipleri/${id}`, arizaTipi);
};

export const deleteArizaTipi = async (id) => {
  return await api.delete(`/ariza-tipleri/${id}`);
};