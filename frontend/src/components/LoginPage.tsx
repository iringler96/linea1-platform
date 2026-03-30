import { useState } from "react";
import { Box, Button, Paper, TextField, Typography, Alert } from "@mui/material";
import { loginRequest } from "../api";
import type { AuthUser } from "../types";

type Props = {
  onLogin: (token: string, user: AuthUser) => void;
};

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const data = await loginRequest({ username, password });
      onLogin(data.token, data.user);
    } catch {
      setError("Usuario o contraseña incorrectos");
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 420, p: 4 }}>
        <Typography variant="h3" mb={3}>
          Iniciar sesión
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button fullWidth type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Entrar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}