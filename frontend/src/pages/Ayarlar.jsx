import { useState } from "react";
import Header from "../components/Header";
import "../styles/settings.css";
import Musteriler from "../components/Musteriler";
import Subeler from "../components/Subeler";
import Kullanicilar from "../components/Kullanicilar";
import ArizaTipleri from "../components/ArizaTipleri";

import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";

import { Box, Paper, Typography } from "@mui/material";

function Ayarlar() {
  const [activeModule, setActiveModule] = useState("musteriler");

  const menuItems = [
    { id: "musteriler", label: "Müşteriler", desc: "Müşteri kayıtlarını yönetin", icon: <PeopleIcon /> },
    { id: "subeler", label: "Şubeler", desc: "Şube kayıtlarını yönetin", icon: <StoreIcon /> },
    { id: "arizalar", label: "Arıza Tipleri", desc: "Arıza tiplerini yönetin", icon: <BuildIcon /> },
    { id: "kullanicilar", label: "Kullanıcılar", desc: "Kullanıcı hesaplarını yönetin", icon: <PersonIcon /> },
  ];

  return (
    <div className="dashboard">
      <Header />

      <main className="settings-page" style={{ display: "flex", gap: "24px", padding: "24px" }}>
        
        {/* Modernize Edilmiş Sol Menü (Sidebar) */}
        <Paper 
          elevation={0} 
          className="settings-sidebar"
          style={{ 
            width: "300px", 
            padding: "16px", 
            borderRadius: "16px", 
            height: "fit-content",
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.06)"
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, px: 2, fontWeight: 700, color: "#1e293b" }}>
            Yönetim
          </Typography>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {menuItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: isActive ? "rgba(25, 118, 210, 0.08)" : "transparent",
                    color: isActive ? "#1976d2" : "#64748b",
                    borderLeft: isActive ? "4px solid #1976d2" : "4px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ fontSize: "22px", display: "flex", alignItems: "center" }}>
                    {item.icon}
                  </span>
                  <div>
                    <Typography 
                      variant="subtitle2" 
                      style={{ fontWeight: isActive ? 700 : 600, lineHeight: 1.2, color: isActive ? "#1976d2" : "#334155" }}
                    >
                      {item.label}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      style={{ color: "#94a3b8", display: "block", marginTop: "2px" }}
                    >
                      {item.desc}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </div>
        </Paper>

        {/* İçerik Alanı */}
        <div className="settings-content" style={{ flex: 1 }}>
          {activeModule === "musteriler" && <Musteriler />}
          {activeModule === "subeler" && <Subeler />}
          {activeModule === "arizalar" && <ArizaTipleri />}
          {activeModule === "kullanicilar" && <Kullanicilar />}
        </div>

      </main>
    </div>
  );
}

export default Ayarlar;