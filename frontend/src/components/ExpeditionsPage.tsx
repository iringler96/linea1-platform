import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Stack,
} from "@mui/material";
import { fetchData } from "../api";
import type { Expedition, Machine } from "../types";

export default function ExpeditionsPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [selectedPpu, setSelectedPpu] = useState("");
  const [error, setError] = useState("");
  const [loadingText, setLoadingText] = useState("");

  async function loadMachines() {
    try {
      const data = await fetchData<Machine[]>("/maquinas");
      setMachines(data);
    } catch {
      setError("No se pudieron cargar las máquinas");
    }
  }

  async function loadExpeditions(ppu?: string) {
    try {
      setLoadingText("Cargando expediciones...");
      setError("");

      const endpoint = ppu ? `/expediciones?ppu=${ppu}` : "/expediciones";
      const data = await fetchData<Expedition[]>(endpoint);
      setExpeditions(data);
    } catch {
      setError("No se pudieron cargar las expediciones");
    } finally {
      setLoadingText("");
    }
  }

  useEffect(() => {
    loadMachines();
    loadExpeditions();
  }, []);

  return (
    <>
      <Typography variant="h3" mb={3}>
        Expediciones
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Máquina</InputLabel>
              <Select
                value={selectedPpu}
                label="Máquina"
                onChange={(e) => setSelectedPpu(e.target.value)}
              >
                <MenuItem value="">Todas las máquinas</MenuItem>
                {machines.map((machine) => (
                  <MenuItem key={machine.ppu} value={machine.ppu}>
                    {machine.ppu}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => loadExpeditions(selectedPpu)}
          >
            Buscar
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              setSelectedPpu("");
              loadExpeditions();
            }}
          >
            Limpiar filtro
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {loadingText && <Typography sx={{ mt: 2 }}>{loadingText}</Typography>}
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N° Expedición</TableCell>
              <TableCell>PPU</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Sentido</TableCell>
              <TableCell>Validez</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expeditions.map((item) => (
              <TableRow key={item.nexpedicion}>
                <TableCell>{item.nexpedicion}</TableCell>
                <TableCell>{item.ppu}</TableCell>
                <TableCell>{item.servicio}</TableCell>
                <TableCell>{item.fecha}</TableCell>
                <TableCell>{item.hora}</TableCell>
                <TableCell>{item.sentido}</TableCell>
                <TableCell>{item.validez}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}