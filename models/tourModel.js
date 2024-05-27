const mongoose = require('mongoose');
const slugify = require('slug');
//const User = require('./userModel');

const tourSchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, 'A tour must have a name.'],
         unique: true,
         trim: true,
         minlength: [10, 'A tour name must have more or equal than 10 chars'],
         maxlength: [40, 'A tour name must have less or equal than 40 chars'],
      },
      slug: String,
      duration: {
         type: Number,
         required: [true, 'A Tour must have duration.'],
         min: [1, 'Too few day'],
         max: [
            14,
            'Too must days. Maximum duration ({VALUE}) should be less than 14.',
         ],
      },
      maxGroupSize: {
         type: Number,
         required: [true, 'A tour must have group size.'],
      },
      difficulty: {
         type: String,
         enum: {
            values: ['easy', 'medium', 'difficult'],
            message: '{VALUE} is not supported',
         },
         required: [true, 'A tour must have difficulty.'],
      },
      ratingsAverage: {
         type: Number,
         default: 4.5,
         min: [1, 'Rating must be above 1.0'],
         max: [5, 'Rating must be below 5.0'],
         //set: (val) => Math.round(val * 10) / 10,
         get: function (val) {
            return Math.round(val * 10) / 10;
         },
      },
      ratingQuantity: { type: Number, default: 0 },
      price: { type: Number, required: [true, 'A tour must have price'] },
      priceDiscount: {
         type: Number,
         validate: {
            validator: function (val) {
               return val < this.price;
            },
            message: 'Discount price must be less than actual price',
         },
      },
      summary: { type: String, trim: true },
      description: { type: String, trim: true },
      imageCover: {
         type: String,
         required: [true, 'A tour must have cover image.'],
      },
      images: [String],
      createdAt: { type: Date, default: Date.now(), select: false },
      startDates: [Date],
      secretTour: {
         type: Boolean,
         default: false,
      },
      startLocation: {
         type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
         },
         coordinates: [Number],
         address: String,
         description: String,
      },
      locations: [
         {
            type: { type: String, default: 'Point', enum: ['Point'] },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number,
         },
      ],
      guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],

      //Wrong properties in the lesson
      //reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Review' }],

      // comments: [{ body: String, date: Date }],
      // date: { type: Date, default: Date.now },
      // meta: {
      //    votes: Number,
      //    favs: Number,
      // },
   },
   {
      toJSON: { virtuals: true, getters: true },
      toObject: { virtuals: true },
   },
);
// function getRoundRatingsAverage(a) {
//    console.log(a);
//    return Math.round(a * 10) / 10;
// }
//Index creation
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//Virtual Properties (It is like database function)
tourSchema.virtual('durationWeeks').get(function () {
   return this.duration / 7;
});

//Mongoose also supports populating virtuals.//
// A populated virtual contains documents from another collection.
//Virtual Population to child referencing from parent document
tourSchema.virtual('tourReviews', {
   ref: 'Review',
   foreignField: 'tour',
   localField: '_id',
   //count: true,
});
// tourSchema.options.toJSON = {
//    transform: function (doc, ret, options) {
//       ret.id = ret._id;
//       delete ret._id;
//       delete ret.__v;
//       return ret;
//    },
// };
//Pre mongoose middleware ,run on before save() and create() function (it is like before trigger)
//insertMany()  is not included.

tourSchema.pre('save', function (next) {
   this.slug = slugify(this.name, { lower: true });
   next();
});

// tourSchema.pre('save', async function (next) {
//    const users = this.guides.map(async (x) => await User.findById(x));
//    this.guides = await Promise.all(users);
//    next();
// });

//Not working to display secret tour to true
tourSchema.pre(/^find/, function (next) {
   this.find({ secretTour: { $ne: true } });
   this.start = Date.now();

   next();
});
tourSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'guides',
      select:
         '-__v -passwordChangedAt -passwordResetToken -passwordResetExpires',
   });
   next();
});
tourSchema.post(/^find/, function (doc, next) {
   console.log(`Query took ${Date.now() - this.start} mill sec.`);

   this.find({ secretTour: { $ne: false } });
   this.start = Date.now();
   next();
});

// tourSchema.pre('aggregate', function (next) {
//    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//    console.log(this.pipeline());
//    next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
