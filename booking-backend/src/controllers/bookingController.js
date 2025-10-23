const admin = require('firebase-admin');
const db = admin.firestore();
const excel = require('exceljs');

// --- DATA MASTER ---
const UNITS = ['Pimpinan','KB','RA','MI','MTs','MA','IBS','Humas','Keuangan','Kepegawaian','MIJ Mart','Umum'];
const VEHICLES = ['Mobil APV','Mobil Hiace','Mobil Xpander','Mobil APV dan Hiace', 'Motor Beat','Motor Revo'];

const DRIVERS = [
    { name: 'Bapak Taat', email: 'taatsulistyawati@gmail.com|sudarjomij@gmail.com|abramrafakumar@gmail.com'},
    { name: 'Bapak Darjo', email: 'taatsulistyawati@gmail.com|sudarjomij@gmail.com|abramrafakumar@gmail.com'},
    { name: 'Bapak Taat dan Bapak Darjo', email: 'taatsulistyawati@gmail.com|sudarjomij@gmail.com|abramrafakumar@gmail.com'},
];

const SIFAT = ['Bawa Sendiri','Ditunggu sampai selesai','Diantar saja, pulang sendiri','Diantar kemudian ditinggal setelah selesai minta dijemput'];
const STATUS_LIST = ['Ditugaskan', 'Dalam Perjalanan', 'Selesai', 'Dibatalkan', 'Belum Bisa Diakomodir'];

exports.getInitialData = (req, res) => {
    res.status(200).json({ units: UNITS, vehicles: VEHICLES, sifat: SIFAT, drivers: DRIVERS, statusList: STATUS_LIST });
};

exports.getUserProfile = (req, res) => res.status(200).json(req.user);

exports.createBooking = async (req, res) => {
    try {
        const data = req.body;
        if (!data.nama || !data.wa || !data.purpose || !data.dateFrom) {
            return res.status(400).json({ success: false, message: 'Data wajib belum lengkap.' });
        }

        const batch = db.batch();
        const bookingGroupId = db.collection('bookings').doc().id;
        const startDate = new Date(data.dateFrom);
        const endDate = data.dateTo && data.dateTo !== '' ? new Date(data.dateTo) : startDate;
        
        let currentDate = new Date(startDate);
        currentDate.setUTCHours(0, 0, 0, 0);
        
        while (currentDate <= endDate) {
            const docRef = db.collection('bookings').doc();
            const newBookingData = {
                submissionId: docRef.id,
                bookingGroupId: bookingGroupId,
                usageDate: admin.firestore.Timestamp.fromDate(new Date(currentDate)),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'Pending',
                nama: data.nama,
                wa: data.wa,
                unit: data.unit,
                vehicle: data.vehicle,
                purpose: data.purpose,
                destination: data.destination,
                departureTime: data.departureTime,
                sifat: data.sifat,
                lat: data.lat || null,
                lng: data.lng || null,
                driver: null,
                assignedVehicle: null,
                assignedBy: null,
                assignedTs: null,
                keterangan: '' 
            };
            batch.set(docRef, newBookingData);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        await batch.commit();
        res.status(201).json({ success: true, message: 'Booking berhasil disimpan.' });

    } catch (e) {
        console.error("Error creating booking:", e);
        res.status(500).json({ success: false, message: 'Server error: ' + e.message });
    }
};

// VERSI BERSIH TANPA LOG DIAGNOSTIK
exports.assignBooking = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { driver, vehicle } = req.body;

        if (!submissionId || !driver || !vehicle) {
            return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
        }

        await db.collection('bookings').doc(submissionId).update({
            driver,
            assignedVehicle: vehicle,
            status: 'Ditugaskan',
            assignedBy: req.user.email,
            assignedTs: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ success: true, message: 'Booking berhasil ditugaskan.' });

    } catch (e) {
        console.error("!!! ERROR di fungsi assignBooking:", e);
        res.status(500).json({ success: false, message: e.message });
    }
};


exports.updateBookingStatus = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status } = req.body;
        if (!submissionId || !status) {
            return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
        }
        await db.collection('bookings').doc(submissionId).update({ status });
        res.status(200).json({ success: true, message: 'Status booking berhasil diupdate.' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.updateBookingNotes = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { notes } = req.body;
        if (!submissionId) {
            return res.status(400).json({ success: false, message: 'ID Booking tidak ditemukan.' });
        }
        await db.collection('bookings').doc(submissionId).update({ keterangan: notes });
        res.status(200).json({ success: true, message: 'Keterangan berhasil diupdate.' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.exportBookings = async (req, res) => {
    try {
        const snapshot = await db.collection('bookings').orderBy('usageDate', 'asc').get();
        if (snapshot.empty) return res.status(404).send('Tidak ada data.');

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Booking');

        worksheet.columns = [
            { header: 'Tanggal Pakai', key: 'usageDate', width: 20 }, { header: 'Jam', key: 'departureTime', width: 10 },
            { header: 'Status', key: 'status', width: 20 }, { header: 'Nama Pemesan', key: 'nama', width: 30 },
            { header: 'Unit', key: 'unit', width: 20 }, { header: 'Tujuan', key: 'destination', width: 40 },
            { header: 'Keperluan', key: 'purpose', width: 40 }, { header: 'Driver', key: 'driver', width: 30 },
            { header: 'Kendaraan', key: 'assignedVehicle', width: 20 }, { header: 'No. WA', key: 'wa', width: 20 },
            { header: 'Keterangan', key: 'keterangan', width: 40 },
        ];

        snapshot.forEach(doc => {
            const data = doc.data();
            worksheet.addRow({
                ...data,
                usageDate: new Date(data.usageDate.seconds * 1000).toLocaleDateString('id-ID'),
                assignedVehicle: data.assignedVehicle || data.vehicle,
                keterangan: data.keterangan || ''
            });
        });

        worksheet.getRow(1).font = { bold: true };
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Laporan_Booking_${new Date().toISOString().slice(0,10)}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (e) {
        console.error("Gagal export Excel:", e);
        res.status(500).send('Gagal membuat laporan.');
    }
};

