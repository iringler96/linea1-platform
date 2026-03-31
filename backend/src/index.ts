import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import XLSX from "xlsx";
import { pool } from "./db";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta";
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

type AuthRequest = Request & {
  user?: {
    id: number;
    username: string;
    permisos: string | null;
  };
};

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      permisos: string | null;
    };

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Backend funcionando correctamente" });
});

/* LOGIN */

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM tb_usuarios WHERE username = $1",
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        permisos: user.permisos,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        correo: user.correo,
        permisos: user.permisos,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

/* USUARIOS */

app.get("/usuarios", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, correo, username, permisos FROM tb_usuarios ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

app.post("/usuarios", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { correo, username, password, permisos } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO tb_usuarios (correo, username, password, permisos)
       VALUES ($1, $2, $3, $4)
       RETURNING id, correo, username, permisos`,
      [correo, username, hashedPassword, permisos]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

app.put("/usuarios/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { correo, username, password, permisos } = req.body;

    let result;

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);

      result = await pool.query(
        `UPDATE tb_usuarios
         SET correo = $1, username = $2, password = $3, permisos = $4
         WHERE id = $5
         RETURNING id, correo, username, permisos`,
        [correo, username, hashedPassword, permisos, id]
      );
    } else {
      result = await pool.query(
        `UPDATE tb_usuarios
         SET correo = $1, username = $2, permisos = $3
         WHERE id = $4
         RETURNING id, correo, username, permisos`,
        [correo, username, permisos, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

app.delete("/usuarios/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tb_usuarios WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

/* EMPRESAS */

app.get("/empresas", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM tb_empresas ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener empresas" });
  }
});

app.post("/empresas", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { nombreempresa, propietario } = req.body;

    const result = await pool.query(
      `INSERT INTO tb_empresas (nombreempresa, propietario)
       VALUES ($1, $2)
       RETURNING *`,
      [nombreempresa, propietario || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear empresa" });
  }
});

app.put("/empresas/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombreempresa, propietario } = req.body;

    const result = await pool.query(
      `UPDATE tb_empresas
       SET nombreempresa = $1, propietario = $2
       WHERE id = $3
       RETURNING *`,
      [nombreempresa, propietario || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar empresa" });
  }
});

app.delete("/empresas/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tb_empresas WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar empresa" });
  }
});

/* MAQUINAS */

app.get("/maquinas", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tb_maquinas ORDER BY nmaquina ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener maquinas" });
  }
});

app.post("/maquinas", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ppu, anio, nmaquina, idempresa, activa } = req.body;

    const result = await pool.query(
      `INSERT INTO tb_maquinas (ppu, anio, nmaquina, idempresa, activa)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [ppu, anio || null, nmaquina || null, idempresa || null, activa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear maquina" });
  }
});

app.put("/maquinas/:ppu", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ppu } = req.params;
    const { anio, nmaquina, idempresa, activa } = req.body;

    const result = await pool.query(
      `UPDATE tb_maquinas
       SET anio = $1, nmaquina = $2, idempresa = $3, activa = $4
       WHERE ppu = $5
       RETURNING *`,
      [anio || null, nmaquina || null, idempresa || null, activa, ppu]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Máquina no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar maquina" });
  }
});

app.delete("/maquinas/:ppu", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ppu } = req.params;

    const result = await pool.query(
      `DELETE FROM tb_maquinas WHERE ppu = $1 RETURNING *`,
      [ppu]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Máquina no encontrada" });
    }

    res.json({ message: "Máquina eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar maquina" });
  }
});

/* EXPEDICIONES */

