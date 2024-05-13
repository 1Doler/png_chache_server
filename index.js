const express = require('express');
const { createCanvas } = require('canvas');

const app = express();

// Установка заголовка CORS для разрешения доступа с любого источника
app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Custom-Header, Cache-Control');
    next();
});

app.get('/pngcookie', (req, res) => {

    const data = req.headers["custom-header"] || "undefined";

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
            'Last-Modified': 'Wed, 30 Jun 2010 21:36:48 GMT',
            'Expires': 'Tue, 31 Dec 2030 23:30:45 GMT',
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