const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
   console.log('handleCastErrorDB');
   const message = `Invalid ${err.path} : ${err.value}`;
   return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
   const value = err.errmsg.match(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/)[0];
   console.log(value);
   const message = `Duplicate field value ${value}. Please use another value!`;
   return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
   //console.log(Object.values(err));
   const errs = Object.values(err.errors).map((el) => {
      console.log(err.message);
      return el.message;
   });
   const message = `Invalid Input data. ${errs.join('. ')}`;
   return new AppError(message, 400);
};
const handleJWTError = () =>
   new AppError(`Invalid token. Please login again.`, 401);
const handleJWTExpiredError = () =>
   new AppError(`Your token is expired.Please login again.`, 401);
const sendErrorDev = (err, req, res) => {
   //console.log(`Error in sendErrorDev : ${err.message}`);
   if (req.originalUrl.startsWith('/api')) {
      res.status(err.statusCode).json({
         status: err.status,
         error: err,
         message: err.message,
         stack: err.stack,
      });
   } else {
      res.status(err.statusCode).render('error', {
         title: 'Something went wrong 1111',
         msg: err.message,
      });
   }
};

const sendErrorProd = (err, req, res) => {
   if (req.originalUrl.startsWith('/api')) {
      if (err.isOperation) {
         res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
         });
      } else {
         console.error('ERROR ✨', err);
         res.status(500).json({
            status: err.status,
            message: 'Something went very wrong!!',
         });
      }
   } else {
      res.status(err.statusCode).render('error', {
         title: 'Something went wrong',
         msg: err.message,
      });
   }
};

exports.errorHandler = (err, req, res, next) => {
   //console.log('errorHandler');
   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'Error';

   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, req, res);
   } else if (process.env.NODE_ENV === 'production') {
      //let error = { ...err };
      //console.log(err);
      // console.log('==========');
      // console.log(error);
      if (err.name === 'CastError') err = handleCastErrorDB(err);
      if (err.code === 11000) err = handleDuplicateFieldsDB(err);
      if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
      if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
      if (err.name === 'TokenExpiredError') err = handleJWTExpiredError(err);
      sendErrorProd(err, req, res);
   } else {
      next();
   }
};