app.get("/expediciones", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ppu } = req.query;

    let result;

    if (ppu) {
      result = await pool.query(
        `SELECT * FROM tb_expediciones
         WHERE ppu = $1
         ORDER BY fecha DESC, hora DESC`,
        [ppu]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM tb_expediciones
         ORDER BY fecha DESC, hora DESC`
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener expediciones" });
  }
});

/* BIPAY CONSULTA */

app.get("/bipay", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ppu, fechaInicio, fechaFin } = req.query;

    if (!ppu) {
      return res.status(400).json({ error: "La máquina es obligatoria" });
    }

    const conditions: string[] = ["ppu = $1"];
    const values: unknown[] = [ppu];
    let idx = 2;

    if (fechaInicio) {
      conditions.push(`fecha >= $${idx++}`);
      values.push(fechaInicio);
    }

    if (fechaFin) {
      conditions.push(`fecha <= $${idx++}`);
      values.push(fechaFin);
    }

    const whereClause = conditions.join(" AND ");

    const rowsResult = await pool.query(
      `SELECT *
       FROM tb_bipay
       WHERE ${whereClause}
       ORDER BY fecha DESC`,
      values
    );

    const chartResult = await pool.query(
      `SELECT fecha::text as fecha, COALESCE(totalusos, 0) as total
       FROM tb_bipay
       WHERE ${whereClause}
       ORDER BY fecha ASC`,
      values
    );

    const summaryResult = await pool.query(
      `SELECT
          COALESCE(SUM(totalusos), 0) as total_recaudado,
          COUNT(*) as dias_con_datos
       FROM tb_bipay
       WHERE ${whereClause}`,
      values
    );

    res.json({
      summary: {
        totalRecaudado: Number(summaryResult.rows[0].total_recaudado || 0),
        diasConDatos: Number(summaryResult.rows[0].dias_con_datos || 0),
        maquina: ppu,
      },
      chart: chartResult.rows.map((row) => ({
        fecha: row.fecha,
        total: Number(row.total || 0),
      })),
      rows: rowsResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar BIPAY" });
  }
});

/* BIPAY CARGA EXCEL */

app.post(
  "/bipay/upload",
  authMiddleware,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió archivo" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      let inserted = 0;
      let updated = 0;

      for (const row of rows) {
        const fecha = row["Fecha"] ? String(row["Fecha"]).trim() : null;
        const ppu = row["Patente"] ? String(row["Patente"]).trim().toUpperCase() : null;

        if (!fecha || !ppu) continue;

        const cantTransaccionesN = Number(row["Transacciones Normales"] || 0);
        const cantTransaccionesEMV = Number(row["Transacciones EMV"] || 0);
        const usosNormales = Number(row["Usos Normales"] || 0);
        const usosEMV = Number(row["Usos EMV"] || 0);
        const totalTransacciones = Number(row["Total Transacciones"] || 0);
        const totalUsos = Number(row["Total Usos"] || 0);

        const exists = await pool.query(
          `SELECT 1 FROM tb_bipay WHERE ppu = $1 AND fecha = $2`,
          [ppu, fecha]
        );

        if (exists.rows.length > 0) {
          await pool.query(
            `UPDATE tb_bipay
             SET canttransaccionesn = $3,
                 canttransaccionesemv = $4,
                 usosnormales = $5,
                 usosemv = $6,
                 totaltransacciones = $7,
                 totalusos = $8
             WHERE ppu = $1 AND fecha = $2`,
            [
              ppu,
              fecha,
              cantTransaccionesN,
              cantTransaccionesEMV,
              usosNormales,
              usosEMV,
              totalTransacciones,
              totalUsos,
            ]
          );
          updated++;
        } else {
          await pool.query(
            `INSERT INTO tb_bipay
              (ppu, fecha, canttransaccionesn, canttransaccionesemv, usosnormales, usosemv, totaltransacciones, totalusos)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              ppu,
              fecha,
              cantTransaccionesN,
              cantTransaccionesEMV,
              usosNormales,
              usosEMV,
              totalTransacciones,
              totalUsos,
            ]
          );
          inserted++;
        }
      }

      res.json({
        message: "Archivo BIPAY procesado correctamente",
        inserted,
        updated,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al procesar el archivo Excel" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});