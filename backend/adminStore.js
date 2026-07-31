const { Pool } = require("pg");

const STATUS_VALUES = new Set(["pending", "complete"]);
const TERM_VALUES = new Set(["T1", "T3"]);

const COURSE_SEED = [
  { subjectCode: "DTECH", courseCode: "JDTECH", courseName: "Junior Digital Tech" },
  { subjectCode: "DTECH", courseCode: "MDTECH-S1", courseName: "Middle Digital Tech Semester 1" },
  { subjectCode: "DTECH", courseCode: "MDTECH-S2", courseName: "Middle Digital Tech Semester 2" },
  { subjectCode: "DTECH", courseCode: "11DTECH", courseName: "Year 11 Digital Tech" },
  { subjectCode: "DTECH", courseCode: "12DTECH", courseName: "Year 12 Digital Tech" },
  { subjectCode: "DTECH", courseCode: "13DTECH", courseName: "Year 13 Digital Tech" },
  { subjectCode: "DVC", courseCode: "JDVC", courseName: "Junior DVC" },
  { subjectCode: "DVC", courseCode: "MDVC-S1", courseName: "Middle DVC Semester 1" },
  { subjectCode: "DVC", courseCode: "MDVC-S2", courseName: "Middle DVC Semester 2" },
  { subjectCode: "DVC", courseCode: "11DVC", courseName: "Year 11 DVC" },
  { subjectCode: "DVC", courseCode: "12DVC", courseName: "Year 12 DVC" },
  { subjectCode: "DVC", courseCode: "13DVC", courseName: "Year 13 DVC" },
  { subjectCode: "FOOD", courseCode: "JFOOD", courseName: "Junior Food" },
  { subjectCode: "FOOD", courseCode: "MFOOD-S1", courseName: "Middle Food Semester 1" },
  { subjectCode: "FOOD", courseCode: "MFOOD-S2", courseName: "Middle Food Semester 2" },
  { subjectCode: "FOOD", courseCode: "11HOSP", courseName: "Year 11 Hospitality" },
  { subjectCode: "FOOD", courseCode: "12HOSP", courseName: "Year 12 Hospitality" },
  { subjectCode: "FOOD", courseCode: "13HOSP", courseName: "Year 13 Hospitality" },
  { subjectCode: "TEXTILES", courseCode: "JTEXT", courseName: "Junior Textiles" },
  { subjectCode: "TEXTILES", courseCode: "MTEXT-S1", courseName: "Middle Textiles Semester 1" },
  { subjectCode: "TEXTILES", courseCode: "MTEXT-S2", courseName: "Middle Textiles Semester 2" },
  { subjectCode: "TEXTILES", courseCode: "11TEXT", courseName: "Year 11 Textiles" },
  { subjectCode: "TEXTILES", courseCode: "12TEXT", courseName: "Year 12 Textiles" },
  { subjectCode: "TEXTILES", courseCode: "13TEXT", courseName: "Year 13 Textiles" },
  { subjectCode: "WOOD", courseCode: "JWOOD", courseName: "Junior Wood" },
  { subjectCode: "WOOD", courseCode: "MWOOD-S1", courseName: "Middle Wood Semester 1" },
  { subjectCode: "WOOD", courseCode: "MWOOD-S2", courseName: "Middle Wood Semester 2" },
  { subjectCode: "WOOD", courseCode: "11FURN", courseName: "Year 11 Furniture" },
  { subjectCode: "WOOD", courseCode: "12FURN", courseName: "Year 12 Furniture" },
  { subjectCode: "WOOD", courseCode: "13FURN", courseName: "Year 13 Furniture" }
];

let pool = null;
let initialized = false;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    const useSsl = process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false };

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl
    });
  }

  return pool;
}

async function query(text, values = []) {
  const db = getPool();

  if (!db) {
    throw new Error("DATABASE_URL is not configured");
  }

  return db.query(text, values);
}

