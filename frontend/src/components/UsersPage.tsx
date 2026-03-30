import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { createData, deleteData, fetchData, updateData } from "../api";
import type { User } from "../types";

type UserForm = {
  correo: string;
  username: string;
  password: string;
  permisos: string;
};

const emptyForm: UserForm = {
  correo: "",
  username: "",
  password: "",
  permisos: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");

  async function loadUsers() {
    try {
      const data = await fetchData<User[]>("/usuarios");
      setUsers(data);
    } catch {
      setError("No se pudieron cargar los usuarios");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleOpenCreate() {
    setEditingUser(null);
    setForm(emptyForm);
    setOpenForm(true);
  }

  function handleOpenEdit(user: User) {
    setEditingUser(user);
    setForm({
      correo: user.correo || "",
      username: user.username || "",
      password: "",
      permisos: user.permisos || "",
    });
    setOpenForm(true);
  }

  function handleCloseForm() {
    setOpenForm(false);
    setEditingUser(null);
    setForm(emptyForm);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      if (editingUser) {
        await updateData(`/usuarios/${editingUser.id}`, form);
        setSnackbar("Usuario actualizado correctamente");
      } else {
        await createData("/usuarios", form);
        setSnackbar("Usuario creado correctamente");
      }

      handleCloseForm();
      loadUsers();
    } catch {
      setError("No se pudo guardar el usuario");
    }
  }

  async function handleDelete() {
    if (!userToDelete) return;

    try {
      await deleteData(`/usuarios/${userToDelete.id}`);
      setSnackbar("Usuario eliminado correctamente");
      setUserToDelete(null);
      loadUsers();
    } catch {
      setError("No se pudo eliminar el usuario");
    }
  }

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h3">Usuarios</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>
          Nuevo usuario
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Permisos</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.correo}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.permisos}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleOpenEdit(user)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setUserToDelete(user)}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>
            {editingUser ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>
          <DialogContent>
            <TextField
              name="correo"
              label="Correo"
              value={form.correo}
              onChange={handleChange}
            />
            <TextField
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <TextField
              name="password"
              label={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
              type="password"
              value={form.password}
              onChange={handleChange}
              required={!editingUser}
            />
            <TextField
              name="permisos"
              label="Permisos"
              value={form.permisos}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingUser ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Eliminar usuario</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Deseas eliminar a {userToDelete?.username}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserToDelete(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar("")}
      >
        <Alert severity="success" onClose={() => setSnackbar("")}>
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  );
}