class AppError extends Error {
   //This operation error
   constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error';
      this.isOperation = true;

      Error.captureStackTrace(this, this.constructor);
   }
}
module.exports = AppError;
