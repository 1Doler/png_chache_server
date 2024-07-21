const express = require('express');
const { createCanvas } = require('canvas');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173', 'https://check-cache.netlify.app', 'https://check-cache.onrender.com', 'https://check-cache.vercel.app', 'https://png-cache-page.onrender.com', 'https://png-cache-page.vercel.app', 'https://poetic-douhua-3d3d7b.netlify.app'];
// Установка заголовка CORS для разрешения доступа с любого источника
app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
    next();
});

const lastModifiedTime = new Date().toUTCString();

const expiresTime = new Date();
expiresTime.setFullYear(expiresTime.getFullYear() + 30);
const expiresTimeString = expiresTime.toUTCString();

app.get('/pngcookie', (req, res) => {

    const data = req.headers["custom-header"];
    console.log(req.cookies)

    if (!data) {
        if (!res.headersSent) {
            res.writeHead(304);
            res.end();
            return;
        }
    }

    const png = encodeStringToPNG(data);

    // Установка заголовков ответа в зависимости от наличия данных куки
    if (data === "undefined") {
        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }).send(png);
    } else {
        res.set({
            'Content-Type': 'image/png',
            'Last-Modified': lastModifiedTime,
            'Expires': expiresTimeString,
            'Cache-Control': 'private, max-age=630720000'
        }).send(png);
    }
});

function encodeStringToPNG(str) {
    // Создание холста для изображения PNG
    const canvas = createCanvas(200, 1);
    const ctx = canvas.getContext('2d');

    const imageData = Buffer.from(str, 'UTF-8');
    const pixels = imageData.toString('binary').split('');

    // Заполнение холста пикселями
    let x = 0;
    for (let i = 0; i < pixels.length; i += 3) {
        const red = pixels[i] ? pixels[i].charCodeAt(0) : 0;
        const green = pixels[i + 1] ? pixels[i + 1].charCodeAt(0) : 0;
        const blue = pixels[i + 2] ? pixels[i + 2].charCodeAt(0) : 0;
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x++, 0, 1, 1);
    }

    // Преобразование холста в PNG
    return canvas.toBuffer();
}

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
