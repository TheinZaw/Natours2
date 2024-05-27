const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');
const userSchema = mongoose.Schema({
   name: {
      type: String,
      require: [true, 'Please tell us user name'],
   },
   email: {
      type: String,
      require: [true, 'Please fill email address'],
      unique: true, //[true, 'Email already exists'],
      lowercase: true,
      validator: [validator.isEmail, 'Invalid email address!'],
   },
   photo: { type: String, default: 'default.jpg' },
   role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      lowercase: true,
      default: 'user',
   },
   password: {
      type: String,
      require: [true, 'Input password!'],
      minlength: 8, //[8, `Minimum password length should be 8 characters.`],
      select: false,
   },
   confirmPassword: {
      type: String,
      require: [true, 'Input conform password!'],
      validator: [
         function (v) {
            return v === this.confirmPassword;
         },
         'Password and confirm password must be the same.',
      ],
   },
   passwordChangedAt: Date,
   passwordResetToken: String,
   passwordResetExpires: Date,
   active: {
      type: Boolean,
      default: true,
      select: false,
   },
});
userSchema.pre('save', async function (next) {
   const user = this;
   if (!user.isModified('password')) return next();
   this.password = await bcrypt.hash(user.password, 12);
   this.confirmPassword = undefined;
});
userSchema.pre('save', async function (next) {
   if (!this.isModified('password') || this.isNew) return next();
   this.passwordChangedAt = Date.now();
});
userSchema.pre(/^find/, function (next) {
   this.find({ active: { $ne: false } });
   next();
});
userSchema.methods.correctPassword = async (candidatePwd, userPwd) => {
   return await bcrypt.compare(candidatePwd, userPwd);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
   if (this.passwordChangedAt) {
      const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
      return JWTTimestamp < changedTimestamp;
   }

   return false;
};
userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex');
   const genToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
   this.passwordResetToken = genToken;
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
   this.save({ validateBeforeSave: false });

   return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
