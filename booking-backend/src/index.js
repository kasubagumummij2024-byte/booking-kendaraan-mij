// --- REVISI UNTUK DEPLOYMENT ---
const path = require('path');
const isProduction = process.env.NODE_ENV === 'production';

// HANYA jalankan dotenv jika di lokal (bukan produksi)
if (!isProduction) {
  // Kita perlu menunjuk path ke .env yang ada di folder root backend
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); 
  // CATATAN: Jika .env Anda ada di dalam /src, ubah path-nya. 
  // Jika ada di /booking-backend (di luar /src), path: path.resolve(__dirname, '../.env')
}
// --- AKHIR REVISI ---

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

let serviceAccount;

if (isProduction) {
    // Di Railway (produksi), baca kunci dari environment variable
    // Pastikan nama variabel di Railway adalah FIREBASE_SERVICE_ACCOUNT
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Di komputer lokal, tetap baca dari file
    // Path ini (../) sudah benar jika serviceAccountKey.json ada di /booking-backend
    serviceAccount = require('../serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api', bookingRoutes);

// Railway akan menyediakan variabel PORT-nya sendiri
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`✅ Server backend berjalan di port ${PORT}`);
});