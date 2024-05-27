const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
   {
      review: { type: String, required: [true, 'Review can not be empty.'] },
      rating: {
         type: Number,
         min: [1, 'Rating must be above 1.0'],
         max: [5, 'Rating must be below 5.0'],
      },
      createdAt: { type: Date, default: Date.now },
      tour: {
         type: mongoose.Schema.ObjectId,
         ref: 'Tour',
         required: [true, 'Review must belong to tour.'],
      },
      user: {
         type: mongoose.Schema.ObjectId,
         ref: 'User',
         required: [true, 'Review must belong to user.'],
      },
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'user',
      select: 'name photo',
   });
   next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
   const stats = await this.aggregate([
      { $match: { tour: tourId } },
      {
         $group: {
            _id: '$tour',
            nRating: { $sum: 1 },
            avgRating: { $avg: '$rating' },
         },
      },
   ]);
   if (stats.length > 0) {
      console.log(tourId, stats[0]);
      await Tour.findByIdAndUpdate(tourId, {
         ratingsAverage: stats[0].avgRating,
         ratingQuantity: stats[0].nRating,
      });
   } else {
      await Tour.findByIdAndUpdate(tourId, {
         ratingsAverage: 0,
         ratingQuantity: 0,
      });
   }
};

reviewSchema.post('save', async function (docs) {
   //This point to current review
   // error Review.calcAverageRatings(this.tour);
   console.log('Document Info', docs);
   await docs.constructor.calcAverageRatings(docs.tour);
});

reviewSchema.post(/^findOneAnd/, async function (docs) {
   await docs.constructor.calcAverageRatings(docs.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
