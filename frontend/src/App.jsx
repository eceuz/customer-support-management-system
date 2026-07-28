import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ayarlar from "./pages/Ayarlar";

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

            </Routes>

        </BrowserRouter>

    );

}

export default App;

