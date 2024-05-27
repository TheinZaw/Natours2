module.exports = (fn) => {
   return (req, res, next) => {
      //fn(req, res, next).catch(next);
      fn(req, res, next).catch((err) => {
         //console.log(`Error in catchAsync : ${err.message}`);
         next(err);
      });
   };
};
