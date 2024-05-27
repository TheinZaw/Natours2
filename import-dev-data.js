const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./models/tourModel');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');

dotenv.config({ path: `${__dirname}/config.env` });

const db = process.env.DATABASE.replace(
   '<PASSWORD>',
   process.env.DATABASE_PASSWORD,
).replace('<USERNAME>', process.env.DATABASE_USERNAME);

const importTourData = JSON.parse(
   fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf-8'), //tours-simple.json
);

const importUserData = JSON.parse(
   fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf-8'), //tours-simple.json
);

const importReviewData = JSON.parse(
   fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf-8'), //tours-simple.json
);

const importData = async () => {
   try {
      //console.log(tourJson);
      await Tour.create(importTourData);
      await User.create(importUserData, { validateBeforeSave: false });
      await Review.create(importReviewData);
      console.log('Data successful loaded.');
      process.exit();
   } catch (err) {
      console.log(`error : ${err}`);
   }
};
const deleteData = async () => {
   try {
      //log(mongoose);
      await Tour.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();

      console.log('Existing  data  are successful deleted.');
      process.exit();
   } catch (err) {
      console.log(err);
   }
};
if (process.argv[2] === '--import') {
   // log(process.argv[2]);
   importData();
} else if (process.argv[2] === '--delete') {
   //log(process.argv[2]);
   deleteData();
}
mongoose
   .connect(db, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: true,
      maxPoolSize: 10,
      useNewUrlParser: true,
   })
   .then(() => {
      //console.log(conn.connection._connectionString);
      console.log('DB connection is successfully connected.');
   })
   .catch((err) => {
      console.log('Unable to connect db server.' + err);
   });

//console.log(process.argv);
