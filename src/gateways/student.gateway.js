import {
  openConnection,
  closeConnection,
} from "../../config/databases/mysql.js";

export async function insertStudent({ name, isActive, idCareer }) {
  const conn = await openConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO Student (name, isActive, idCareer)
        VALUES (?, ?, ?)`,
      [name, isActive, idCareer]
    );
    const insertId = result.insertId;
    const [rows] = await conn.query(
      `SELECT idStudent, name, isActive, idCareer
        FROM Student
        WHERE idStudent = ?`,
      [insertId]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function selectAllStudents() {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idStudent, name, isActive, idCareer
        FROM Student`
    );
    return rows;
  } finally {
    closeConnection(conn);
  }
}

export async function selectStudentById(id) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idStudent, name, isActive, idCareer
            FROM Student
            WHERE idStudent = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}

export async function updateStudentById(id, { name, isActive, idCareer }) {
  const conn = await openConnection();
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name);
    }
    if (isActive !== undefined) {
      fields.push("isActive = ?");
      params.push(isActive);
    }
    if (idCareer !== undefined) {
      fields.push("idCareer = ?");
      params.push(idCareer);
    }
    if (!fields.length) return await selectStudentById(id);
    params.push(id);
    const [result] = await conn.query(
      `UPDATE Student SET ${fields.join(", ")} WHERE idStudent = ?`,
      params
    );
    if (result.affectedRows === 0) return null;
    return await selectStudentById(id);
  } finally {
    closeConnection(conn);
  }
}
export async function deleteStudentById(id) {
  const conn = await openConnection();
  try {
    const student = await selectStudentById(id);

    if (!student) return null;

    await conn.query(`DELETE FROM Student WHERE idStudent = ?`, [id]);
    return student;
  } finally {
    closeConnection(conn);
  }
}

export async function getFacultyAndCareerByStudent(idStudent) {
  const conn = await openConnection();
  try {
    const [rows] = await conn.query(
      `SELECT f.idFaculty, f.name AS facultyName,
              c.idCareer, c.name AS careerName
        FROM Student s
        JOIN Career c ON s.idCareer = c.idCareer
        JOIN Faculty f ON c.idFaculty = f.idFaculty
        WHERE s.idStudent = ?`,
      [idStudent]
    );
    return rows[0] || null;
  } finally {
    closeConnection(conn);
  }
}
