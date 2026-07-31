import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ayarlar from "./pages/Ayarlar";
import Raporlar from "./pages/Raporlar";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route 
                    path="/ayarlar" 
                    element={<Ayarlar />} 
                />
                <Route
                    path="/raporlar"
                    element={<Raporlar />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;

