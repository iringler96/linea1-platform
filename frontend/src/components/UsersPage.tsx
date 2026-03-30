import { useEffect, useState } from "react";
import { createData, deleteData, fetchData, updateData } from "../api";
import type { User } from "../types";

const emptyForm = {
  correo: "",
  username: "",
  password: "",
  permisos: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await updateData(`/usuarios/${editingId}`, form);
        setMessage("Usuario actualizado correctamente");
      } else {
        await createData("/usuarios", form);
        setMessage("Usuario creado correctamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      loadUsers();
    } catch {
      setError("No se pudo guardar el usuario");
    }
  }

  function handleEdit(user: User) {
    setEditingId(user.id);
    setForm({
      correo: user.correo || "",
      username: user.username || "",
      password: user.password || "",
      permisos: user.permisos || "",
    });
  }

  async function handleDelete(id: number) {
    const ok = window.confirm("¿Deseas eliminar este usuario?");
    if (!ok) return;

    try {
      await deleteData(`/usuarios/${id}`);
      setMessage("Usuario eliminado correctamente");
      loadUsers();
    } catch {
      setError("No se pudo eliminar el usuario");
    }
  }

  return (
    <div>
      <h1 className="page-title">Gestión de Usuarios</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-6">
              <label>Correo</label>
              <input
                name="correo"
                value={form.correo}
                onChange={handleChange}
                placeholder="correo@ejemplo.cl"
              />
            </div>

            <div className="form-group col-6">
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Ingresa username"
                required
              />
            </div>

            <div className="form-group col-6">
              <label>Password</label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Ingresa password"
                required
              />
            </div>

            <div className="form-group col-6">
              <label>Permisos</label>
              <input
                name="permisos"
                value={form.permisos}
                onChange={handleChange}
                placeholder="admin / operador"
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
              <th>Correo</th>
              <th>Username</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.correo}</td>
                <td>{user.username}</td>
                <td>{user.permisos}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-warning" onClick={() => handleEdit(user)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
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