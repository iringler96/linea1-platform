const API_URL = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

function getHeaders(includeJson = false): HeadersInit {
  const token = getToken();

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginRequest(payload: {
  username: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Credenciales inválidas");
  }

  return response.json();
}

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Error al obtener datos");
  return response.json();
}

export async function createData<T>(
  endpoint: string,
  payload: unknown
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Error al crear datos");
  return response.json();
}

export async function updateData<T>(
  endpoint: string,
  payload: unknown
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Error al actualizar datos");
  return response.json();
}

export async function deleteData(endpoint: string): Promise<void> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Error al eliminar datos");
}