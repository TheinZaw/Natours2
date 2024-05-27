const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
//const router = express.Router();
const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
   .route('/')
   .get(reviewController.getAllReviews)
   .post(
      authController.restrictTo('user'),
      reviewController.setTourUserIds,
      reviewController.createReview,
   );

router
   .route('/:id')
   .patch(
      authController.restrictTo('user', 'admin'),
      reviewController.updateReview,
   )
   .delete(
      authController.restrictTo('user', 'admin'),
      reviewController.deleteReview,
   )
   .get(reviewController.getReview);
//router.post('/createReview', reviewController.createReview);

module.exports = router;
