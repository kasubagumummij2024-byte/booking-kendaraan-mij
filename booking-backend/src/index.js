// === index.js (Final & Lengkap) ===

const path = require('path');
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); 
}

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

let serviceAccount;
if (isProduction) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    serviceAccount = require('../serviceAccountKey.json');
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

// --- BAGIAN PENTING UNTUK FRONTEND ---

// 1. Definisikan path ke folder 'public' fisik Anda
const publicPath = path.resolve(__dirname, '..', 'public');

// 2. SAJIKAN FILE STATIS (CSS, JS, GAMBAR)
// Perintah ini: "Jika ada request ke URL yang diawali '/public', 
// carikan filenya di dalam folder 'publicPath'."
// Ini akan memperbaiki error 404 pada style.css
app.use('/public', express.static(publicPath));

// 3. SAJIKAN HALAMAN HTML
// Perintah ini menangani request ke halaman-halaman spesifik.
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'schedule.html'));
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(publicPath, 'form.html'));
});

// Tambahan untuk memastikan akses langsung ke file .html juga berfungsi
app.get('/schedule.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'schedule.html'));
});

app.get('/form.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'form.html'));
});

// --- AKHIR BAGIAN FRONTEND ---

// --- API Routes Anda (Tetap sama) ---
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api', bookingRoutes);

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`✅ Server (Backend + Frontend) berjalan di port ${PORT}`);
});