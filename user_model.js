'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
{
  username: "fcc_test",
  description: "test",
  duration: 60,
  date: "Mon Jan 01 1990",
  _id: "5fb5853f734231456ccb3b05"
}
*/
let userSchema = Schema({
  username: { type: String, required : true},
  // description: { type: String, required : true},
  // duration: { type: Number, required : false},
  // date: Date
});

let exerciseSchema = Schema({
  userId:  { type: String, required : true},
  description: String,
  duration: Number,
  date: Date
});


module.exports = 
  {
    userSchema : userSchema,
    exerciseSchema: exerciseSchema
  }