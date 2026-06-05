import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Instituicao from "./pages/Instituicao";
import Favoritos from "./pages/Favoritos";
import SetupAdmin from "./pages/SetupAdmin";
import RecuperarSenha from "./pages/RecuperarSenha";

import DashboardAdmin from "./pages/admin/DashboardAdmin";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import MateriaisAdmin from "./pages/admin/MateriaisAdmin";
import CursosAdmin from "./pages/admin/CursosAdmin";

function AdminRoute({ children }: { children: ReactNode }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role === "ADMIN" ? children : <Navigate to="/" replace />;
}

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
          path="/recuperar-senha"
          element={<RecuperarSenha />}
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
        element={<AdminRoute><DashboardAdmin /></AdminRoute>}
      />

      <Route
        path="/admin/usuarios"
        element={<AdminRoute><UsuariosAdmin /></AdminRoute>}
      />

      <Route
        path="/admin/materiais"
        element={<AdminRoute><MateriaisAdmin /></AdminRoute>}
      />

      <Route
        path="/admin/cursos"
        element={<AdminRoute><CursosAdmin /></AdminRoute>}
      />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
