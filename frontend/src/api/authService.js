import api from "./api";
import { jwtDecode } from "jwt-decode";


export const login = async (kullanici_adi, sifre) => {
    const response = await api.post("/login", {
        kullanici_adi,
        sifre
    });

    return response;
};


// Giriş yapan kullanıcının token bilgisini çözer
const getDecodedToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
};


// Kullanıcının rolünü getirir
export const getUserRole = () => {
    const decoded = getDecodedToken();

    return decoded?.rol || null;
};


// Kullanıcının ID'sini getirir
export const getCurrentUserId = () => {
    const decoded = getDecodedToken();

    if (!decoded?.sub) {
        return null;
    }

    return Number(decoded.sub);
};
export const getCurrentUsername = () => {
    const decoded = getDecodedToken();

    return decoded?.username || null;
};


// Admin mi?
export const isAdmin = () => {
    return getUserRole() === "ADMİN";
};


// İzleyici mi?
export const isViewer = () => {
    return getUserRole() === "İZLEYİCİ";
};


// Veri değiştirebilir mi?
export const canModify = () => {
    const rol = getUserRole();

    return rol === "ADMİN" || rol === "DESTEK";
};