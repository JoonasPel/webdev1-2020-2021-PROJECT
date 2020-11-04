  const bcrypt = require('bcryptjs');
  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  function encrypter(plainpasswd) {
      //validate given password
      if (plainpasswd === '' || plainpasswd.length < 10) {
          return;
      }
      let hash = bcrypt.hashSync(plainpasswd, 10);
      return hash;
  }

  const userSchema = new Schema({
      name: {
          type: String,
          minlength: 1,
          maxlength: 50,
          required: true,
          trim: true
      },
      email: {
          type: String,
          required: true,
          unique: true,
          validate: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
      },
      password: {
          type: String,
          set: encrypter,
          required: true

      },
      role: {
          type: String,
          required: true,
          enum: ['admin', 'customer'],
          default: 'customer',
          set: v => v.toLowerCase(),
          trim: true
      }
  });


  /**
   * Compare supplied password with user's own (hashed) password
   *
   * @param {string} password
   * @returns {Promise<boolean>} promise that resolves to the comparison result
   */
  userSchema.methods.checkPassword = async function(password) {

      const isPasswordMatch = new Promise((resolve, reject) => {
          bcrypt.compare(password, this.password, function(err, result) {
              if (result === true) {
                  resolve(true);
              } else {
                  resolve(false);
              }
          });
      });
      return isPasswordMatch;
  };

  // Omit the version key when serialized to JSON
  userSchema.set('toJSON', { virtuals: false, versionKey: false });

  const User = new mongoose.model('User', userSchema);
  module.exports = User;