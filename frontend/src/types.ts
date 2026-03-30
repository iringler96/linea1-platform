export type AuthUser = {
  id: number;
  username: string;
  correo: string | null;
  permisos: string | null;
};

export type User = {
  id: number;
  correo: string | null;
  username: string;
  permisos: string | null;
};

export type Company = {
  id: number;
  nombreempresa: string | null;
  propietario: number | null;
};

export type Machine = {
  ppu: string;
  anio: number | null;
  nmaquina: number | null;
  idempresa: number | null;
  activa: string | null;
};

export type Expedition = {
  nexpedicion: number;
  ppu: string | null;
  servicio: string | null;
  fecha: string | null;
  hora: string | null;
  sentido: string | null;
  validez: string | null;
};