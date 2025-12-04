import { query } from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});

export const uploader = multer({ storage });

export const uploadArchivoPaciente = async (req, res) => {
  try {
    const { id } = req.params; // paciente id
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Archivo requerido' });
    const { rows } = await query(
      `INSERT INTO archivos_adjuntos (paciente_id, nombre, ruta, mime_type, subido_en)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING id, paciente_id, nombre, mime_type, subido_en`,
      [id, file.originalname, file.path, file.mimetype]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('uploadArchivoPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al subir archivo' });
  }
};

export const deleteArchivo = async (req, res) => {
  try {
    const { id } = req.params; // archivo id
    const { rows } = await query('DELETE FROM archivos_adjuntos WHERE id = $1 RETURNING ruta', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Archivo no encontrado' });
    const ruta = rows[0].ruta;
    if (ruta && fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
    }
    return res.status(204).send();
  } catch (err) {
    console.error('deleteArchivo error', err);
    return res.status(500).json({ success: false, message: 'Error al eliminar archivo' });
  }
};
