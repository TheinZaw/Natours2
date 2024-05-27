const multer = require('multer'); //For File upload
const sharp = require('sharp'); //Image procesing
const path = require('path');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// //To use resize photo and file format, no need to use diskStorage
// const multerStorage = multer.diskStorage({
//    destination: (req, file, cb) => {
//       cb(null, './public/img/users/');
//    },
//    filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       //const ext = `.${file.mimetype.split('/')[1]}`;
//       console.log(ext);
//       cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
//    },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
      return cb(null, true);
   }
   cb(new AppError('Not an image! Please upload only image.', 400), false);
};
// const uploader = multer({ dest: './public/img/users/' });
const uploader = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = uploader.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
   if (!req.file) return next();
   const fileName = `user-${req.user.id}-${Date.now()}.jpg`;
   const fullFileName = path.join('./public/img/users/', fileName);
   req.file.filename = fileName;

   await sharp(req.file.buffer)
      .resize({ width: 500, height: 500 })
      .toFormat('jpeg')
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(fullFileName);

   next();
});
const filterObj = (obj, ...allowedFields) => {
   const newObj = {};

   Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) {
         newObj[el] = obj[el];
      }
   });
   //console.log(newObj);
   return newObj;
};

exports.UpdateMe = catchAsync(async (req, res, next) => {
   if (req.body.password || req.body.passwordConfirm)
      return next(
         new AppError(
            'This route is not update for password. Please use /updatePassword.',
            402,
         ),
      );
   console.log(req.file);
   const filteredBody = filterObj(req.body, 'name', 'email');
   if (req.file) filteredBody.photo = req.file.filename;

   const currentUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
   });
   res.locals.user = currentUser;
   res.status(200).json({ status: 'success', data: { user: currentUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
   const currentUser = await User.findByIdAndUpdate(req.user.id, {
      active: false,
   });
   if (!currentUser) {
      return next(new AppError('Invalid user login to delete', 404));
   }
   res.status(204).json({ status: 'success', data: null, token: null });
});

exports.createUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message:
         'This route is not defined! Please use /signup instead of createUser',
   });
};

exports.getMe = async (req, res, next) => {
   //console.log(req.user.id);
   req.params.id = req.user.id;
   next();
};
exports.getUser = factory.getOne(User);
//Do not update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);
