// Hukuk Kalkanı - Yerel ve Bulut Entegrasyon Sunucusu (Node.js)
// Harici hiçbir ağır kütüphaneye ihtiyaç duymadan yerel test ve doğrudan çalıştırma sağlar.

const http = require('http');
const fs = require('fs');
const path = require('path');
const danisHandler = require('./api/danis');

// .env dosyasını varsa elle oku (harici dotenv paketi zorunluluğu olmadan)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...rest] = trimmed.split('=');
            if (key && rest.length > 0) {
                process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
            }
        }
    });
}

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    // API İstekleri
    if (req.url === '/api/danis' || req.url.startsWith('/api/danis?')) {
        let bodyBuffer = '';
        req.on('data', chunk => { bodyBuffer += chunk; });
        req.on('end', async () => {
            req.body = bodyBuffer;
            // Express benzeri yardımcı metodlar
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(data));
            };
            await danisHandler(req, res);
        });
        return;
    }

    // Statik Dosyalar (index.html vb.)
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Dosya okuma hatası.');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`[Hukuk Kalkanı] Savunma karargâhı http://localhost:${PORT} adresinde aktif.`);
    if (!process.env.GEMINI_API_KEY) {
        console.warn('[DİKKAT] GEMINI_API_KEY ortam değişkeni henüz tanımlanmadı! Bulut panelinizden veya .env dosyasından anahtarınızı giriniz.');
    } else {
        console.log('[GÜVENLİK] GEMINI_API_KEY ortam değişkeninden başarıyla tespit edildi.');
    }
});
