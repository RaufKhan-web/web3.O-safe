import { query } from "../config/db.js";

const createTransaction = async (req, res) => {
    const { nickName, contractAddress, transactionExecuted, transactionId } = req.body;

    try {
        const result = await query(
            `
    INSERT INTO transactions (
      "transaction_name", 
      "contract_address",
      "transaction_executed",
      "transaction_id"
    ) VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [
            nickName,
            contractAddress,
            transactionExecuted,
            transactionId]);
        console.log(result);
        return res.status(200).send({ result, message: "New Transaction created successfully" });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ success: false, message: 'Internal server error' });
    }
}

const approvedTransactions = async (req, res) => {
    const { contractAddress } = req.body;
    try {
        const result = await query(
            `
            SELECT * FROM transactions 
            WHERE contract_address = $1 
            AND transaction_executed = TRUE`,
            [contractAddress]);
        console.log(result);
        return res.status(200).send({ result, message: "Approved Transactions fetched successfully" });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ success: false, message: 'Internal server error' });
    }
}

const pendingTransactions = async (req, res) => {
    const { contractAddress } = req.body;
    try {
        const result = await query(
            `
            SELECT * FROM transactions 
            WHERE contract_address = $1 
            AND transaction_executed = FALSE`,
            [contractAddress]);
        console.log(result);
        return res.status(200).send({ result, message: "Pending Transactions fetched successfully" });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ success: false, message: 'Internal server error' });
    }
}

const updateTransaction = async (req, res) => {
    const { contractAddress, transactionId } = req.body;
    try {
        const result = await query(
            `
            UPDATE transactions
            SET transaction_executed = TRUE
            WHERE contract_address = $1
            AND transaction_id = $2
            RETURNING *`,
            [contractAddress, transactionId]);
        console.log(result);
        return res.status(200).send({ result, message: "Transaction updated successfully" });

    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ success: false, message: 'Internal server error' });
    }

}

export { createTransaction, pendingTransactions, approvedTransactions, updateTransaction };