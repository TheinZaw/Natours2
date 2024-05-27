const multer = require('multer'); //For File upload
const sharp = require('sharp'); //Image procesing
const path = require('path');

const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
      return cb(null, true);
   }
   cb(new AppError('Not an image! Please upload only image.', 400), false);
};
// const uploader = multer({ dest: './public/img/users/' });
const uploader = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadTourImages = uploader.fields([
   { name: 'imageCover', maxCount: 1 },
   { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
   if (!req.files.imageCover || !req.files.images) return next();
   //console.log(req.files.imageCover[0].buffer);

   req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
   let fullFileName = path.join('./public/img/tours/', req.body.imageCover);
   console.log(fullFileName);
   await sharp(req.files.imageCover[0].buffer)
      .resize({ width: 2000, height: 1333 })
      .toFormat('jpeg')
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(fullFileName);

   req.body.images = [];
   await Promise.all(
      req.files.images.map(async (img, i) => {
         console.log(img);
         const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
         fullFileName = path.join('./public/img/tours/', fileName);
         await sharp(img.buffer)
            .resize({ width: 2000, height: 1333 })
            .toFormat('jpeg')
            .jpeg({ quality: 90, mozjpeg: true })
            .toFile(fullFileName);

         req.body.images.push(fileName);
      }),
   );
   next();
});

exports.aliasTopTours = async (req, res, next) => {
   req.query.limit = 5;
   req.query.sort = '-averageRating,price';
   req.query.fields = 'name,price,ratingAverage,summary,difficulty';
   next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'tourReviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
   const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
         $group: {
            _id: { $toUpper: '$difficulty' },
            numRating: { $sum: '$ratingQuantity' },
            num: { $sum: 1 },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
         },
      },
      {
         $sort: { avgPrice: -1 }, //' {avgPrice: -1}
      },
   ]);
   res.status(200).json({
      status: 'Success',
      data: {
         tour: stats,
      },
   });
});
//Unwind aggregate Pipeline
exports.getMonthlyPlan = catchAsync(async (req, res) => {
   const year = req.params.year * 1;
   const plan = await Tour.aggregate([
      {
         $unwind: '$startDates',
      },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`),
            },
         },
      },
      {
         $group: {
            _id: { $month: '$startDates' },

            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' },
         },
      },
      {
         $addFields: {
            monthNo: '$_id',
            short_month: {
               $switch: {
                  branches: [
                     { case: { $eq: ['$_id', 1] }, then: 'Jan' },
                     { case: { $eq: ['$_id', 2] }, then: 'Feb' },
                     { case: { $eq: ['$_id', 3] }, then: 'Mar' },
                     { case: { $eq: ['$_id', 4] }, then: 'Apr' },
                     { case: { $eq: ['$_id', 5] }, then: 'May' },
                     { case: { $eq: ['$_id', 6] }, then: 'Jun' },
                     { case: { $eq: ['$_id', 7] }, then: 'Jul' },
                     { case: { $eq: ['$_id', 8] }, then: 'Aug' },
                     { case: { $eq: ['$_id', 9] }, then: 'Sep' },
                     { case: { $eq: ['$_id', 10] }, then: 'Oct' },
                     { case: { $eq: ['$_id', 11] }, then: 'Nov' },
                     { case: { $eq: ['$_id', 12] }, then: 'Dec' },
                  ],
                  default: 'NoMonth',
               },
            },
         },
      },
      {
         $project: {
            _id: 0,
         },
      },
      {
         $sort: {
            numTourStarts: -1,
         },
      },
      { $limit: 5 },
   ]);
   res.status(200).json({
      status: 'Success',
      results: plan.length,
      data: {
         tour: plan,
      },
   });
});

// '/tours-within/:distance/center/:latlng/unit/:unit'
// 'tours-within/233/center/-40,50/unit/mi'
//'/tours-within/233/center/13.7380576,100.4601607/unit/mi'
exports.getToursWithin = catchAsync(async (req, res, next) => {
   const { distance, latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');
   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
   //if mile unit , to get 3d map distance in geomap,we need to b divided by 3963.2 ratio, if kilometer, divided by 6378.1
   if (!lat || !lng) {
      return next(
         new AppError(
            'Please provide latitude and longitude in format lat,lng',
         ),
      );
   }
   console.log(distance, lat, lng, unit, radius);
   const query = {
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
   };
   const tours = await Tour.find(query);

   res.status(200).json({
      status: 'success',
      result: tours.length,
      data: { document: tours },
   });
});

exports.getDistances = catchAsync(async (req, res, next) => {
   const { latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');
   const multi = unit === 'mi' ? 0.000621371 : 0.001;
   //if mile unit , to get 3d map distance in geomap,we need to b divided by 3963.2 ratio, if kilometer, divided by 6378.1
   if (!lat || !lng) {
      return next(
         new AppError(
            'Please provide latitude and longitude in format lat,lng',
         ),
      );
   }
   console.log(lat, lng, unit);

   const geoNearAgg = [
      {
         $geoNear: {
            near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
            distanceField: 'distance',
            distanceMultiplier: multi,
         },
      },
      { $project: { name: 1, distance: 1, summary: 1 } },
   ];
   const distances = await Tour.aggregate(geoNearAgg);
   res.status(200).json({
      status: 'success',
      result: distances.length,
      data: { document: distances },
   });
});
