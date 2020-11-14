const express = require('express');
const transactionRouter = express.Router();
const transactionService = require('../services/transactionService');

transactionRouter.get('/', async (req, res) => {
  try {
    let items = [];

    if (req.query.filter) {
      const { filter } = req.query;
      items = await transactionService.getByDescription(filter);
    } else {
      const { period } = req.query;
      const [year, month] = period.split('-');

      if (!period || !year || !month) {
        throw new Error(
          'É necessário informar o parametro "period", cujo o valor deve estar no formato yyyy-mm'
        );
      }

      items = await transactionService.getByYearAndMonth(year, month);
    }

    res.send({ length: items.length, transactions: items });
  } catch (error) {
    res.json({ error: error.message || 'Erro na rota GET /' });
  }
});

transactionRouter.post('/', async (req, res) => {
  try {
    const newTransaction = await transactionService.create(req.body);
    res.json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro na rota POST /' });
  }
});

transactionRouter.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const newTransaction = await transactionService.update(id, req.body);
    res.json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro na rota PUT /' });
  }
});

transactionRouter.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const resp = await transactionService.deleteTransaction(id);
    res.json(resp);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro na rota DELETE /' });
  }
});

module.exports = transactionRouter;
