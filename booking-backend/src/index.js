// === index.js (Versi Final: Backend + Frontend) ===

const path = require('path'); // WAJIB: Tambahkan modul 'path'
const isProduction = process.env.NODE_ENV === 'production';

// HANYA jalankan dotenv jika di lokal (bukan produksi)
if (!isProduction) {
  // Path ini menunjuk ke .env di folder /booking-backend (satu level di atas /src)
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); 
}

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// --- Logika Kunci Firebase (Sudah Benar) ---
let serviceAccount;
if (isProduction) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    serviceAccount = require('../serviceAccountKey.json');
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// --- Akhir Logika Kunci ---

const app = express();
app.use(cors());
app.use(express.json());

// === DITAMBAHKAN: Bagian untuk Menyajikan Frontend ===

// 1. Tentukan path ke folder 'public' milik frontend
const publicPath = path.join(__dirname, '..', '..', 'booking-frontend', 'public');

// 2. Gunakan 'publicPath' untuk menyajikan semua file statis (CSS, JS)
app.use(express.static(publicPath));

// 3. Buat route untuk halaman HTML Anda
// (Saya asumsikan 'schedule.html' adalah halaman utama)
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'schedule.html'));
});

// Route untuk halaman form
app.get('/form', (req, res) => {
    res.sendFile(path.join(publicPath, 'form.html'));
});

// === AKHIR BAGIAN FRONTEND ===


// --- API Routes Anda ---
// (PENTING: letakkan SETELAH route frontend)
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api', bookingRoutes); // API Anda tetap di /api/...


// --- Menjalankan Server ---
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`✅ Server (Backend + Frontend) berjalan di port ${PORT}`);
});