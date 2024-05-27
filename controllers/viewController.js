const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res) => {
   const tours = await Tour.find();
   res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
   const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'tourReviews',
      select: 'review rating user',
   });
   if (!tour)
      return next(new AppError('There is no tour with that name.', 404));

   res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

exports.getLoginForm = catchAsync(async (req, res) => {
   res.status(200).render('login', { title: 'Login to you account' });
});

exports.getAccount = async (req, res) => {
   res.status(200).render('account', { title: 'Your Account' });
};
exports.getMyTours = catchAsync(async (req, res) => {
   // 1) Find all bookings
   const bookings = await Booking.find({ user: req.user.id });

   // 2) Find tours with the returned IDs
   const tourIDs = bookings.map((el) => el.tour);
   const tours = await Tour.find({ _id: { $in: tourIDs } });

   res.status(200).render('overview', {
      title: 'My Tours',
      tours,
   });
});
exports.updateUserData = catchAsync(async (req, res) => {
   const updUser = await User.findByIdAndUpdate(
      req.user.id,
      {
         name: req.body.name,
         email: req.body.email,
      },
      {
         new: true,
         validator: true,
      },
   );

   res.status(200).render('account', {
      title: `Your Account Update ${updUser.name}`,
      user: updUser,
   });
});
