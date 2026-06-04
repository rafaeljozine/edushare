import { Router } from "express";
import  pool  from "./db";
import bcrypt from "bcrypt";

import multer from "multer";
import path from "path";

const router = Router();

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
            ano,
            role
            } = req.body;

    const userExiste = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
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
  (nome, email, senha, curso, ano, role)
  VALUES($1, $2, $3, $4, $5, $6)

  RETURNING
  id,
  nome,
  email,
  curso,
  ano,
  role
  `,
  [nome, email,senhaHash, curso, ano, role || "USER"]
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

    const resultado = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
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
      ano: user.ano,
      role: user.role
    });

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro interno"
    });

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

      const {
        nome,
        disciplina,
        descricao,
        curso
      } = req.body;

      const ficheiro =
        req.file?.filename;

      const user_id =
        req.body.user_id;

      const resultado =
        await pool.query(
          `
          INSERT INTO recursos
          (
            nome,
            descricao,
            ficheiro,
            curso,
            disciplina,
            user_id
          )
          VALUES($1,$2,$3,$4,$5,$6)
          RETURNING *
          `,
          [
            nome,
            descricao,
            ficheiro,
            curso,
            disciplina,
            user_id
          ]
        );

      res.json(
        resultado.rows[0]
      );

    } catch (erro) {

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
            ano,
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


router.delete(
  "/users/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      await pool.query(
        `
        DELETE FROM users
        WHERE id = $1
        `,
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

export default router;