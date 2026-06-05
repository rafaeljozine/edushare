import { Router } from "express";
import  pool  from "./db";
import bcrypt from "bcrypt";

import multer from "multer";
import path from "path";
import crypto from "crypto";
import { enviarCodigoRecuperacao } from "./email";

const router = Router();

const emailValido = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

const normalizarEmail = (email: string) =>
  String(email || "").trim().toLowerCase();

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, "uploads");

  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );

  }

});

const upload = multer({
  storage
});

router.post("/register", async (req, res) => {

  try {

    const {
            nome,
            email,
            senha,
            curso,
            role
            } = req.body;

    const emailNormalizado = normalizarEmail(email);

    if (!String(nome || "").trim() || !emailValido(emailNormalizado) || !curso || String(senha || "").length < 6) {
      return res.status(400).json({
        erro: "Informe nome, e-mail válido, curso e uma senha com pelo menos 6 caracteres"
      });
    }

    let roleFinal = "USER";

    if (role === "ADMIN") {
      const adminExiste = await pool.query(
        "SELECT id FROM users WHERE role='ADMIN' LIMIT 1"
      );

      if (adminExiste.rows.length > 0) {
        return res.status(403).json({ erro: "A criação pública de administradores não é permitida" });
      }

      roleFinal = "ADMIN";
    }

    const userExiste = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [emailNormalizado]
    );

    if (userExiste.rows.length > 0) {

      return res.status(400).json({
        erro: "Email já existe"
      });

    }

    const senhaHash = await bcrypt.hash(
      senha,
      10
    );

    const resultado = await pool.query(
  `
  INSERT INTO users
  (nome, email, senha, curso, role)
  VALUES($1, $2, $3, $4, $5)

  RETURNING
  id,
  nome,
  email,
  curso,
  role
  `,
  [String(nome).trim(), emailNormalizado, senhaHash, curso, roleFinal]
);

    res.json(resultado.rows[0]);

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro interno"
    });

  }

});

router.post("/login", async (req, res) => {

  try {

    const { email, senha } = req.body;
    const emailNormalizado = normalizarEmail(email);

    const resultado = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [emailNormalizado]
    );

    if (resultado.rows.length === 0) {

      return res.status(400).json({
        erro: "Utilizador não encontrado"
      });

    }

    const user = resultado.rows[0];

    if (
        user.status ===
        "BLOQUEADO"
      ) {

        return res.status(403).json({
          erro:
            "Conta bloqueada"
        });

      }

    const senhaCorreta = await bcrypt.compare(
      senha,
      user.senha
    );

    if (!senhaCorreta) {

      return res.status(400).json({
        erro: "Senha incorreta"
      });

    }

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      curso: user.curso,
      role: user.role
    });

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro interno"
    });

  }

});

router.post("/password/forgot", async (req, res) => {
  try {
    const email = normalizarEmail(req.body.email);

    if (!emailValido(email)) {
      return res.status(400).json({ erro: "Informe um e-mail válido" });
    }

    const resultado = await pool.query(
      "SELECT id, nome, email FROM users WHERE email=$1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.json({ mensagem: "Se o e-mail estiver registado, receberá um código de confirmação" });
    }

    const user = resultado.rows[0];
    const codigo = crypto.randomInt(100000, 1000000).toString();
    const codigoHash = await bcrypt.hash(codigo, 10);

    await pool.query(
      "UPDATE password_reset_codes SET used_at=NOW() WHERE user_id=$1 AND used_at IS NULL",
      [user.id]
    );

    await pool.query(
      `INSERT INTO password_reset_codes (user_id, code_hash, expires_at)
       VALUES($1, $2, NOW() + INTERVAL '10 minutes')`,
      [user.id, codigoHash]
    );

    await enviarCodigoRecuperacao(user.email, user.nome, codigo);

    res.json({ mensagem: "Código enviado. Verifique o seu e-mail" });
  } catch (erro) {
    console.log(erro);
    const mensagem = erro instanceof Error && erro.message === "SMTP_NOT_CONFIGURED"
      ? "O envio de e-mail ainda não está configurado no servidor"
      : "Não foi possível enviar o código";
    res.status(500).json({ erro: mensagem });
  }
});

