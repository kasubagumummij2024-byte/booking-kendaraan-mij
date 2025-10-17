const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');
const { isAuthenticated, isAdmin, isDriverOrAdmin } = require('../middleware/authMiddleware');

// Rute Publik
router.post('/bookings', controller.createBooking);
router.get('/initial-data', controller.getInitialData);

// Rute yang Membutuhkan Login
router.get('/user-profile', isAuthenticated, controller.getUserProfile);
router.get('/bookings/export', isAuthenticated, isAdmin, controller.exportBookings);

// Rute yang sudah ada dan benar
router.patch('/bookings/:submissionId/assign', isAuthenticated, isAdmin, controller.assignBooking);
router.patch('/bookings/:submissionId/status', isAuthenticated, isDriverOrAdmin, controller.updateBookingStatus);

// REVISI 2: Rute baru untuk update keterangan, hanya untuk Admin
router.patch('/bookings/:submissionId/notes', isAuthenticated, isAdmin, controller.updateBookingNotes);

module.exports = router;

