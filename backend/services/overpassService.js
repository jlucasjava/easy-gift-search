// backend/services/overpassService.js
// Serviço para buscar lojas e shoppings usando Overpass API (OpenStreetMap)
const axios = require('axios');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function buildOverpassQueryLojas(cidade, categoria = 'gift') {
  // Categoria OSM: shop=gift, shop=mall, shop=department_store, etc
  // Para lojas de presentes, use shop=gift
  return `
[out:json][timeout:25];
area["name"="${cidade}"]["admin_level"="8"]->.searchArea;
(
  node["shop"="${categoria}"](area.searchArea);
  way["shop"="${categoria}"](area.searchArea);
  relation["shop"="${categoria}"](area.searchArea);
);
out center;
`;
}

function buildOverpassQueryShoppings(cidade) {
  // Para shoppings, use shop=mall
  return `
[out:json][timeout:25];
area["name"="${cidade}"]["admin_level"="8"]->.searchArea;
(
  node["shop"="mall"](area.searchArea);
  way["shop"="mall"](area.searchArea);
  relation["shop"="mall"](area.searchArea);
);
out center;
`;
}

async function buscarLojasProximas({ categoria = 'gift', cidade }) {
  const query = buildOverpassQueryLojas(cidade, categoria);
  const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  // Mapear para formato amigável
  const lojas = (response.data.elements || []).map(e => ({
    nome: e.tags?.name || 'Loja de presentes',
    tipo: e.tags?.shop || categoria,
    endereco: e.tags?.address || '',
    latitude: e.lat || e.center?.lat,
    longitude: e.lon || e.center?.lon,
    tags: e.tags || {},
  }));
  return {
    sucesso: true,
    dados: {
      lojas,
      info: {
        cidade,
        categoria,
        total: lojas.length
      }
    }
  };
}

async function buscarShoppings({ cidade }) {
  const query = buildOverpassQueryShoppings(cidade);
  const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const shoppings = (response.data.elements || []).map(e => ({
    nome: e.tags?.name || 'Shopping Center',
    tipo: e.tags?.shop || 'mall',
    endereco: e.tags?.address || '',
    latitude: e.lat || e.center?.lat,
    longitude: e.lon || e.center?.lon,
    tags: e.tags || {},
  }));
  return {
    sucesso: true,
    dados: {
      shoppings,
      info: {
        cidade,
        total: shoppings.length
      }
    }
  };
}

module.exports = {
  buscarLojasProximas,
  buscarShoppings
};
