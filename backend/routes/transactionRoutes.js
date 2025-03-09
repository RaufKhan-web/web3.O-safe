import { createTransaction, pendingTransactions, approvedTransactions, updateTransaction } from '../controllers/transactionController.js';
import express from 'express';
const transactionRouter = express.Router();
const pendingTransactionsRouter = express.Router();
const approvedTransactionsRouter = express.Router();
const updateTransactionRouter = express.Router();

transactionRouter.post('/', createTransaction);
pendingTransactionsRouter.post('/', pendingTransactions);
approvedTransactionsRouter.post('/', approvedTransactions);
updateTransactionRouter.post('/', updateTransaction);

export { transactionRouter, pendingTransactionsRouter, approvedTransactionsRouter, updateTransactionRouter };