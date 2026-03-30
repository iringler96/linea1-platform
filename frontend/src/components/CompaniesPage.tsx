import { useEffect, useState } from "react";
import { createData, deleteData, fetchData, updateData } from "../api";
import type { Company } from "../types";

const emptyForm = {
  nombreempresa: "",
  propietario: "",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCompanies() {
    try {
      const data = await fetchData<Company[]>("/empresas");
      setCompanies(data);
    } catch {
      setError("No se pudieron cargar las empresas");
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      nombreempresa: form.nombreempresa,
      propietario: form.propietario ? Number(form.propietario) : null,
    };

    try {
      if (editingId) {
        await updateData(`/empresas/${editingId}`, payload);
        setMessage("Empresa actualizada correctamente");
      } else {
        await createData("/empresas", payload);
        setMessage("Empresa creada correctamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      loadCompanies();
    } catch {
      setError("No se pudo guardar la empresa");
    }
  }

  function handleEdit(company: Company) {
    setEditingId(company.id);
    setForm({
      nombreempresa: company.nombreempresa || "",
      propietario: company.propietario ? String(company.propietario) : "",
    });
  }

  async function handleDelete(id: number) {
    const ok = window.confirm("¿Deseas eliminar esta empresa?");
    if (!ok) return;

    try {
      await deleteData(`/empresas/${id}`);
      setMessage("Empresa eliminada correctamente");
      loadCompanies();
    } catch {
      setError("No se pudo eliminar la empresa");
    }
  }

  return (
    <div>
      <h1 className="page-title">Gestión de Empresas</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-6">
              <label>Nombre empresa</label>
              <input
                name="nombreempresa"
                value={form.nombreempresa}
                onChange={handleChange}
                placeholder="Ingresa el nombre"
                required
              />
            </div>

            <div className="form-group col-6">
              <label>ID propietario</label>
              <input
                name="propietario"
                value={form.propietario}
                onChange={handleChange}
                placeholder="Ejemplo: 1"
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-success" type="submit">
              {editingId ? "Actualizar" : "Guardar"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  setEditingId(null);
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
              <th>ID</th>
              <th>Nombre empresa</th>
              <th>Propietario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>{company.id}</td>
                <td>{company.nombreempresa}</td>
                <td>{company.propietario}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-warning" onClick={() => handleEdit(company)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(company.id)}>
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