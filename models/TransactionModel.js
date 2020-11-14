const mongoose = require('mongoose');

let schema = mongoose.Schema({
  description: { type: String, required: true },
  value: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true },
  year: { type: Number, required: true, min: 2000 },
  month: { type: Number, required: true, min: 1, max: 12 },
  day: { type: Number, required: true, min: 1, max: 31 },
  yearMonth: { type: String, required: true },
  yearMonthDay: { type: String, required: true },
  type: { type: String, required: true },
});

const TransactionModel = mongoose.model('transaction', schema);

module.exports = TransactionModel;
