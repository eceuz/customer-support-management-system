import { useEffect } from "react";

import {
  HashRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ayarlar from "./pages/Ayarlar";
import Raporlar from "./pages/Raporlar";


function YenilemeKontrolu() {

  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {

    const navigationEntries =
      performance.getEntriesByType("navigation");

    const navigation =
      navigationEntries[0];

    const sayfaYenilendi =
      navigation?.type === "reload";


    if (
      sayfaYenilendi &&
      location.pathname !== "/"
    ) {

      localStorage.removeItem("token");

      navigate("/", {
        replace: true,
      });

    }

  }, []);


  return null;
}


function App() {

  return (

    <HashRouter>

      <YenilemeKontrolu />

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

    </HashRouter>

  );

}


export default App;