async function initAdminSchema() {
  if (initialized || !getPool()) {
    return;
  }

  await query(`
    CREATE TABLE IF NOT EXISTS admin_subjects (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_courses (
      id SERIAL PRIMARY KEY,
      subject_code TEXT NOT NULL REFERENCES admin_subjects(code) ON DELETE CASCADE,
      course_code TEXT NOT NULL UNIQUE,
      course_name TEXT NOT NULL,
      owner_name TEXT,
      owner_email TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS admin_term_requirements (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES admin_courses(id) ON DELETE CASCADE,
      school_year INTEGER NOT NULL,
      school_term TEXT NOT NULL CHECK (school_term IN ('T1', 'T3')),
      outline_status TEXT NOT NULL DEFAULT 'pending' CHECK (outline_status IN ('pending', 'complete')),
      statement_status TEXT NOT NULL DEFAULT 'pending' CHECK (statement_status IN ('pending', 'complete')),
      outline_updated_at TIMESTAMPTZ,
      statement_updated_at TIMESTAMPTZ,
      updated_by TEXT,
      notes TEXT,
      UNIQUE(course_id, school_year, school_term)
    );

    CREATE TABLE IF NOT EXISTS admin_reminder_logs (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES admin_courses(id) ON DELETE SET NULL,
      school_year INTEGER NOT NULL,
      school_term TEXT NOT NULL CHECK (school_term IN ('T1', 'T3')),
      recipient_email TEXT NOT NULL,
      subject_line TEXT NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'queued',
      message TEXT
    );
  `);

  await seedSubjectsAndCourses();
  await seedDefaultTermRequirements(new Date().getUTCFullYear());
  initialized = true;
}

async function seedSubjectsAndCourses() {
  const subjectNames = {
    DTECH: "Digital Technologies",
    DVC: "Design and Visual Communication",
    FOOD: "Food and Hospitality",
    TEXTILES: "Textiles",
    WOOD: "Woodwork and Furniture"
  };

  for (const [code, name] of Object.entries(subjectNames)) {
    await query(
      `
        INSERT INTO admin_subjects (code, name)
        VALUES ($1, $2)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      `,
      [code, name]
    );
  }

  for (const course of COURSE_SEED) {
    await query(
      `
        INSERT INTO admin_courses (subject_code, course_code, course_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (course_code) DO UPDATE
        SET subject_code = EXCLUDED.subject_code,
            course_name = EXCLUDED.course_name
      `,
      [course.subjectCode, course.courseCode, course.courseName]
    );
  }
}

async function seedDefaultTermRequirements(year) {
  await query(
    `
      INSERT INTO admin_term_requirements (course_id, school_year, school_term)
      SELECT c.id, $1, term_value
      FROM admin_courses c
      CROSS JOIN (VALUES ('T1'), ('T3')) AS t(term_value)
      WHERE c.is_active = true
      ON CONFLICT (course_id, school_year, school_term) DO NOTHING
    `,
    [year]
  );
}

function normalizeTerm(term) {
  const normalized = String(term || "").toUpperCase();
  return TERM_VALUES.has(normalized) ? normalized : null;
}

function normalizeStatus(status) {
  const normalized = String(status || "").toLowerCase();
  return STATUS_VALUES.has(normalized) ? normalized : null;
}

async function getDashboard({ year, term }) {
  const safeYear = Number.isInteger(year) ? year : new Date().getUTCFullYear();
  const safeTerm = normalizeTerm(term) || "T1";

  await seedDefaultTermRequirements(safeYear);

  const summaryResult = await query(
    `
      SELECT
        COUNT(*)::INT AS total_courses,
        COUNT(*) FILTER (WHERE r.outline_status = 'complete')::INT AS outline_complete,
        COUNT(*) FILTER (WHERE r.statement_status = 'complete')::INT AS statement_complete,
        COUNT(*) FILTER (WHERE r.outline_status = 'complete' AND r.statement_status = 'complete')::INT AS fully_complete,
        COUNT(*) FILTER (WHERE r.outline_status <> 'complete')::INT AS missing_outline,
        COUNT(*) FILTER (WHERE r.statement_status <> 'complete')::INT AS missing_statement
      FROM admin_term_requirements r
      JOIN admin_courses c ON c.id = r.course_id
      WHERE r.school_year = $1
        AND r.school_term = $2
        AND c.is_active = true
    `,
    [safeYear, safeTerm]
  );

  const subjectResult = await query(
    `
      SELECT
        s.code,
        s.name,
        COUNT(*)::INT AS total_courses,
        COUNT(*) FILTER (WHERE r.outline_status = 'complete' AND r.statement_status = 'complete')::INT AS fully_complete,
        COUNT(*) FILTER (WHERE r.outline_status <> 'complete' OR r.statement_status <> 'complete')::INT AS still_required
      FROM admin_term_requirements r
      JOIN admin_courses c ON c.id = r.course_id
      JOIN admin_subjects s ON s.code = c.subject_code
      WHERE r.school_year = $1
        AND r.school_term = $2
        AND c.is_active = true
      GROUP BY s.code, s.name
      ORDER BY s.code
    `,
    [safeYear, safeTerm]
  );

  return {
    year: safeYear,
    term: safeTerm,
    summary: summaryResult.rows[0],
    subjects: subjectResult.rows
  };
}

