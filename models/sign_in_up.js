const mongoose = require("mongoose");
const UserInformation = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
 
  },
  pass: {
    type: String,
    required: true,
    }
});


const userInfo = mongoose.model("UserInformation", UserInformation);

module.exports = userInfo;
