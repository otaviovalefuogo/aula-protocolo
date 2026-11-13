const https = require("node:https");
const fs = require("node:fs");

const PORT = 3000;

// Carrega os certificados SSL gerados pelo mkcert
const options = {
  key: fs.readFileSync("./certs/server-key.pem"),
  cert: fs.readFileSync("./certs/server-cert.pem"),
};

// Mock de dados
const alunos = [
  { id: 1, nome: "Ana", curso: "Ciência da Computação" },
  { id: 2, nome: "Carlos", curso: "Ciência da Computação" },
  { id: 3, nome: "Maria", curso: "Sistemas de Informação" },
];

const server = https.createServer(options, (req, res) => {
  // Configurações CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Tratamento de requisições preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const { pathname } = new URL(
    req.url,
    `https://${req.headers.host}`
  );
  

  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  // GET /
  if (req.method === "GET" && pathname === "/") {
    return res.end(
      JSON.stringify({ mensagem: "API HTTPS funcionando!" })
    );
  }

  // GET /api/alunos
  if (req.method === "GET" && pathname === "/api/alunos") {
    return res.end(JSON.stringify(alunos));
  }

  // GET /api/alunos/:id
  const match = pathname.match(/^\/api\/alunos\/(\d+)$/);

  if (req.method === "GET" && match) {
    const aluno = alunos.find(
      (a) => a.id === Number(match[1])
    );

    if (!aluno) {
      res.writeHead(404);
      return res.end(
        JSON.stringify({ erro: "Aluno não encontrado" })
      );
    }

    return res.end(JSON.stringify(aluno));
  }

  // POST /api/alunos
  if (req.method === "POST" && pathname === "/api/alunos") {
    let body = "";

    req.on("data", (chunk) => (body += chunk));

    req.on("end", () => {
      try {
        const dados = JSON.parse(body);

        if (!dados.nome || !dados.curso) {
          res.writeHead(400);
          return res.end(
            JSON.stringify({
              erro: "Nome e curso são obrigatórios"
            })
          );
        }

        const novoAluno = {
          id: Math.max(0, ...alunos.map((a) => a.id)) + 1,
          nome: dados.nome,
          curso: dados.curso,
        };

        alunos.push(novoAluno);

        res.writeHead(201);
        res.end(JSON.stringify(novoAluno));

      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ erro: "JSON inválido" }));
      }
    });

    return;
  }

  // Endpoint não encontrado
  res.writeHead(404);
  res.end(
    JSON.stringify({ erro: "Endpoint não encontrado" })
  );
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em https://localhost:${PORT}`);
});