router.post("/password/reset", async (req, res) => {
  try {
    const email = normalizarEmail(req.body.email);
    const codigo = String(req.body.codigo || "").trim();
    const novaSenha = String(req.body.novaSenha || "");

    if (!emailValido(email) || !/^\d{6}$/.test(codigo) || novaSenha.length < 6) {
      return res.status(400).json({ erro: "Dados de recuperação inválidos" });
    }

    const resultado = await pool.query(
      `SELECT prc.id, prc.code_hash, prc.expires_at, u.id AS user_id
       FROM password_reset_codes prc
       JOIN users u ON u.id=prc.user_id
       WHERE u.email=$1 AND prc.used_at IS NULL
       ORDER BY prc.created_at DESC LIMIT 1`,
      [email]
    );

    const reset = resultado.rows[0];
    if (!reset || new Date(reset.expires_at) < new Date() || !(await bcrypt.compare(codigo, reset.code_hash))) {
      return res.status(400).json({ erro: "Código inválido ou expirado" });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("UPDATE users SET senha=$1 WHERE id=$2", [senhaHash, reset.user_id]);
      await client.query("UPDATE password_reset_codes SET used_at=NOW() WHERE id=$1", [reset.id]);
      await client.query("COMMIT");
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    } finally {
      client.release();
    }

    res.json({ mensagem: "Senha atualizada com sucesso" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Não foi possível atualizar a senha" });
  }
});

router.get("/recursos", async (_, res) => {

  try {

    const resultado = await pool.query(
      "SELECT * FROM recursos ORDER BY id DESC"
    );

    res.json(resultado.rows);

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro interno"
    });

  }

});

router.post(
  "/recursos",
  upload.single("arquivo"),
  async (req, res) => {

    try {

      console.log("========== NOVO UPLOAD ==========");

      console.log("BODY:");
      console.log(req.body);

      console.log("FILE:");
      console.log(req.file);

      const {
        nome,
        autor,
        disciplina,
        descricao,
        curso,
        user_id,
        visibilidade,
        status
      } = req.body;

      const ficheiro = req.file?.filename;

      console.log("FICHEIRO GRAVADO:");
      console.log(ficheiro);

      const resultado = await pool.query(
        `
        INSERT INTO recursos
        (
          nome,
          autor,
          disciplina,
          descricao,
          curso,
          ficheiro,
          user_id,
          visibilidade,
          status
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        RETURNING *
        `,
        [
          nome,
          autor,
          disciplina,
          descricao,
          curso,
          ficheiro,
          user_id,
          visibilidade,
          status
        ]
      );

      console.log("REGISTO INSERIDO:");
      console.log(resultado.rows[0]);

      res.json(resultado.rows[0]);

    } catch (erro) {

      console.log(
        "ERRO AO INSERIR RECURSO:"
      );

      console.log(erro);

      res.status(500).json({
        erro: "Erro interno"
      });

    }

  }
);

router.put("/recursos/:id/requisitar", async (req, res) => {

  try {

    await pool.query(
      `
      UPDATE recursos
      SET estado='REQUISITADO'
      WHERE id=$1
      `,
      [req.params.id]
    );

    res.json({
      mensagem: "Recurso requisitado"
    });

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro interno"
    });

  }

});

router.put("/recursos/:id/devolver", async (req, res) => {

  try {

    await pool.query(
      `
      UPDATE recursos
      SET estado='DISPONIVEL'
      WHERE id=$1
      `,
      [req.params.id]
    );

    res.json({
      mensagem: "Recurso devolvido"
    });

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro interno"
    });

  }

});

