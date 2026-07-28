import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/header.css";

import { jwtDecode } from "jwt-decode";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  let kullaniciAdi = "Kullanıcı";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      kullaniciAdi = decoded.username || "Kullanıcı";
    } catch (err) {
      console.error("Token okunamadı:", err);
    }
  }

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-box">
          <SupportAgentIcon />
        </div>

        <div>
          <h1>Destek Kayıt Sistemi</h1>
          <span>Teknik Destek Yönetimi</span>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={location.pathname === "/dashboard" ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          Ana Sayfa
        </button>

        <button
          className={location.pathname === "/raporlar" ? "active" : ""}
          onClick={() => navigate("/raporlar")}
        >
          Raporlar
        </button>

        <button
          className={location.pathname === "/ayarlar" ? "active" : ""}
          onClick={() => navigate("/ayarlar")}
        >
          Ayarlar
        </button>
      </nav>

      <div className="header-right">
        <div className="user-info" onClick={handleClick}>
          <AccountCircleIcon className="user-icon" />

          <div>
            <p>{kullaniciAdi}</p>
          </div>

          <KeyboardArrowDownIcon className="arrow" />
        </div>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>
            <PersonIcon sx={{ mr: 1 }} />
            Profil
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Çıkış Yap
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

export default Header;