const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//(2) Route Handler
router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);

router.patch(
   '/UpdateMe',
   userController.uploadUserPhoto,
   userController.resizeUserPhoto,
   userController.UpdateMe,
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));
router
   .route('/')
   .get(userController.getAllUsers)
   .post(userController.createUser);
router
   .route('/:id')
   .get(userController.getUser)
   .patch(userController.updateUser)
   .delete(userController.deleteUser);

module.exports = router;
