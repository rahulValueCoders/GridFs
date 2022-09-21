const mongoose = require("mongoose");
const logData = new mongoose.Schema({
 UserName: {
  type: String,
  required: true,

 },
 fileName: {
  type: String,
  required: true,
 },
 typeOfFIle: {
  type: String,
  required: true,
 }
});


const fileLogs = mongoose.model("logData", logData);

module.exports = fileLogs;
