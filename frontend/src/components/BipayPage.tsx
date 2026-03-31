import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchData, uploadFile } from "../api";
import type { BipayResponse, Machine } from "../types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BipayPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedPpu, setSelectedPpu] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [data, setData] = useState<BipayResponse | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadMachines() {
    try {
      const response = await fetchData<Machine[]>("/maquinas");
      setMachines(response);
    } catch {
      setError("No se pudieron cargar las máquinas");
    }
  }

  useEffect(() => {
    loadMachines();
  }, []);

  async function handleSearch() {
    if (!selectedPpu) {
      setError("Debes seleccionar una máquina");
      return;
    }

    setError("");
    setSuccess("");

    const params = new URLSearchParams();
    params.set("ppu", selectedPpu);
    if (startDate) params.set("fechaInicio", startDate.format("YYYY-MM-DD"));
    if (endDate) params.set("fechaFin", endDate.format("YYYY-MM-DD"));

    try {
      const response = await fetchData<BipayResponse>(`/bipay?${params.toString()}`);
      setData(response);
    } catch {
      setError("No se pudo consultar BIPAY");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const response = await uploadFile<{ message: string; inserted: number; updated: number }>(
        "/bipay/upload",
        file
      );
      setSuccess(`${response.message}. Insertados: ${response.inserted}, actualizados: ${response.updated}`);
    } catch {
      setError("No se pudo subir el archivo Excel");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const chartData = useMemo(() => data?.chart ?? [], [data]);

  return (
    <>
      <Typography variant="h3" mb={4}>
        Ingrese la máquina a buscar
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              label="Selecciona una máquina"
              value={selectedPpu}
              onChange={(e) => setSelectedPpu(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Selecciona una máquina...</MenuItem>
              {machines.map((machine) => (
                <MenuItem key={machine.ppu} value={machine.ppu}>
                  {machine.ppu}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha inicio"
              value={startDate}
              onChange={setStartDate}
              format="DD-MM-YYYY"
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha final"
              value={endDate}
              onChange={setEndDate}
              format="DD-MM-YYYY"
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
          <Button variant="contained" color="success" onClick={handleSearch}>
            Buscar
          </Button>

          <Button variant="contained" component="label">
            {uploading ? "Subiendo..." : "Subir Excel BIPAY"}
            <input hidden type="file" accept=".xlsx,.xls" onChange={handleUpload} />
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Paper>

      {data && (
        <>
          <Paper sx={{ p: 3, mb: 4, borderTop: "3px solid #198754" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h5">Total recaudado (Bipay)</Typography>
                <Typography variant="h4" fontWeight={700} mt={1}>
                  {formatCurrency(data.summary.totalRecaudado)}
                </Typography>
              </Box>

              <Typography variant="body1">
                Días con datos: <strong>{data.summary.diasConDatos}</strong>
              </Typography>
            </Stack>
          </Paper>

          <Typography variant="h4" mb={2}>
            Resultados máquina {data.summary.maquina}
          </Typography>

          <Paper sx={{ p: 2, mb: 4 }}>
            <Box sx={{ width: "100%", height: 500 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" angle={-60} textAnchor="end" height={110} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Recaudación diaria" fill="#7ed6d4" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper sx={{ overflow: "hidden" }}>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1f242b" }}>
                    <th style={th}>PPU</th>
                    <th style={th}>Fecha</th>
                    <th style={th}>Transacciones Normales</th>
                    <th style={th}>Transacciones EMV</th>
                    <th style={th}>Saldo Trans. Normales</th>
                    <th style={th}>Saldo Trans. EMV</th>
                    <th style={th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={`${row.ppu}-${row.fecha}`} style={{ background: "#f5f5f5", color: "#000" }}>
                      <td style={td}>{row.ppu}</td>
                      <td style={td}>{row.fecha}</td>
                      <td style={td}>{row.canttransaccionesn ?? 0}</td>
                      <td style={td}>{row.canttransaccionesemv ?? 0}</td>
                      <td style={td}>{formatCurrency(row.usosnormales ?? 0)}</td>
                      <td style={td}>{formatCurrency(row.usosemv ?? 0)}</td>
                      <td style={td}>{formatCurrency(row.totalusos ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </>
      )}
    </>
  );
}

const th: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
  color: "white",
  border: "1px solid #374151",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
};