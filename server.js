const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = __dirname;
const SUPABASE_URL = 'http://172.16.20.21:8000';
const SUPABASE_KEY = 'sb_publishable_nonpHrymDEEjJ9MFcDQajq_Nho7Bijj';

// Pre-load enriched warehouse devices as safety fallback
let localKhoSeed = [];
try {
  localKhoSeed = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'kho_recovered_enriched.json'), 'utf8'));
} catch (e) {
  console.warn('Could not read kho_recovered_enriched.json:', e.message);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.sql': 'text/plain; charset=utf-8'
};

function getLocalIpAddresses() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push({ name, ip: net.address });
      }
    }
  }
  return results;
}

// Helper: Intelligent Asset Search across Supabase & Local Fallbacks
async function lookupAsset(query) {
  if (!query || typeof query !== 'string') return null;
  const qClean = query.trim();
  if (!qClean) return null;

  const qNoSpace = qClean.replace(/\s+/g, '');
  const qNormHyphen = qClean.replace(/\s*-\s*/g, '-');
  const terms = Array.from(new Set([qClean, qNoSpace, qNormHyphen].filter(Boolean)));

  let thietBiCandidate = null;

  // 1. Search thiet_bi in Supabase
  try {
    const conditions = [];
    terms.forEach(t => {
      const enc = encodeURIComponent(t);
      conditions.push(`asset_code.ilike.*${enc}*`);
      conditions.push(`dev_id.ilike.*${enc}*`);
      conditions.push(`dev_sn.ilike.*${enc}*`);
      conditions.push(`user_name.ilike.*${enc}*`);
      conditions.push(`user_id.ilike.*${enc}*`);
    });

    const url = `${SUPABASE_URL}/rest/v1/thiet_bi?or=(${conditions.join(',')})&limit=10`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const exact = rows.find(r => 
          terms.some(t => 
            (r.dev_id && r.dev_id.toLowerCase() === t.toLowerCase()) ||
            (r.asset_code && r.asset_code.toLowerCase() === t.toLowerCase()) ||
            (r.user_name && r.user_name.toLowerCase() === t.toLowerCase()) ||
            (r.user_id && r.user_id.toLowerCase() === t.toLowerCase())
          )
        ) || rows[0];

        if (exact) {
          const isOffboarded = exact.has_device === false || exact.dev_status === 'Không cấp' || (!exact.dev_cpu && !exact.dev_ram);
          if (!isOffboarded) {
            return { type: 'thiet_bi', data: exact };
          }
          thietBiCandidate = exact;
        }
      }
    }
  } catch (err) {
    console.warn('Lookup thiet_bi Supabase error:', err.message);
  }

  // 2. Search kho_thiet_bi in Supabase
  try {
    const khoConditions = [];
    terms.forEach(t => {
      const enc = encodeURIComponent(t);
      khoConditions.push(`code.ilike.*${enc}*`);
      khoConditions.push(`asset_code.ilike.*${enc}*`);
      khoConditions.push(`dev_sn.ilike.*${enc}*`);
      khoConditions.push(`name.ilike.*${enc}*`);
    });

    const urlKho = `${SUPABASE_URL}/rest/v1/kho_thiet_bi?or=(${khoConditions.join(',')})&limit=10`;
    const resKho = await fetch(urlKho, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (resKho.ok) {
      const khoRows = await resKho.json();
      if (Array.isArray(khoRows) && khoRows.length > 0) {
        return { type: 'kho_thiet_bi', data: khoRows[0] };
      }
    }
  } catch (err) {
    console.warn('Lookup kho_thiet_bi Supabase error:', err.message);
  }

  // 3. Search local kho fallback
  if (Array.isArray(localKhoSeed) && localKhoSeed.length > 0) {
    const lowerTerms = terms.map(t => t.toLowerCase());
    const matched = localKhoSeed.find(item => {
      const c = (item.code || '').toLowerCase();
      const a = (item.assetCode || item.maTaiSan || '').toLowerCase();
      const s = (item.devSn || '').toLowerCase();
      const n = (item.name || '').toLowerCase();
      const r = (item.reason || '').toLowerCase();
      return lowerTerms.some(t => c === t || a === t || s === t || n.includes(t) || r.includes(t));
    });
    if (matched) {
      return { type: 'kho_thiet_bi', data: matched };
    }
  }

  return thietBiCandidate ? { type: 'thiet_bi', data: thietBiCandidate } : null;
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const hostHeader = req.headers.host || `localhost:${PORT}`;
  const urlObj = new URL(req.url, `http://${hostHeader}`);
  const pathname = decodeURI(urlObj.pathname);

  // API endpoint for asset lookup: /api/asset?code=...
  if (pathname === '/api/asset' || pathname === '/api/lookup' || pathname === '/api/search') {
    const code = urlObj.searchParams.get('code') || urlObj.searchParams.get('q') || '';
    lookupAsset(code)
      .then(result => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: !!result, result }));
      })
      .catch(err => {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      });
    return;
  }


  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';

  // Route rewrite for /tai-san/*
  if (reqPath.startsWith('/tai-san/') || reqPath === '/tai-san') {
    reqPath = '/tai-san.html';
  }

  const lowerReqPath = reqPath.toLowerCase();
  if (lowerReqPath === '/user_permissions.json' || lowerReqPath.startsWith('/database/')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const filePath = path.join(ROOT_DIR, reqPath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };
    if (ext === '.html' || ext === '.js' || ext === '.css') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('========================================================');
  console.log('   ERAS GROUP - ASSET MANAGEMENT WEB SERVER            ');
  console.log('========================================================');
  console.log(` May tinh cuc bo:       http://localhost:${PORT}`);
  ips.forEach(({ name, ip }) => {
    console.log(` Mang LAN / Dien thoai: http://${ip}:${PORT} (${name})`);
    console.log(` Tra cuu QR:            http://${ip}:${PORT}/tai-san.html?code=...`);
  });
  console.log(` Tra cuu API:           http://localhost:${PORT}/api/asset?code=...`);
  console.log('========================================================');
  console.log(' San sang nhan ket noi tu Camera dien thoai / Zalo.');
});
