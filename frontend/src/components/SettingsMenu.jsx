import "../styles/settingsMenu.css";

import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import BuildIcon from "@mui/icons-material/Build";

function SettingsMenu({ activePage, setActivePage }) {
  return (
    <div className="settings-menu">

      <h3>Ayarlar</h3>

      <button
        className={activePage === "musteriler" ? "active" : ""}
        onClick={() => setActivePage("musteriler")}
      >
        <PeopleIcon />
        Müşteriler
      </button>

      <button
        className={activePage === "subeler" ? "active" : ""}
        onClick={() => setActivePage("subeler")}
      >
        <StoreIcon />
        Şubeler
      </button>

      <button
        className={activePage === "arizalar" ? "active" : ""}
        onClick={() => setActivePage("arizalar")}
      >
        <BuildIcon />
        Arıza Tipleri
      </button>

    </div>
  );
}

export default SettingsMenu;