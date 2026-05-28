import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Instituicao from "./pages/Instituicao";
import Favoritos from "./pages/Favoritos";
import SetupAdmin from "./pages/SetupAdmin";

import DashboardAdmin from "./pages/admin/DashboardAdmin";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import MateriaisAdmin from "./pages/admin/MateriaisAdmin";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/setup-admin"
          element={<SetupAdmin />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
        path="/instituicao"
        element={<Instituicao />}
      />

      <Route
        path="/favoritos"
        element={<Favoritos />}
      />

      <Route
        path="/admin"
        element={<DashboardAdmin />}
      />

      <Route
        path="/admin/usuarios"
        element={<UsuariosAdmin />}
      />

      <Route
        path="/admin/materiais"
        element={<MateriaisAdmin />}
      />

      </Routes>

    </BrowserRouter>

  );

}

export default App;