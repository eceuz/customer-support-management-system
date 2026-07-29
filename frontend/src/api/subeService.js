import api from "./api";

export const getSubeler = async (musteriId) => {
  const config = musteriId ? { params: { musteri_id: musteriId } } : {};
  
  return await api.get('/subeler', config);
};

export const getTumSubeler = async () => {
  return await api.get("/subeler");
};

export const createSube = async (sube) => {
  return await api.post("/subeler", sube);
};

export const updateSube = async (id, sube) => {
  return await api.put(`/subeler/${id}`, sube);
};

export const deleteSube = async (id) => {
  return await api.delete(`/subeler/${id}`);
};