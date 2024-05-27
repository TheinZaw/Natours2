const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

// router.use(authController.isLoggedIn);
router.get(
   '/booking/:sid',
   authController.isLoggedIn,
   bookingController.createBookingCheckout,
);
router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);

router.get(
   '/my-tours',
   //bookingController.createBookingCheckout,
   authController.protect,
   viewController.getMyTours,
);

router.post(
   '/submit-user-data',
   authController.protect,
   viewController.updateUserData,
);
router.get('/test', async (req, res) => {
   res.status(200).render('test', { title: `test html ` });
});
router.get('/testmap', async (req, res) => {
   res.status(200).render('testmap', { title: `test map html ` });
});
module.exports = router;
