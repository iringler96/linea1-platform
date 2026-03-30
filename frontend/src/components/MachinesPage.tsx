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
  Grid,
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
  TextField,
  Typography,
} from "@mui/material";
import { createData, deleteData, fetchData, updateData } from "../api";
import type { Company, Machine } from "../types";

type MachineForm = {
  ppu: string;
  anio: string;
  nmaquina: string;
  idempresa: string;
  activa: string;
};

const emptyForm: MachineForm = {
  ppu: "",
  anio: "",
  nmaquina: "",
  idempresa: "",
  activa: "si",
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<MachineForm>(emptyForm);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");

  async function loadMachines() {
    try {
      const data = await fetchData<Machine[]>("/maquinas");
      setMachines(data);
    } catch {
      setError("No se pudieron cargar las máquinas");
    }
  }

  async function loadCompanies() {
    try {
      const data = await fetchData<Company[]>("/empresas");
      setCompanies(data);
    } catch {
      setError("No se pudieron cargar las empresas");
    }
  }

  useEffect(() => {
    loadMachines();
    loadCompanies();
  }, []);

  function getCompanyName(companyId: number | null) {
    if (!companyId) return "-";
    const company = companies.find((c) => c.id === companyId);
    return company ? company.nombreempresa : companyId;
  }

  function handleOpenCreate() {
    setEditingMachine(null);
    setForm(emptyForm);
    setOpenForm(true);
  }

  function handleOpenEdit(machine: Machine) {
    setEditingMachine(machine);
    setForm({
      ppu: machine.ppu,
      anio: machine.anio ? String(machine.anio) : "",
      nmaquina: machine.nmaquina ? String(machine.nmaquina) : "",
      idempresa: machine.idempresa ? String(machine.idempresa) : "",
      activa: machine.activa || "si",
    });
    setOpenForm(true);
  }

  function handleCloseForm() {
    setOpenForm(false);
    setEditingMachine(null);
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

    const payload = {
      ppu: form.ppu,
      anio: form.anio ? Number(form.anio) : null,
      nmaquina: form.nmaquina ? Number(form.nmaquina) : null,
      idempresa: form.idempresa ? Number(form.idempresa) : null,
      activa: form.activa,
    };

    try {
      if (editingMachine) {
        await updateData(`/maquinas/${editingMachine.ppu}`, {
          anio: payload.anio,
          nmaquina: payload.nmaquina,
          idempresa: payload.idempresa,
          activa: payload.activa,
        });
        setSnackbar("Máquina actualizada correctamente");
      } else {
        await createData("/maquinas", payload);
        setSnackbar("Máquina creada correctamente");
      }

      handleCloseForm();
      loadMachines();
    } catch {
      setError("No se pudo guardar la máquina");
    }
  }

  async function handleDelete() {
    if (!machineToDelete) return;

    try {
      await deleteData(`/maquinas/${machineToDelete.ppu}`);
      setSnackbar("Máquina eliminada correctamente");
      setMachineToDelete(null);
      loadMachines();
    } catch {
      setError("No se pudo eliminar la máquina");
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
        <Typography variant="h3">Máquinas</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>
          Nueva máquina
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
              <TableCell>PPU</TableCell>
              <TableCell>Año</TableCell>
              <TableCell>N° Máquina</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Activa</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {machines.map((machine) => (
              <TableRow key={machine.ppu}>
                <TableCell>{machine.ppu}</TableCell>
                <TableCell>{machine.anio}</TableCell>
                <TableCell>{machine.nmaquina}</TableCell>
                <TableCell>{getCompanyName(machine.idempresa)}</TableCell>
                <TableCell>{machine.activa}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleOpenEdit(machine)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setMachineToDelete(machine)}
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

      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="md">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>
            {editingMachine ? "Editar máquina" : "Nueva máquina"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  name="ppu"
                  label="PPU"
                  value={form.ppu}
                  onChange={handleChange}
                  required
                  disabled={!!editingMachine}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  name="anio"
                  label="Año"
                  value={form.anio}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  name="nmaquina"
                  label="N° Máquina"
                  value={form.nmaquina}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Empresa</InputLabel>
                  <Select
                    value={form.idempresa}
                    label="Empresa"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        idempresa: String(e.target.value),
                      }))
                    }
                  >
                    <MenuItem value="">Sin empresa</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={String(company.id)}>
                        {company.nombreempresa}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Activa</InputLabel>
                  <Select
                    value={form.activa}
                    label="Activa"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        activa: String(e.target.value),
                      }))
                    }
                  >
                    <MenuItem value="si">Sí</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingMachine ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={!!machineToDelete}
        onClose={() => setMachineToDelete(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Eliminar máquina</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Deseas eliminar la máquina {machineToDelete?.ppu}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMachineToDelete(null)}>Cancelar</Button>
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