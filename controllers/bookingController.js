const Stripe = require('stripe');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
   const tour = await Tour.findById(req.params.tourId);
   if (!tour) return next(new AppError('No Tour booking found!'));
   const ImgPath = `https://www.natours.dev`;
   const img = `${ImgPath}/img/tours/${tour.imageCover}`;
   console.log(img);
   const stripe = Stripe(process.env.STRIPE_SEC_KEY);
   //    const amt = tour.price * 100;
   const product = await stripe.products.create({
      name: tour.name,
      description: tour.summary,
      images: [img],
   });

   const price = await stripe.prices.create({
      product: product.id,
      unit_amount: tour.price * 100,
      currency: 'usd',
   });

   const session = await stripe.checkout.sessions.create({
      payment_method_types: ['PromptPay'],
      //   customer: req.user.name, Card
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      mode: 'payment',
      line_items: [
         {
            // name: `${tour.name} Tour`,
            // description: `${tour.summary}`,
            // images: [`http://localhost:3000/img/tours/${tour.imageCover}`],
            // amount: amt,
            // currency: 'usd',
            price: price.id,
            quantity: 1,
         },
      ],
      success_url: `${req.protocol}://${req.get('host')}/booking/{CHECKOUT_SESSION_ID}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
   });
   //console.log(session);
   // const sid = `${session.success_url}&sessionId=${session.id}`;
   // session.updateOne({ id: session.id }, { success_url: sid });
   res.status(200).json({ status: 'success', session });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
   const { tour, user, price } = req.query;
   //console.log('query tour, user, price', req.query, tour, user, price);
   if (!tour && !user && !price) {
      //return res.redirect('/');

      return next(new AppError('No booking has recorded!', 404));
   }
   const sessionId = req.params.sid;
   const stripe = Stripe(process.env.STRIPE_SEC_KEY);
   const session = await stripe.checkout.sessions.retrieve(sessionId);
   if (!session) {
      return next(new AppError('No session has recorded!', 404));
   }
   await Booking.create({ tour, user, price });

   res.redirect('/');
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
