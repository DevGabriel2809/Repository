const SUPABASE_URL = process.env.SUPABASE_URL || 'https://upzxedxfifhvdhwlphvw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_2tx3XDBRHeRgp7KVolM2QA_a9JPO3Qw';

function normalizarIp(ip) {
  if (!ip) return null;
  const primeiro = String(ip).split(',')[0].trim();
  if (!primeiro || primeiro === '::1' || primeiro === '127.0.0.1') return null;
  return primeiro.replace(/^::ffff:/, '');
}

function getClientIp(req) {
  return normalizarIp(
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress
  );
}

function textoHeader(valor) {
  if (!valor) return null;
  try {
    return decodeURIComponent(String(valor));
  } catch (_) {
    return String(valor);
  }
}

function nomePaisPorCodigo(codigo) {
  if (!codigo || codigo === '--') return null;
  try {
    const display = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
    return display.of(codigo.toUpperCase()) || null;
  } catch (_) {
    return null;
  }
}

function geoPelosHeadersDaVercel(req, ip) {
  const codigo = textoHeader(req.headers['x-vercel-ip-country']);
  const cidade = textoHeader(req.headers['x-vercel-ip-city']);
  const regiao = textoHeader(req.headers['x-vercel-ip-country-region']);
  const latitude = textoHeader(req.headers['x-vercel-ip-latitude']);
  const longitude = textoHeader(req.headers['x-vercel-ip-longitude']);

  if (!ip && !codigo && !cidade) return null;

  return {
    ip,
    cidade: cidade || 'Não identificado',
    regiao: regiao || 'Não identificado',
    pais: nomePaisPorCodigo(codigo) || 'Não identificado',
    pais_codigo: codigo || '--',
    latitude: latitude ? Number(latitude) : null,
    longitude: longitude ? Number(longitude) : null,
    timezone: null,
    org: null,
    asn: null,
    postal: null,
    currency: null,
    raw_geo: {
      source: 'vercel-headers',
      country: codigo || null,
      city: cidade || null,
      region: regiao || null,
      latitude: latitude || null,
      longitude: longitude || null,
    },
  };
}

async function geoPorIpApi(ip) {
  const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
    headers: { 'User-Agent': 'gabriel-portfolio-tracker/1.0' },
  });

  if (!res.ok) throw new Error(`ipapi.co retornou ${res.status}`);

  const data = await res.json();
  if (!data || data.error || !data.ip) throw new Error('ipapi.co sem dados válidos');

  return {
    ip: data.ip,
    cidade: data.city || 'Não identificado',
    regiao: data.region || 'Não identificado',
    pais: data.country_name || 'Não identificado',
    pais_codigo: data.country_code || '--',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    timezone: data.timezone || null,
    org: data.org || data.org_name || null,
    asn: data.asn || null,
    postal: data.postal || null,
    currency: data.currency || null,
    raw_geo: data,
  };
}

async function geoPorIpWhoIs(ip) {
  const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
    headers: { 'User-Agent': 'gabriel-portfolio-tracker/1.0' },
  });

  if (!res.ok) throw new Error(`ipwho.is retornou ${res.status}`);

  const data = await res.json();
  if (!data || data.success === false || !data.ip) throw new Error(data?.message || 'ipwho.is sem dados válidos');

  return {
    ip: data.ip,
    cidade: data.city || 'Não identificado',
    regiao: data.region || 'Não identificado',
    pais: data.country || 'Não identificado',
    pais_codigo: data.country_code || '--',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    timezone: data.timezone?.id || null,
    org: data.connection?.org || data.connection?.isp || null,
    asn: data.connection?.asn ? String(data.connection.asn) : null,
    postal: data.postal || null,
    currency: data.currency?.code || null,
    raw_geo: data,
  };
}

async function geoPorCountryIs(ip) {
  const res = await fetch(`https://api.country.is/${encodeURIComponent(ip)}`, {
    headers: { 'User-Agent': 'gabriel-portfolio-tracker/1.0' },
  });

  if (!res.ok) throw new Error(`api.country.is retornou ${res.status}`);

  const data = await res.json();
  if (!data || !data.ip) throw new Error('api.country.is sem dados válidos');

  const codigo = data.country || '--';
  return {
    ip: data.ip,
    cidade: 'Não identificado',
    regiao: 'Não identificado',
    pais: nomePaisPorCodigo(codigo) || 'Não identificado',
    pais_codigo: codigo,
    latitude: null,
    longitude: null,
    timezone: null,
    org: null,
    asn: null,
    postal: null,
    currency: null,
    raw_geo: data,
  };
}

async function buscarGeo(req, ip) {
  const porHeaders = geoPelosHeadersDaVercel(req, ip);

  const providers = [geoPorIpApi, geoPorIpWhoIs, geoPorCountryIs];
  for (const provider of providers) {
    try {
      const geo = await provider(ip);
      if (geo?.ip) return geo;
    } catch (error) {
      console.warn('[track][geo] provider falhou:', error.message);
    }
  }

  if (porHeaders?.ip) return porHeaders;

  return null;
}

function lerBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const ip = getClientIp(req);
    if (!ip) {
      return res.status(400).json({ error: 'Não foi possível identificar o IP do visitante.' });
    }

    const body = lerBody(req);
    const geo = await buscarGeo(req, ip);

    if (!geo?.ip) {
      return res.status(502).json({ error: 'Não foi possível obter geolocalização mínima do visitante.' });
    }

    const visita = {
      ip: geo.ip,
      cidade: geo.cidade || 'Não identificado',
      regiao: geo.regiao || 'Não identificado',
      pais: geo.pais || 'Não identificado',
      pais_codigo: geo.pais_codigo || '--',
      latitude: geo.latitude,
      longitude: geo.longitude,
      dispositivo: body.dispositivo || 'desktop',
      navegador: String(body.navegador || 'Não informado').slice(0, 255),
      pagina: body.pagina || '/',
      referrer: body.referrer || 'direto',
      idioma: body.idioma || 'Não informado',
      plataforma: body.plataforma || 'Não informado',
      tela: body.tela || 'Não informado',
      fuso_horario: body.fuso_horario || geo.timezone || 'Não informado',
      timezone_geo: geo.timezone || null,
      org: geo.org || null,
      asn: geo.asn || null,
      postal: geo.postal || null,
      currency: geo.currency || null,
      raw_geo: geo.raw_geo || null,
    };

    const resposta = await fetch(`${SUPABASE_URL}/rest/v1/visitas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(visita),
    });

    if (!resposta.ok) {
      const details = await resposta.text();
      return res.status(resposta.status).json({ error: 'Erro ao salvar no Supabase', details });
    }

    return res.status(200).json({ ok: true, visita });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no tracking', details: error.message });
  }
}
