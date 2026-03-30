CREATE TABLE IF NOT EXISTS tb_usuarios (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    correo VARCHAR(255),
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    permisos VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS tb_empresas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombreEmpresa VARCHAR(150),
    propietario INTEGER,
    CONSTRAINT fk_empresas_propietario
        FOREIGN KEY (propietario) REFERENCES tb_usuarios(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tb_maquinas (
    ppu VARCHAR(6) PRIMARY KEY,
    anio INTEGER,
    nMaquina INTEGER,
    idEmpresa INTEGER,
    activa VARCHAR(6),
    CONSTRAINT fk_maquinas_empresa
        FOREIGN KEY (idEmpresa) REFERENCES tb_empresas(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tb_expediciones (
    nExpedicion INTEGER PRIMARY KEY,
    ppu VARCHAR(6),
    servicio VARCHAR(2),
    fecha DATE,
    hora TIME,
    sentido VARCHAR(3),
    validez VARCHAR(3),
    pc1 VARCHAR(6),
    pc2 VARCHAR(6),
    pc3 VARCHAR(6),
    pc4 VARCHAR(6),
    pc5 VARCHAR(6),
    pc6 VARCHAR(6),
    pc7 VARCHAR(6),
    pc8 VARCHAR(6),
    pc9 VARCHAR(6),
    pc10 VARCHAR(6),
    pc11 VARCHAR(6),
    pc12 VARCHAR(6),
    pc13 VARCHAR(6),
    pc14 VARCHAR(6),
    pc15 VARCHAR(6),
    CONSTRAINT fk_expediciones_maquina
        FOREIGN KEY (ppu) REFERENCES tb_maquinas(ppu)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tb_puntualidad (
    tipoDia VARCHAR(20),
    servicio VARCHAR(10),
    horario TIME
);

CREATE TABLE IF NOT EXISTS tb_expediciones_mensuales (
    nExpedicion INTEGER PRIMARY KEY,
    ppu VARCHAR(6),
    servicio VARCHAR(2),
    fecha DATE,
    sentido VARCHAR(3),
    validez VARCHAR(3),
    periodo VARCHAR(6),
    tipoDia VARCHAR(10),
    factor VARCHAR(3),
    bonificacion VARCHAR(3),
    CONSTRAINT fk_expediciones_mensuales_maquina
        FOREIGN KEY (ppu) REFERENCES tb_maquinas(ppu)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tb_factores (
    servicio VARCHAR(2),
    tipo VARCHAR(3),
    p5 INTEGER,
    p6 INTEGER,
    p7 INTEGER,
    p8 INTEGER,
    p9 INTEGER,
    p10 INTEGER,
    p11 INTEGER,
    p12 INTEGER,
    p13 INTEGER,
    p14 INTEGER,
    p15 INTEGER,
    p16 INTEGER,
    p17 INTEGER,
    p18 INTEGER,
    p19 INTEGER,
    p20 INTEGER,
    p21 INTEGER,
    p22 INTEGER
);

CREATE TABLE IF NOT EXISTS tb_montos (
    periodo DATE,
    perimetro INTEGER,
    compensacion INTEGER
);

CREATE TABLE IF NOT EXISTS tb_contador (
    ppu VARCHAR(6),
    idExpedicion INTEGER,
    tSalida TIMESTAMP,
    tFin TIMESTAMP,
    sentido INTEGER,
    periodo INTEGER,
    tMedicion TIMESTAMP,
    subidas INTEGER,
    bajadas INTEGER,
    cantAbordo INTEGER,
    latitud VARCHAR(15),
    longitud VARCHAR(15),
    fecha DATE,
    periodoFrec INTEGER,
    servicio VARCHAR(3),
    CONSTRAINT fk_contador_maquina
        FOREIGN KEY (ppu) REFERENCES tb_maquinas(ppu)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tb_bipay (
    ppu VARCHAR(6) NOT NULL,
    fecha DATE NOT NULL,
    cantTransaccionesN INTEGER,
    cantTransaccionesEMV INTEGER,
    usosNormales INTEGER,
    usosEMV INTEGER,
    totalTransacciones INTEGER,
    totalUsos INTEGER,
    PRIMARY KEY (ppu, fecha),
    CONSTRAINT fk_bipay_maquina
        FOREIGN KEY (ppu) REFERENCES tb_maquinas(ppu)
        ON DELETE CASCADE
);