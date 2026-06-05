import express from "express";
import cors from "cors";
import routes from "./routes";
import path from "path";
import { inicializarBanco } from "./initDb";

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

app.use(routes);

inicializarBanco()
  .then(() => {
    app.listen(3000, () => {
      console.log("Servidor rodando na porta 3000");
    });
  })
  .catch((erro) => {
    console.error("Erro ao inicializar banco:", erro);
    process.exit(1);
  });
