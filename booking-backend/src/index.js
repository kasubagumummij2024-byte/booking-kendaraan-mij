require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// --- REVISI UNTUK DEPLOYMENT ---
// Cek apakah kita sedang di lingkungan Render (production)
const isProduction = process.env.NODE_ENV === 'production';
let serviceAccount;

if (isProduction) {
    // Di Render, baca kunci dari environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Di komputer lokal, tetap baca dari file
    serviceAccount = require('../serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// --- AKHIR REVISI ---

const app = express();
app.use(cors());
app.use(express.json());

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api', bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server backend berjalan di http://localhost:${PORT}`);
});
```

---

### **Fase 2: Menyiapkan GitHub**

1.  **Buat Akun:** Pastikan Anda punya akun di [GitHub.com](https://github.com).
2.  **Buat Repositori Baru:**
    * Klik tombol `+` di pojok kanan atas, lalu "New repository".
    * Beri nama repositori, misalnya `webapp-booking-kendaraan`.
    * Pilih "Public".
    * Klik "Create repository".
3.  **Unggah Kode Anda:**
    * Buka terminal di folder proyek utama Anda (`WebApp Booking Kendaraan`).
    * Jalankan perintah-perintah ini satu per satu:

    ```bash
    git init -b main
    git add .
    git commit -m "Initial commit: Siap untuk deploy"
    git remote add origin https://github.com/NAMA_USER_ANDA/webapp-booking-kendaraan.git
    git push -u origin main
    ```
    * **Ganti `NAMA_USER_ANDA`** dengan username GitHub Anda.

Sekarang, jika Anda me-refresh halaman repositori di GitHub, semua kode Anda (kecuali file di `.gitignore`) akan muncul di sana.

---

### **Fase 3: Deploy Backend di Render**

1.  **Buat Akun:** Daftar dan login di [Render.com](https://dashboard.render.com).
2.  **Buat Web Service Baru:**
    * Di Dashboard Render, klik **New > Web Service**.
    * Pilih "Build and deploy from a Git repository", lalu klik "Next".
    * Hubungkan akun GitHub Anda, lalu pilih repositori `webapp-booking-kendaraan` yang baru saja Anda buat.
3.  **Isi Pengaturan Backend:**
    * **Name:** Beri nama unik, misalnya `booking-backend-app`.
    * **Root Directory:** `booking-backend` (Ini sangat penting agar Render tahu di mana harus mencari kode backend).
    * **Environment:** `Node`.
    * **Build Command:** `npm install`.
    * **Start Command:** `npm start`.
    * **Plan:** Pilih "Free".
4.  **Tambahkan Kunci Rahasia (Environment Variable):**
    * Scroll ke bawah dan klik **"Advanced"**.
    * Klik **"Add Environment Variable"**.
        * **Key:** `FIREBASE_SERVICE_ACCOUNT`
        * **Value:** Buka file `serviceAccountKey.json` di komputer Anda, **salin seluruh isinya** (dari `{` sampai `}`), lalu tempel di sini.
    * Klik **"Add Environment Variable"** lagi.
        * **Key:** `NODE_ENV`
        * **Value:** `production`
    
5.  **Deploy!**
    * Scroll ke bawah dan klik **"Create Web Service"**.
    * Render akan mulai membangun aplikasi Anda. Proses ini butuh beberapa menit. Tunggu hingga statusnya berubah menjadi **"Live"**.
    * Setelah live, salin URL backend Anda (misalnya `https://booking-backend-app.onrender.com`). Simpan di notepad.

---

### **Fase 4: Deploy Frontend di Render**

1.  **Buat Static Site Baru:**
    * Kembali ke Dashboard Render, klik **New > Static Site**.
    * Pilih repositori `webapp-booking-kendaraan` yang sama.
2.  **Isi Pengaturan Frontend:**
    * **Name:** Beri nama unik, misalnya `booking-app-madrasah`.
    * **Root Directory:** `booking-frontend` (Penting!).
    * Biarkan **Build Command** dan **Publish Directory** kosong.
3.  **Deploy!**
    * Klik **"Create Static Site"**.
    * Proses ini biasanya sangat cepat.

---

### **Fase 5: Menghubungkan Frontend dan Backend**

Ini adalah langkah terakhir yang paling krusial.

1.  **Buka Kode Frontend Anda** di VS Code (`form.html` dan `schedule.html`).
2.  Di dalam tag `<script>` pada kedua file tersebut, cari baris ini:
    ```javascript
    const API_URL = 'http://localhost:5000/api';
    ```
3.  **Ganti** alamat `localhost` dengan URL backend dari Render yang sudah Anda salin tadi. Hasilnya akan terlihat seperti ini:
    ```javascript
    const API_URL = 'https://booking-backend-app.onrender.com/api';
    ```
4.  **Simpan** kedua file tersebut.
5.  **Unggah Perubahan ke GitHub:**
    * Buka kembali terminal di folder proyek utama Anda.
    * Jalankan perintah berikut:

    ```bash
    git add .
    git commit -m "Update API URL to production"
    git push
    

