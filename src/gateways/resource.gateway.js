import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

export async function insertResource({
  title,
  description,
  datePublication,
  isActive = true,
  filePath,
  idStudent,
  idCategory,
  idDirector,
  idRevisor1,
  idRevisor2,
}) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO Resource
       (title, description, datePublication, isActive, filePath,
        idStudent, idCategory, idDirector, idRevisor1, idRevisor2)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        datePublication,
        Number(isActive) ? 1 : 0,
        filePath,
        idStudent,
        idCategory,
        idDirector,
        idRevisor1,
        idRevisor2,
      ]
    );

    const [rows] = await conn.query(
      `SELECT idResource, title, description, datePublication, isActive,
              filePath, idStudent, idCategory, idDirector, idRevisor1, idRevisor2
       FROM   Resource
       WHERE  idResource = ?`,
      [result.insertId]
    );

    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function selectAllResources() {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idResource, title, description, datePublication, isActive, filePath, idStudent, idCategory, idDirector, idRevisor1, idRevisor2
       FROM Resource`
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function selectResourceById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idResource, title, description, datePublication, isActive, filePath, idStudent, idCategory, idDirector, idRevisor1, idRevisor2
       FROM Resource
       WHERE idResource = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function updateResourceById(id, fieldsToUpdate) {
  const conn = await openConnection();
  try {
    const fields = [];
    const params = [];
    //! Construir dinámicamente SET ... = ?
    for (const [key, val] of Object.entries(fieldsToUpdate)) {
      fields.push(`${key} = ?`);
      params.push(val);
    }
    if (fields.length === 0) return await selectResourceById(id);
    params.push(id);
    const [result] = await conn.query(
      `UPDATE Resource
       SET ${fields.join(", ")}
       WHERE idResource = ?`,
      params
    );
    if (result.affectedRows === 0) return null;
    return await selectResourceById(id);
  } finally {
    closeConnection(conn);
  }
}

export async function deleteResourceById(id) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `DELETE FROM Resource
       WHERE idResource = ?`,
      [id]
    );
    return result.affectedRows > 0;
  } finally {
    closeConnection(conn);
  }
}

export async function getFacultyAndCareerByResource(idResource) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT f.idFaculty, f.name AS facultyName,
              c.idCareer, c.name AS careerName
       FROM Resource r
       JOIN Student s ON r.idStudent = s.idStudent
       JOIN Career c ON s.idCareer = c.idCareer
       JOIN Faculty f ON c.idFaculty = f.idFaculty
       WHERE r.idResource = ?`,
      [idResource]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}
