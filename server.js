import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression()); // Tüm HTTP yanıtlarını (HTML, CSS, JS, JSON) sıkıştırarak veri boyutunu %70 azaltır
app.use(cors());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.get('/script.js', (req, res) => res.sendFile(path.join(__dirname, 'script.js')));
app.get('/hakkimizda', (req, res) => res.sendFile(path.join(__dirname, 'hakkimizda.html')));
app.get('/iletisim', (req, res) => res.sendFile(path.join(__dirname, 'iletisim.html')));
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'manifest.json')));
app.get('/service-worker.js', (req, res) => res.sendFile(path.join(__dirname, 'service-worker.js')));
app.get('/favicon.png', (req, res) => res.sendFile(path.join(__dirname, 'favicon.png')));

app.get('/api/weather', async (req, res) => {
    const { city, lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    let weatherUrl;

    if (lat && lon) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}&lang=tr`;
    } else {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=tr`;
    }

    try {
        // 1. Önce anlık hava durumunu çekiyoruz
        const weatherRes = await axios.get(weatherUrl);
        const currentData = weatherRes.data;
        
        // 2. Anlık veriden koordinatları alıp Tahmin ve Hava Kalitesi için kullanıyoruz
        const { lat: reqLat, lon: reqLon } = currentData.coord;
        
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${reqLat}&lon=${reqLon}&units=metric&appid=${apiKey}&lang=tr`;
        const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${reqLat}&lon=${reqLon}&appid=${apiKey}`;
        
        // 3. İki veriyi paralel ve hızlı bir şekilde çekiyoruz
        const [forecastRes, aqiRes] = await Promise.all([ axios.get(forecastUrl), axios.get(aqiUrl) ]);
        
        // 4. Hepsini birleştirip paket halinde gönderiyoruz
        res.json({ current: currentData, forecast: forecastRes.data, airQuality: aqiRes.data });
    } catch (error) {
        // Eğer OpenWeather API 404 (şehir bulunamadı) hatası döndürdüyse bunu frontend'e iletiyoruz
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: 'Şehir bulunamadı' });
        } else if (error.response && error.response.status === 401) {
            res.status(401).json({ error: 'API Anahtarı geçersiz veya henüz aktif değil.' });
        } else {
            console.error("API Hatası Detayı:", error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Hava durumu verisi alınamadı.' });
        }
    }
});

// OpenWeatherMap Geo API ile Otomatik Tamamlama (Autocomplete) Endpoint'i
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${apiKey}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Arama verisi alınamadı' });
    }
});

// Leaflet haritası için OpenWeatherMap Tile (Katman) Proxy'si
app.get('/api/tiles/:layer/:z/:x/:y', async (req, res) => {
    const { layer, z, x, y } = req.params;
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Harita katmanı alınamadı.');
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});