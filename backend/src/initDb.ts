import pool from "./db";

export async function inicializarBanco() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cursos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT NOT NULL DEFAULT '',
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    INSERT INTO cursos (nome)
    SELECT DISTINCT curso FROM users WHERE curso IS NOT NULL AND TRIM(curso) <> ''
    ON CONFLICT (nome) DO NOTHING
  `);

  await pool.query(`
    INSERT INTO cursos (nome)
    SELECT DISTINCT curso FROM recursos WHERE curso IS NOT NULL AND TRIM(curso) <> ''
    ON CONFLICT (nome) DO NOTHING
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comentarios (
      id SERIAL PRIMARY KEY,
      recurso_id INTEGER NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      texto TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    DELETE FROM favoritos f
    USING recursos r
    WHERE f.recurso_id=r.id AND f.user_id=r.user_id
  `);

  await pool.query("ALTER TABLE users ALTER COLUMN ano DROP NOT NULL");
}