router.put(
  "/recursos/:id/desativar",
  async (req, res) => {

    try {

      await pool.query(
        `
        UPDATE recursos
        SET status='INDISPONIVEL'
        WHERE id=$1
        `,
        [req.params.id]
      );

      res.json({
        mensagem: "Material desativado"
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro: "Erro interno"
      });

    }

  }
);

router.put(
  "/recursos/:id/ativar",
  async (req, res) => {

    try {

      await pool.query(
        `
        UPDATE recursos
        SET status='DISPONIVEL'
        WHERE id=$1
        `,
        [req.params.id]
      );

      res.json({
        mensagem: "Material ativado"
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro: "Erro interno"
      });

    }

  }
);

router.put(
  "/recursos/:id/favorito",

  async (req, res) => {

    try {

      await pool.query(
        `
        UPDATE recursos
        SET favoritos =
        COALESCE(favoritos, 0) + 1
        WHERE id=$1
        `,
        [req.params.id]
      );

      res.json({
        mensagem:
          "Favoritado"
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro interno"
      });

    }

  }
);

router.put(
  "/recursos/:id",

  async (req, res) => {

    try {

      const {
        nome,
        autor,
        disciplina,
        descricao,
        curso,
        visibilidade
      } = req.body;

      await pool.query(
        `
        UPDATE recursos
        SET
        nome=$1,
        autor=$2,
        disciplina=$3,
        descricao=$4,
        curso=$5,
        visibilidade=$6
        WHERE id=$7
        `,
        [
          nome,
          autor,
          disciplina,
          descricao,
          curso,
          visibilidade,
          req.params.id
        ]
      );

      res.json({
        mensagem:
          "Atualizado"
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro interno"
      });

    }

  }
);
router.delete(
  "/recursos/:id",
  async (req, res) => {

    try {

      await pool.query(
        "DELETE FROM recursos WHERE id = $1",
        [req.params.id]
      );

      res.json({
        sucesso: true
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro: "Erro interno"
      });

    }

  }
);
router.delete(
  "/users/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      await pool.query(
        "DELETE FROM favoritos WHERE user_id = $1",
        [id]
      );

      await pool.query(
        "DELETE FROM recursos WHERE user_id = $1",
        [id]
      );

      await pool.query(
        "DELETE FROM users WHERE id = $1",
        [id]
      );

      res.json({
        sucesso: true
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro: "Erro ao eliminar utilizador"
      });

    }

  }
);

router.put(
  "/recursos/:id/visibilidade",

  async (req, res) => {

    try {

      const {
        visibilidade
      } = req.body;

      await pool.query(
        `
        UPDATE recursos
        SET visibilidade=$1
        WHERE id=$2
        `,
        [
          visibilidade,
          req.params.id
        ]
      );

      res.json({
        mensagem:
          "Visibilidade alterada"
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro interno"
      });

    }

  }
);

router.post(
  "/favoritos",

  async (req, res) => {

    try {

      const {
        user_id,
        recurso_id
      } = req.body;

      const existe =
        await pool.query(
          `
          SELECT *
          FROM favoritos
          WHERE
          user_id=$1
          AND recurso_id=$2
          `,
          [
            user_id,
            recurso_id
          ]
        );

      if (
        existe.rows.length > 0
      ) {

        await pool.query(
          `
          DELETE FROM favoritos
          WHERE
          user_id=$1
          AND recurso_id=$2
          `,
          [
            user_id,
            recurso_id
          ]
        );

        return res.json({
          favorito: false
        });

      }

      await pool.query(
        `
        INSERT INTO favoritos
        (
          user_id,
          recurso_id
        )
        VALUES($1, $2)
        `,
        [
          user_id,
          recurso_id
        ]
      );

      res.json({
        favorito: true
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro interno"
      });

    }

  }
);

router.get(
  "/favoritos/:userId",

  async (req, res) => {

    try {

      const resultado =
        await pool.query(
          `
          SELECT recurso_id
          FROM favoritos
          WHERE user_id=$1
          `,
          [
            req.params.userId
          ]
        );

      res.json(
        resultado.rows
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro interno"
      });

    }

  }
);

