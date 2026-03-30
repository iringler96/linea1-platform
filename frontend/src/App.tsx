import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Stack,
} from "@mui/material";
import MachinesPage from "./components/MachinesPage";
import CompaniesPage from "./components/CompaniesPage";
import UsersPage from "./components/UsersPage";
import ExpeditionsPage from "./components/ExpeditionsPage";
import LoginPage from "./components/LoginPage";
import type { AuthUser } from "./types";

type View = "machines" | "companies" | "users" | "expeditions";

export default function App() {
  const [view, setView] = useState<View>("machines");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  function handleLogin(newToken: string, newUser: AuthUser) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mr: 2 }}>
            LINEA 1
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            <Button color="inherit" onClick={() => setView("machines")}>
              MAQUINAS
            </Button>
            <Button color="inherit" onClick={() => setView("companies")}>
              EMPRESAS
            </Button>
            <Button color="inherit" onClick={() => setView("users")}>
              USUARIOS
            </Button>
            <Button color="inherit" onClick={() => setView("expeditions")}>
              EXPEDICIONES
            </Button>
          </Stack>

          <Typography variant="body1">{user?.username}</Typography>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 5 }}>
        {view === "machines" && <MachinesPage />}
        {view === "companies" && <CompaniesPage />}
        {view === "users" && <UsersPage />}
        {view === "expeditions" && <ExpeditionsPage />}
      </Container>
    </Box>
  );
}