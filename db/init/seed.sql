INSERT INTO tb_usuarios (correo, username, password, permisos)
VALUES
('admin@linea1.cl', 'admin', '$2b$10$8wJmK0fQxZ1f3QvQh2xF6eWbEX6x5hWQn5vY2vN3yA3G0n4Ck0tB2', 'admin'),
('operador@linea1.cl', 'operador1', '$2b$10$8wJmK0fQxZ1f3QvQh2xF6eWbEX6x5hWQn5vY2vN3yA3G0n4Ck0tB2', 'operador'),
('i.ringler96@gmail.com', 'iringler', '$2b$10$Of4FRLX7nUF82sylOZDeNuHpjSDmeYKb4Bq9T4WdbdhkVYcPNKj5q', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO tb_empresas (nombreEmpresa, propietario)
VALUES
('Empresa Central', 1),
('Empresa Sur', 2)
ON CONFLICT DO NOTHING;

INSERT INTO tb_maquinas (ppu, anio, nMaquina, idEmpresa, activa)
VALUES
('ABCD12', 2020, 101, 1, 'si'),
('EFGH34', 2021, 102, 1, 'si'),
('IJKL56', 2019, 201, 2, 'no')
ON CONFLICT (ppu) DO NOTHING;

INSERT INTO tb_puntualidad (tipoDia, servicio, horario)
VALUES
('LAB', 'A', '07:00:00'),
('LAB', 'B', '08:00:00'),
('SAB', 'A', '09:00:00');

INSERT INTO tb_montos (periodo, perimetro, compensacion)
VALUES
('2026-03-01', 163360000, 25000000)
ON CONFLICT DO NOTHING;

INSERT INTO tb_expediciones (
    nExpedicion, ppu, servicio, fecha, hora, sentido, validez,
    pc1, pc2, pc3, pc4
)
VALUES
(1, 'ABCD12', 'A', '2026-03-01', '07:15:00', 'IDA', 'SI', 'OK', 'OK', 'OK', 'OK'),
(2, 'EFGH34', 'B', '2026-03-01', '08:20:00', 'VTA', 'SI', 'OK', 'OK', 'OK', 'OK')
ON CONFLICT (nExpedicion) DO NOTHING;

INSERT INTO tb_bipay (
    ppu, fecha, cantTransaccionesN, cantTransaccionesEMV,
    usosNormales, usosEMV, totalTransacciones, totalUsos
)
VALUES
('ABCD12', '2026-03-01', 100, 20, 95, 18, 120, 113),
('EFGH34', '2026-03-01', 150, 15, 140, 12, 165, 152)
ON CONFLICT (ppu, fecha) DO NOTHING;