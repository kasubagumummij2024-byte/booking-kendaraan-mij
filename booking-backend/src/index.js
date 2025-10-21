// === index.js (Versi Final - Strategi Baru) ===

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

// === PERUBAHAN UTAMA DI SINI ===

// 1. Path sekarang menunjuk ke folder 'public' DI DALAM 'booking-backend'
//    (Naik 1 level dari 'src', lalu masuk ke 'public')
const publicPath = path.resolve(__dirname, '..', 'public');

console.log('--- DEBUGGING PATH BARU ---');
console.log('__dirname (lokasi file index.js):', __dirname);
console.log('publicPath (folder frontend internal):', publicPath);
console.log('--- AKHIR DEBUGGING ---');

// 2. Gunakan 'publicPath' untuk menyajikan semua file statis (CSS, JS)
app.use('/public',express.static(publicPath));

// 3. Buat route untuk halaman HTML Anda
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'schedule.html'));
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(publicPath, 'form.html'));
});
// === AKHIR PERUBAHAN ===

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api', bookingRoutes);

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`✅ Server (Backend + Frontend) berjalan di port ${PORT}`);
});