async function getCourseStatus({ year, term, subject, status }) {
  const safeYear = Number.isInteger(year) ? year : new Date().getUTCFullYear();
  const safeTerm = normalizeTerm(term) || "T1";
  const safeSubject = subject ? String(subject).toUpperCase() : null;
  const safeStatus = status ? String(status).toLowerCase() : null;

  await seedDefaultTermRequirements(safeYear);

  const courseResult = await query(
    `
      SELECT
        c.course_code,
        c.course_name,
        c.subject_code,
        s.name AS subject_name,
        r.outline_status,
        r.statement_status,
        r.outline_updated_at,
        r.statement_updated_at,
        r.updated_by,
        r.notes,
        CASE
          WHEN r.outline_status = 'complete' AND r.statement_status = 'complete' THEN 'green'
          WHEN r.outline_status = 'complete' OR r.statement_status = 'complete' THEN 'amber'
          ELSE 'red'
        END AS dashboard_status
      FROM admin_term_requirements r
      JOIN admin_courses c ON c.id = r.course_id
      JOIN admin_subjects s ON s.code = c.subject_code
      WHERE r.school_year = $1
        AND r.school_term = $2
        AND c.is_active = true
        AND ($3::TEXT IS NULL OR c.subject_code = $3)
      ORDER BY c.subject_code, c.course_code
    `,
    [safeYear, safeTerm, safeSubject]
  );

  let rows = courseResult.rows;
  if (["red", "amber", "green"].includes(safeStatus)) {
    rows = rows.filter((row) => row.dashboard_status === safeStatus);
  }

  return {
    year: safeYear,
    term: safeTerm,
    subject: safeSubject,
    status: safeStatus,
    courses: rows
  };
}

async function updateCourseRequirement(payload) {
  const safeCourseCode = String(payload.courseCode || "").toUpperCase();
  const safeYear = Number.parseInt(payload.year, 10);
  const safeTerm = normalizeTerm(payload.term);
  const outlineStatus = normalizeStatus(payload.outlineStatus);
  const statementStatus = normalizeStatus(payload.statementStatus);

  if (!safeCourseCode || !Number.isInteger(safeYear) || !safeTerm) {
    throw new Error("courseCode, year, and term are required");
  }

  if (!outlineStatus && !statementStatus && payload.notes === undefined) {
    throw new Error("No updates provided");
  }

  const currentResult = await query(
    `
      SELECT r.id, r.outline_status, r.statement_status
      FROM admin_term_requirements r
      JOIN admin_courses c ON c.id = r.course_id
      WHERE c.course_code = $1
        AND r.school_year = $2
        AND r.school_term = $3
      LIMIT 1
    `,
    [safeCourseCode, safeYear, safeTerm]
  );

  if (!currentResult.rows.length) {
    throw new Error("Course requirement row not found");
  }

  const current = currentResult.rows[0];
  const nextOutline = outlineStatus || current.outline_status;
  const nextStatement = statementStatus || current.statement_status;

  await query(
    `
      UPDATE admin_term_requirements
      SET outline_status = $2,
          statement_status = $3,
          outline_updated_at = CASE
            WHEN $2 = 'complete' AND outline_status <> 'complete' THEN NOW()
            ELSE outline_updated_at
          END,
          statement_updated_at = CASE
            WHEN $3 = 'complete' AND statement_status <> 'complete' THEN NOW()
            ELSE statement_updated_at
          END,
          updated_by = COALESCE($4, updated_by),
          notes = COALESCE($5, notes)
      WHERE id = $1
    `,
    [current.id, nextOutline, nextStatement, payload.updatedBy || null, payload.notes || null]
  );

  return {
    ok: true,
    courseCode: safeCourseCode,
    year: safeYear,
    term: safeTerm,
    outlineStatus: nextOutline,
    statementStatus: nextStatement
  };
}

module.exports = {
  getPool,
  initAdminSchema,
  getDashboard,
  getCourseStatus,
  updateCourseRequirement
};
