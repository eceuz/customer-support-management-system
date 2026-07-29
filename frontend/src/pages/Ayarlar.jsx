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

function Ayarlar() {

    const [activeModule,setActiveModule]=useState("musteriler");

    return(

        <div className="dashboard">

            <Header/>

            <main className="settings-page">

                <div className="settings-sidebar">

                    <h2 className="settings-title">
                        Yönetim
                    </h2>

                    <div
                        className={`settings-item ${activeModule==="musteriler" ? "active":""}`}
                        onClick={()=>setActiveModule("musteriler")}
                    >

                        <PeopleIcon/>

                        <div>

                            <h3>Müşteriler</h3>

                            <p>Müşteri kayıtlarını yönetin</p>

                        </div>

                    </div>

                    <div
                        className={`settings-item ${activeModule==="subeler" ? "active":""}`}
                        onClick={()=>setActiveModule("subeler")}
                    >

                        <StoreIcon/>

                        <div>

                            <h3>Şubeler</h3>

                            <p>Şube kayıtlarını yönetin</p>

                        </div>

                    </div>

                    <div
                        className={`settings-item ${activeModule==="arizalar" ? "active":""}`}
                        onClick={()=>setActiveModule("arizalar")}
                    >

                        <BuildIcon/>

                        <div>

                            <h3>Arıza Tipleri</h3>

                            <p>Arıza tiplerini yönetin</p>

                        </div>

                    </div>

                    <div
                        className={`settings-item ${activeModule==="kullanicilar" ? "active":""}`}
                        onClick={()=>setActiveModule("kullanicilar")}
                    >

                        <PersonIcon/>

                        <div>

                            <h3>Kullanıcılar</h3>

                            <p>Kullanıcı hesaplarını yönetin</p>

                        </div>

                    </div>

                </div>

                <div className="settings-content">

                    {activeModule==="musteriler" && <Musteriler />}

                    {activeModule === "subeler" && <Subeler />}

                    {activeModule === "arizalar" && <ArizaTipleri />}

                    {activeModule==="kullanicilar" && <Kullanicilar />} 

                </div>

            </main>

        </div>

    );

}

export default Ayarlar;