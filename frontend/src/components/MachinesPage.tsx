import { useEffect, useState } from "react";
import { createData, deleteData, fetchData, updateData } from "../api";
import type { Machine } from "../types";

const emptyForm = {
  ppu: "",
  anio: "",
  nmaquina: "",
  idempresa: "",
  activa: "si",
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingPpu, setEditingPpu] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadMachines() {
    try {
      const data = await fetchData<Machine[]>("/maquinas");
      setMachines(data);
    } catch {
      setError("No se pudieron cargar las máquinas");
    }
  }

  useEffect(() => {
    loadMachines();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      ppu: form.ppu,
      anio: form.anio ? Number(form.anio) : null,
      nmaquina: form.nmaquina ? Number(form.nmaquina) : null,
      idempresa: form.idempresa ? Number(form.idempresa) : null,
      activa: form.activa,
    };

    try {
      if (editingPpu) {
        await updateData(`/maquinas/${editingPpu}`, {
          anio: payload.anio,
          nmaquina: payload.nmaquina,
          idempresa: payload.idempresa,
          activa: payload.activa,
        });
        setMessage("Máquina actualizada correctamente");
      } else {
        await createData("/maquinas", payload);
        setMessage("Máquina creada correctamente");
      }

      setForm(emptyForm);
      setEditingPpu(null);
      loadMachines();
    } catch {
      setError("No se pudo guardar la máquina");
    }
  }

  function handleEdit(machine: Machine) {
    setEditingPpu(machine.ppu);
    setForm({
      ppu: machine.ppu,
      anio: machine.anio ? String(machine.anio) : "",
      nmaquina: machine.nmaquina ? String(machine.nmaquina) : "",
      idempresa: machine.idempresa ? String(machine.idempresa) : "",
      activa: machine.activa || "si",
    });
  }

  async function handleDelete(ppu: string) {
    const ok = window.confirm("¿Deseas eliminar esta máquina?");
    if (!ok) return;

    try {
      await deleteData(`/maquinas/${ppu}`);
      setMessage("Máquina eliminada correctamente");
      loadMachines();
    } catch {
      setError("No se pudo eliminar la máquina");
    }
  }

  return (
    <div>
      <h1 className="page-title">Gestión de Máquinas</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-3">
              <label>PPU</label>
              <input
                name="ppu"
                value={form.ppu}
                onChange={handleChange}
                placeholder="ABCD12"
                required
                disabled={!!editingPpu}
              />
            </div>

            <div className="form-group col-3">
              <label>Año</label>
              <input
                name="anio"
                value={form.anio}
                onChange={handleChange}
                placeholder="2024"
              />
            </div>

            <div className="form-group col-3">
              <label>N° Máquina</label>
              <input
                name="nmaquina"
                value={form.nmaquina}
                onChange={handleChange}
                placeholder="101"
              />
            </div>

            <div className="form-group col-3">
              <label>ID Empresa</label>
              <input
                name="idempresa"
                value={form.idempresa}
                onChange={handleChange}
                placeholder="1"
              />
            </div>

            <div className="form-group col-3">
              <label>Activa</label>
              <select name="activa" value={form.activa} onChange={handleChange}>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-success" type="submit">
              {editingPpu ? "Actualizar" : "Guardar"}
            </button>

            {editingPpu && (
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  setEditingPpu(null);
                  setForm(emptyForm);
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>PPU</th>
              <th>Año</th>
              <th>N° Máquina</th>
              <th>ID Empresa</th>
              <th>Activa</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine.ppu}>
                <td>{machine.ppu}</td>
                <td>{machine.anio}</td>
                <td>{machine.nmaquina}</td>
                <td>{machine.idempresa}</td>
                <td>{machine.activa}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-warning" onClick={() => handleEdit(machine)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(machine.ppu)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}