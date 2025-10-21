// === index.js (Versi Final: Backend + Frontend + DEBUG) ===

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

// === DITAMBAHKAN: Bagian untuk Menyajikan Frontend ===

console.log('--- DEBUGGING PATH ---'); // BARIS DEBUG DITAMBAHKAN
// 1. Tentukan path ke folder 'public' milik frontend
const publicPath = path.resolve(__dirname, '..', '..', 'booking-frontend', 'public');
console.log('__dirname (lokasi file index.js):', __dirname); // BARIS DEBUG DITAMBAHKAN
console.log('publicPath (path ke folder frontend):', publicPath); // BARIS DEBUG DITAMBAHKAN
console.log('--- AKHIR DEBUGGING ---'); // BARIS DEBUG DITAMBAHKAN

// 2. Gunakan 'publicPath' untuk menyajikan semua file statis (CSS, JS)
app.use(express.static(publicPath));

// 3. Buat route untuk halaman HTML Anda
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'schedule.html'));
});

// Route untuk halaman form
app.get('/form', (req, res) => {
    res.sendFile(path.join(publicPath, 'form.html'));
});
// === AKHIR BAGIAN FRONTEND ===

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api', bookingRoutes);

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`✅ Server (Backend + Frontend) berjalan di port ${PORT}`);
});