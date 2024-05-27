const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const AppError = require('./utils/appError');
const { errorHandler } = require('./controllers/errorController');

const dotenv = require('dotenv');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const contentSecurityPolicy = require('./utils/myCSP');

// (1) Start GLobal Middleware
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//static page

app.use(express.static(path.join(__dirname, 'public')));

dotenv.config({ path: `${__dirname}/config.env` });

//body parser, reading data from body into req.body with limiting to 10kb in request
app.use(express.json({ limit: '10kb' }));

//Require Cookie parser
app.use(cookieParser());
app.use(
   bodyParser.urlencoded({
      extended: true,
   }),
);

//development logging
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

//request limit from same IP
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
   message: 'Too many request from the same IP! Please try again in 15 mins', //Response to return after limit is reached.
});
app.use('/api', limiter);

//secure http header
app.use(helmet());

const nonce = crypto.randomBytes(16).toString('hex');
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(contentSecurityPolicy(nonce));

//Data sanitization again NoSQL query injection
app.use(mongoSanitize());

//Data sanitization again xss (cross size scripting)
app.use(xssClean());

//Prevent Parameter pollution
app.use(hpp({ whitelist: ['duration', 'ratingsAverage'] }));

// Test middleware
app.use((req, res, next) => {
   req.requestTime = new Date().toUTCString();
   next();
});

//(3) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
   next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

app.use(errorHandler);

module.exports = app;
