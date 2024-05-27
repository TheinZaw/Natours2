const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const user = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

const signToken = (id) => {
   const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_IN,
   });
   return token;
};

const createSendToken = (user, statusCode, res) => {
   const token = signToken(user._id);
   const cookieOption = {
      expires: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
   };
   if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
   res.cookie('jwt', token, cookieOption);

   user.password = undefined;
   res.status(statusCode).json({
      status: 'success',
      token,
      data: { user },
   });
};

exports.signUp = catchAsync(async (req, res, next) => {
   const newUser = await user.create(req.body);

   if (!newUser) {
      return next(new AppError('Cannot create user', 404));
   }
   const _url = `${req.protocol}://${req.get('host')}/me`; // 'http://localhost:3000/me';

   await new Email(newUser, _url).sendWelcome();
   createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;
   if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
   }
   const usrObj = await user.findOne({ email: email }).select('+password');
   if (!usrObj) {
      return next(new AppError(`Invalid login's information. `, 404));
   }
   //console.log(usrObj);
   const correct = await usrObj.correctPassword(password, usrObj.password);
   if (!correct) {
      return next(new AppError("Invalid login's information", 401));
   }
   createSendToken(usrObj, 200, res);
});

exports.isLoggedIn = async (req, res, next) => {
   const token = req.cookies.jwt;
   if (token) {
      try {
         const decodedObj = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET,
         );

         // Check if the user still exists
         const currentUser = await user.findById(decodedObj.id);
         if (!currentUser) return next();

         // Check if user changed password after the token was issued
         if (currentUser.changePasswordAfter(decodedObj.iat)) {
            return next();
         }
         //there is a login user
         res.locals.user = currentUser;
      } catch (e) {
         return next();
      }
      //verify token
   }
   next();
};
exports.logout = async (req, res) => {
   const cookieOption = {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
   };
   res.cookie('jwt', null, cookieOption);
   res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
   let token;
   //console.log('req cookies');
   const s = req.cookies.jwt;
   //console.log(s);
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
   ) {
      token = req.headers.authorization.split(' ')[1];
   } else if (s) {
      token = s;
   }

   if (!token)
      return next(
         new AppError(
            'You are not logged in! Please log in to get access.',
            401,
         ),
      );
   const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
   if (!decodedObj && !decodedObj.id)
      return next(new AppError('Invalid token', 401));

   const currentUser = await user.findById(decodedObj.id);
   if (!currentUser)
      return next(
         new AppError(
            'The user belong to this token that does not longer exist.',
            401,
         ),
      );

   if (currentUser.changePasswordAfter(decodedObj.iat)) {
      return next(
         new AppError(
            'User recently changed password! Please login again.',
            401,
         ),
      );
   }
   req.user = currentUser;
   //there is a login user
   res.locals.user = currentUser;
   next();
});

exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if (roles.includes(req.user.role)) return next();

      return next(
         new AppError(
            'You do not have permission to perform this action. ',
            403,
         ),
      );
   };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
   const usrObj = await user.findOne({ email: req.body.email });
   if (!usrObj) {
      return next(new AppError('There is no user with this email.', 404));
   }

   try {
      const resetToken = await usrObj.createPasswordResetToken();
      const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

      await new Email(usrObj, resetUrl).sentPasswordReset();
      res.status(200).json({
         status: 'success',
         message: 'Token send to email',
      });
   } catch (err) {
      usrObj.passwordResetToken = undefined;
      usrObj.passwordResetExpires = undefined;
      usrObj.save({ validateBeforeSave: false });
      next(new AppError(`Reset Password is some time error , ${err}`, 500));
   }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
   const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
   const usrObj = await user.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gte: Date.now() },
   });
   if (!usrObj) {
      return next(new AppError('Token is not valid or expired.', 400));
   }
   try {
      usrObj.password = req.body.password;
      usrObj.confirmPassword = req.body.conformPassword;
      usrObj.passwordResetExpires = undefined;
      usrObj.passwordResetToken = undefined;
      await usrObj.save();
      createSendToken(usrObj, 201, res);
   } catch (err) {
      return next(
         new AppError(`Token is not valid or expired.${err.message}`, 400),
      );
   }
});

exports.updatePassword = catchAsync(async (req, res, next) => {
   const currentUser = await user
      .findOne({ _id: req.user.id })
      .select('+password');
   //console.log(currentUser);

   if (!currentUser.correctPassword(req.body.password, currentUser.password)) {
      return next(
         AppError('Incorrect current password.Please try again.', 402),
      );
   }

   currentUser.password = req.body.newPassword;
   currentUser.confirmPassword = req.body.confirmPassword;
   await currentUser.save();
   createSendToken(currentUser, 200, res);
});
