const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Aqui havia um erro difícil de pegar. Importei como "transactionModel",
// com "t" minúsculo. No Windows, isso não faz diferença. Mas como no Heroku
// o servidor é Linux, isso faz diferença. Gastei umas boas horas tentando
// descobrir esse erro :-/
const TransactionModel = require('../models/TransactionModel');

async function getByYearAndMonth(year, month) {
  return await TransactionModel.find({ year, month });
}

async function getByDescription(filter) {
  return await TransactionModel.find({ description: { $regex: filter } });
}

async function create(transaction) {
  const { year, month, day } = transaction;

  const dayStr = `${day}`.padStart(2, '0');
  const monthStr = `${month}`.padStart(2, '0');
  const yearStr = `${year}`.padStart(4, '0');
  const yearMonthDay = `${yearStr}-${monthStr}-${dayStr}`;

  const yearMonth = `${yearStr}-${monthStr}`;
  return await TransactionModel.create({
    ...transaction,
    yearMonth,
    yearMonthDay,
  });
}

async function update(id, transaction) {
  const { year, month, day } = transaction;

  const dayStr = `${day}`.padStart(2, '0');
  const monthStr = `${month}`.padStart(2, '0');
  const yearStr = `${year}`.padStart(4, '0');
  const yearMonthDay = `${yearStr}-${monthStr}-${dayStr}`;
  const yearMonth = `${yearStr}-${monthStr}`;
  delete transaction.type;
  delete transaction._id;

  transactionToUpdate = {
    ...transaction,
    yearMonth,
    yearMonthDay,
  };

  return await TransactionModel.findOneAndUpdate(
    { _id: id },
    transactionToUpdate,
    { new: true, upsert: false }
  );
}

async function deleteTransaction(id) {
  return await TransactionModel.findOneAndDelete({ _id: id });
}

const transactionService = {
  getByYearAndMonth,
  getByDescription,
  create,
  update,
  deleteTransaction,
};

module.exports = transactionService;
