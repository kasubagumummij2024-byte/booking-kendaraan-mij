const admin = require('firebase-admin');

// --- PENGATURAN AKSES PENGGUNA ---
const ADMIN_EMAILS = ['aguswahyudingumpul@gmail.com','kasubagumummij2024@gmail.com']; 
const DRIVER_EMAILS = ['taatsulistyawati@gmail.com','sudarjomij@gmail.com','abramrafakumar@gmail.com']; 

exports.isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const email = decodedToken.email.toLowerCase();
        
        req.user = {
            uid: decodedToken.uid,
            email: email,
            isAdmin: ADMIN_EMAILS.includes(email),
            isDriver: DRIVER_EMAILS.includes(email)
        };
        next();
    } catch (e) {
        return res.status(401).send({ message: 'Token tidak valid.' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) return next();
    return res.status(403).send({ message: 'Akses ditolak. Perlu hak akses Admin.' });
};

exports.isDriverOrAdmin = (req, res, next) => {
    if (req.user && (req.user.isDriver || req.user.isAdmin)) return next();
    return res.status(403).send({ message: 'Akses ditolak. Perlu hak akses Driver atau Admin.' });
};

