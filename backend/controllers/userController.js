import { query } from "../config/db.js";

const createUser = async (req, res) => {
    const { address } = req.body;

    try {
        // Validate wallet address
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).send({ success: false, message: 'Invalid wallet address' });
        }

        // Check if wallet is already registered
        const existingUser = await query('SELECT * FROM users WHERE account_address = $1', [address]);

        if (existingUser.length > 0) {
            const result = await query(
                `SELECT * FROM safes WHERE safe_owners_addresses @> $1::jsonb`,
                [JSON.stringify([address])]
            );
            console.log(result);
            return res.status(200).send({ result, message: 'your safe' });
        } else {
            // Save wallet to database
            await query('INSERT INTO users (account_address) VALUES ($1)', [address]);
            return res.status(200).send({ success: true, message: 'Account created successfully' });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ success: false, message: 'Internal server error' });
    }
};

const checkUser = async (req, res) => {
    const { ownersAddress } = req.body;
    console.log(ownersAddress);
    if (!Array.isArray(ownersAddress)) {
        return res.status(400).send({ error: "Invalid input format. Expecting an array of wallet addresses." });
    }
    try {
        const result = await query(
            `WITH input_addresses AS (
                SELECT account_address
                FROM unnest($1::text[]) AS account_address
            ),
            missing_addresses AS (
                SELECT account_address
                FROM input_addresses
                WHERE account_address NOT IN (
                    SELECT account_address FROM users
                )
            )
            SELECT account_address FROM missing_addresses;`,
            [ownersAddress]
        );

        // if (!result || !result.rows || result.rows.length === 0) {
        //     console.log('No result or no rows found in query');
        //     console.log(result);
        //     return res.status(404).json({ error: 'No missing addresses found' });
        // }

        const missingAddresses = result.map(item => item.account_address);
        console.log('Missing addresses:', missingAddresses);

        return res.status(200).json({
            missingAddresses,
        });
    } catch (error) {
        console.error('Error during query execution:', error);
        return res.status(500).json({ error: 'Query execution failed' });
    }


};

const checkOwner = async (req, res) => {
    const { proposedAddress } = req.body;
    console.log(proposedAddress);
    try {
        // Validate wallet address
        if (!proposedAddress || !/^0x[a-fA-F0-9]{40}$/.test(proposedAddress)) {
            return res.status(400).send({ success: false, message: 'Invalid wallet address' });
        }

        // Check if wallet is already registered
        const existingUser = await query('SELECT * FROM users WHERE account_address = $1', [proposedAddress]);

        if (existingUser.length > 0) {
            return res.status(200).send({ success: true, message: 'This account is a part of system' });
        }
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ success: false, message: 'Internal server error' });
    }

}

export { createUser, checkUser, checkOwner };