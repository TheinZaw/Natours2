const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
exports.deleteOne = (Model) =>
   catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id); //.orFail(() => Error('Not found'));
      if (!doc) {
         return next(new AppError('No document Found with that Id.', 404));
      }
      res.status(204).json({
         status: 'Success',
         message: `The document has been deleted.`,
         data: null,
      });
      console.log('Delete document success.');
   });
exports.updateOne = (Model) => {
   return catchAsync(async (req, res, next) => {
      let param1 = req.params.id;
      const doc = await Model.findByIdAndUpdate({ _id: param1 }, req.body, {
         runValidators: true,
         new: true,
      });

      if (!doc) {
         return next(new AppError('No document found to update ', 404));
      }

      res.status(200).json({
         status: 'Success',
         data: {
            Document: doc,
         },
      });
   });
};
exports.createOne = (Model) => {
   return catchAsync(async (req, res, next) => {
      const doc = await Model.create(req.body);
      if (!doc) {
         return next(new AppError('No document created. ', 404));
      }

      res.status(201).json({
         status: 'success',
         data: { document: doc },
      });

      console.log('Save success ');
   });
};

exports.getOne = (Model, popOptions) =>
   catchAsync(async (req, res, next) => {
      let query = Model.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);

      const doc = await query;

      if (!doc) {
         return next(new AppError('No document Found!!!', 404));
      }

      res.status(200).json({
         status: 'success',
         data: { document: doc },
      });
   });

exports.getAll = (Model) =>
   catchAsync(async (req, res, next) => {
      let fil = {};
      if (req.params.tourId) fil = { tour: req.params.tourId };

      const apiFeatureObj = new APIFeatures(Model.find(fil), req.query)
         .filter()
         .sort()
         .select();

      //const tours =
      await apiFeatureObj.pagination();

      const doc = await apiFeatureObj.query;
      if (apiFeatureObj.queryString.page) {
         if (apiFeatureObj.skipNum >= doc.length)
            throw new Error('This page does not exists.');
      }
      if (!doc || doc.length <= 0) {
         return next(new AppError('No document Found!!!', 404));
      }
      res.status(200).json({
         status: 'success',
         results: doc.length,
         data: { document: doc },
      });
   });
