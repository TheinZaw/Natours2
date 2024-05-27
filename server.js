const mongoose = require('mongoose');

const app = require('./app');

process.on('unhandledRejection', (err) => {
   console.log('Error', err.name, err.message);
});

const db = process.env.DATABASE.replace(
   '<PASSWORD>',
   process.env.DATABASE_PASSWORD,
).replace('<USERNAME>', process.env.DATABASE_USERNAME);
mongoose
   .connect(db, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
   })
   .then(() => {
      console.log('DB connection is successfully connected.');
   })
   .catch((err) => {
      console.log('Unable to connect db server.' + err);
      process.exit(0);
   });

//(4) Server Starting
const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`App running on port ${port}`);
});
