import express from 'express';
import cors from 'cors';
import { userRouter, checkUserRouter, pruposedOwnerAddressRouter } from './routes/userRoutes.js';
import { safeRouter, removeOwnerRouter, addOwnerRouter } from './routes/safeRoutes.js';
import { transactionRouter, pendingTransactionsRouter, approvedTransactionsRouter, updateTransactionRouter } from './routes/transactionRoutes.js';

const app = express();
const port = 3000;

app.use(cors()); // Allow requests from frontend
app.use(express.json());

app.use(`/createNewUser`, userRouter);
app.use('/createNewSafe', safeRouter);
app.use('/checkPruposedOwnerAddress', pruposedOwnerAddressRouter);
app.use('/checkOwnersAddress', checkUserRouter);
app.use('/removeOwnerAddress', removeOwnerRouter);
app.use('/addOwnerAddress', addOwnerRouter);
app.use('/addNewTransaction', transactionRouter);
app.use('/getAllPendingTransactions', pendingTransactionsRouter);
app.use('/getAllApprovedTransactions', approvedTransactionsRouter);
app.use('/updateTransactionStatus', updateTransactionRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});