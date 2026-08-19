import api from "./api";


export const getYazarkasalar = (subeId = null) => {

    if (subeId) {
        return api.get(
            `/yazarkasalar?sube_id=${subeId}`
        );
    }

    return api.get("/yazarkasalar");
};


export const getYazarkasa = (id) => {

    return api.get(
        `/yazarkasalar/${id}`
    );
};


export const createYazarkasa = (data) => {

    return api.post(
        "/yazarkasalar",
        data
    );
};


export const updateYazarkasa = (
    id,
    data
) => {

    return api.put(
        `/yazarkasalar/${id}`,
        data
    );
};


export const deleteYazarkasa = (id) => {

    return api.delete(
        `/yazarkasalar/${id}`
    );
};