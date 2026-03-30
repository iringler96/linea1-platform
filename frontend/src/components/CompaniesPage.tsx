import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { createData, deleteData, fetchData, updateData } from "../api";
import type { Company, User } from "../types";

type CompanyForm = {
  nombreempresa: string;
  propietario: string;
};

const emptyForm: CompanyForm = {
  nombreempresa: "",
  propietario: "",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");

  async function loadCompanies() {
    try {
      const data = await fetchData<Company[]>("/empresas");
      setCompanies(data);
    } catch {
      setError("No se pudieron cargar las empresas");
    }
  }

  async function loadUsers() {
    try {
      const data = await fetchData<User[]>("/usuarios");
      setUsers(data);
    } catch {
      setError("No se pudieron cargar los usuarios");
    }
  }

  useEffect(() => {
    loadCompanies();
    loadUsers();
  }, []);

  function getOwnerName(ownerId: number | null) {
    if (!ownerId) return "-";
    const owner = users.find((u) => u.id === ownerId);
    return owner ? owner.username : ownerId;
  }

  function handleOpenCreate() {
    setEditingCompany(null);
    setForm(emptyForm);
    setOpenForm(true);
  }

  function handleOpenEdit(company: Company) {
    setEditingCompany(company);
    setForm({
      nombreempresa: company.nombreempresa || "",
      propietario: company.propietario ? String(company.propietario) : "",
    });
    setOpenForm(true);
  }

  function handleCloseForm() {
    setOpenForm(false);
    setEditingCompany(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload = {
      nombreempresa: form.nombreempresa,
      propietario: form.propietario ? Number(form.propietario) : null,
    };

    try {
      if (editingCompany) {
        await updateData(`/empresas/${editingCompany.id}`, payload);
        setSnackbar("Empresa actualizada correctamente");
      } else {
        await createData("/empresas", payload);
        setSnackbar("Empresa creada correctamente");
      }

      handleCloseForm();
      loadCompanies();
    } catch {
      setError("No se pudo guardar la empresa");
    }
  }

  async function handleDelete() {
    if (!companyToDelete) return;

    try {
      await deleteData(`/empresas/${companyToDelete.id}`);
      setSnackbar("Empresa eliminada correctamente");
      setCompanyToDelete(null);
      loadCompanies();
    } catch {
      setError("No se pudo eliminar la empresa");
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
        <Typography variant="h3">Empresas</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>
          Nueva empresa
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
              <TableCell>Nombre</TableCell>
              <TableCell>Propietario</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.id}</TableCell>
                <TableCell>{company.nombreempresa}</TableCell>
                <TableCell>{getOwnerName(company.propietario)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleOpenEdit(company)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setCompanyToDelete(company)}
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
            {editingCompany ? "Editar empresa" : "Nueva empresa"}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel shrink={!!form.nombreempresa}>Nombre empresa</InputLabel>
              <Select
                native={false}
                value=""
                open={false}
                sx={{ display: "none" }}
              />
            </FormControl>

            <Box sx={{ mt: 1, mb: 2 }}>
              <input
                style={{ display: "none" }}
                aria-hidden="true"
              />
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel>Propietario</InputLabel>
              <Select
                value={form.propietario}
                label="Propietario"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    propietario: String(e.target.value),
                  }))
                }
              >
                <MenuItem value="">Sin propietario</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={String(user.id)}>
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2 }}>
              <input
                type="text"
                value={form.nombreempresa}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nombreempresa: e.target.value,
                  }))
                }
                placeholder="Nombre empresa"
                style={{
                  width: "100%",
                  padding: "16.5px 14px",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.23)",
                  background: "transparent",
                  color: "white",
                  fontSize: 16,
                  outline: "none",
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingCompany ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={!!companyToDelete}
        onClose={() => setCompanyToDelete(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Eliminar empresa</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Deseas eliminar la empresa {companyToDelete?.nombreempresa}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompanyToDelete(null)}>Cancelar</Button>
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