router.get(
  "/verificar-admin",

  async (req, res) => {

    try {

      const resultado =
        await pool.query(
          `
          SELECT *
          FROM users
          WHERE role='ADMIN'
          LIMIT 1
          `
        );

      res.json({
        existeAdmin:
          resultado.rows.length > 0
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro interno"
      });

    }

  }
);

router.get(
  "/users",

  async (
    req,
    res
  ) => {

    try {

      const resultado =
        await pool.query(
          `
          SELECT
            id,
            nome,
            email,
            curso,
            role,
            status
          FROM users
          ORDER BY id DESC
          `
        );

      res.json(
        resultado.rows
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro ao buscar utilizadores"
      });

    }

  }
);

router.put("/users/:id", async (req, res) => {
  try {
    const { nome, email, curso, role, status } = req.body;
    const emailNormalizado = normalizarEmail(email);

    if (!String(nome || "").trim() || !emailValido(emailNormalizado) || !curso) {
      return res.status(400).json({ erro: "Nome, e-mail válido e curso são obrigatórios" });
    }

    if (!["USER", "ADMIN"].includes(role) || !["ATIVO", "BLOQUEADO"].includes(status)) {
      return res.status(400).json({ erro: "Perfil ou estado inválido" });
    }

    const resultado = await pool.query(
      `UPDATE users SET nome=$1, email=$2, curso=$3, role=$4, status=$5
       WHERE id=$6 RETURNING id, nome, email, curso, role, status`,
      [String(nome).trim(), emailNormalizado, curso, role, status, req.params.id]
    );

    if (!resultado.rows[0]) {
      return res.status(404).json({ erro: "Utilizador não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro: any) {
    console.log(erro);
    res.status(erro?.code === "23505" ? 409 : 500).json({
      erro: erro?.code === "23505" ? "Este e-mail já está em uso" : "Erro ao atualizar utilizador"
    });
  }
});

router.put("/recursos/:id/admin", async (req, res) => {
  try {
    const { nome, autor, disciplina, descricao, curso, visibilidade, status, estado } = req.body;

    if (!nome || !autor || !disciplina || !curso ||
        !["PUBLICO", "PRIVADO"].includes(visibilidade) ||
        !["DISPONIVEL", "INDISPONIVEL"].includes(status)) {
      return res.status(400).json({ erro: "Dados do material inválidos" });
    }

    const resultado = await pool.query(
      `UPDATE recursos SET nome=$1, autor=$2, disciplina=$3, descricao=$4, curso=$5,
       visibilidade=$6, status=$7, estado=$8 WHERE id=$9 RETURNING *`,
      [nome, autor, disciplina, descricao || "", curso, visibilidade, status, estado || "DISPONIVEL", req.params.id]
    );

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao atualizar material" });
  }
});

router.put(
  "/users/:id/bloquear",

  async (req, res) => {

    try {

      await pool.query(
        `
        UPDATE users
        SET status = 'BLOQUEADO'
        WHERE id = $1
        `,
        [req.params.id]
      );

      res.json({
        sucesso: true
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro ao bloquear"
      });

    }

  }
);

router.put(
  "/users/:id/desbloquear",

  async (req, res) => {

    try {

      await pool.query(
        `
        UPDATE users
        SET status = 'ATIVO'
        WHERE id = $1
        `,
        [req.params.id]
      );

      res.json({
        sucesso: true
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro:
          "Erro ao desbloquear"
      });

    }

  }
);


router.put(
  "/recursos/:id/download",

  async (req, res) => {

    try {

      await pool.query(
        `
        UPDATE recursos
        SET downloads =
        COALESCE(downloads, 0) + 1
        WHERE id = $1
        `,
        [req.params.id]
      );

      res.json({
        sucesso: true
      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json({
        erro: "Erro interno"
      });

    }

  }
);

export default router;
