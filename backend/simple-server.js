require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/test", (req, res) => res.json({status: "OK"}));

// Frontend expects GET /api/products with query params
app.get("/api/products", async (req, res) => {
  try {
    const service = require("./services/mercadoLivreService");
    const produtos = await service.buscarProdutos(req.query);
    res.json({produtos, pagina: 1, totalPaginas: 1});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// Frontend expects POST /api/recommend
app.post("/api/recommend", async (req, res) => {
  try {
    const service = require("./services/mercadoLivreService");
    const produtos = await service.buscarProdutos(req.body);
    
    // Generate a recommendation based on profile
    let sugestao = "Aqui estão algumas sugestões especiais para você!";
    if (req.body.idade) {
      if (req.body.idade < 18) {
        sugestao = "Produtos perfeitos para jovens!";
      } else if (req.body.idade > 50) {
        sugestao = "Presentes sofisticados para pessoas experientes!";
      }
    }
    if (req.body.genero === 'feminino') {
      sugestao = "Presentes especiais pensados para ela!";
    } else if (req.body.genero === 'masculino') {
      sugestao = "Presentes ideais pensados para ele!";
    }
    
    res.json({sugestao, produtosRelacionados: produtos});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// Keep the original POST endpoint for backward compatibility
app.post("/api/buscar-produtos", async (req, res) => {
  try {
    const service = require("./services/mercadoLivreService");
    const produtos = await service.buscarProdutos(req.body);
    res.json({produtos});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});
app.listen(3000, () => console.log(" Server running on port 3000"));
