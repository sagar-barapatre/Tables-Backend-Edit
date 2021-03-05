const mongoose = require('mongoose');

var schema = new mongoose.Schema({
  Date: {
    type: String,
  },
  Pricing: {
    type: String,
  },
  PickupState: {
    type: String,
  },
  PickupCity: {
    type: String,
  },
          DropState: {
            type: String,
          },
          DropCity: {
            type: String,
          },
          firstandlastname: {
            type: String,
          },
          emailID: {
            type: String,
          },
          extraMessages: {
            type: String,
          },
});

const Userdb = mongoose.model('userdb', schema);

module.exports = Userdb;