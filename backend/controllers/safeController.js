import { query } from "../config/db.js";


const createSafe = async (req, res) => {
    const { safeName, treshold, ownersAddress, contractAddress } = req.body;

    try {
        const result = await query(
            `
    INSERT INTO safes (
      "safe_name", 
      "threshold", 
      "safe_owners_addresses", 
      "contract_address"
    ) VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [
            safeName,
            treshold,
            JSON.stringify(ownersAddress),
            contractAddress]);
        console.log(result);
        return res.status(200).send({ result, message: "Safe created successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error creating safe" });
    }
}

const removeOwner = async (req, res) => {
    const { contractAddress, ownerAddress } = req.body;
    console.log('Contract Address:', contractAddress);
    console.log('Owner Address:', ownerAddress);

    try {
        // Add validation for required fields
        if (!contractAddress || !ownerAddress) {
            return res.status(400).json({
                message: "Contract address and owner address are required"
            });
        }

        // Fetch the existing safe data
        const safeResult = await query(
            `SELECT safe_owners_addresses FROM safes WHERE contract_address = $1`,
            [contractAddress]
        );

        // Add debug logging
        console.log('Safe Result:', safeResult);

        // Check if safe exists with more detailed error handling
        if (!safeResult) {
            return res.status(404).json({
                message: "Safe not found for contract address: " + contractAddress
            });
        }
        // Extract the first row (object) from the array
        const firstRow = safeResult[0];

        // Access the 'safe_owners_addresses' property from the first row
        const currentOwners = firstRow.safe_owners_addresses;

        // Get current owners array
        console.log('Current Owners:', currentOwners);

        // Check if owner exists (note: this logic seems backwards for a remove operation)
        if (currentOwners.includes(ownerAddress.toLowerCase())) {
            const updatedOwners = currentOwners.filter(address => address !== ownerAddress);
            console.log('Updated Owners:', updatedOwners);
            const updateResult = await query(
                `UPDATE safes 
                 SET safe_owners_addresses = $1 
                 WHERE contract_address = $2 
                 RETURNING *`,
                [JSON.stringify(updatedOwners), contractAddress]
            );
            console.log('Update Result:', updateResult);

            if (!updateResult) {
                throw new Error('Failed to update safe owners');
            }

            return res.status(200).json({
                message: "Owner remove successfully",
                data: {
                    contractAddress,
                    updatedOwners: updateResult[0].safe_owners_addresses
                }
            });
        }

        return res.status(400).json({
            message: "Address is not an owner of this safe"
        });


    } catch (error) {
        console.error('Error in removeOwner:', error);
        return res.status(500).json({
            message: "Error removing owner",
            error: error.message
        });
    }
};

const addOwner = async (req, res) => {
    // Add owner logic here
    const { contractAddress, ownerAddress } = req.body;
    console.log('Contract Address:', contractAddress);
    console.log('Owner Address:', ownerAddress);

    try {
        // Fetch the existing safe data
        const safeResult = await query(
            `SELECT safe_owners_addresses FROM safes WHERE contract_address = $1`,
            [contractAddress]
        );

        // Add debug logging
        console.log('Safe Result:', safeResult);

        // Check if safe exists with more detailed error handling
        if (!safeResult) {
            return res.status(404).json({
                message: "Safe not found for contract address: " + contractAddress
            });
        }
        // Extract the first row (object) from the array
        const firstRow = safeResult[0];

        // Access the 'safe_owners_addresses' property from the first row
        const currentOwners = firstRow.safe_owners_addresses;

        // Get current owners array
        console.log('Current Owners:', currentOwners);

        // Check if owner exists (note: this logic seems backwards for a remove operation)
        if (currentOwners.includes(ownerAddress.toLowerCase())) {
            return res.status(400).json({
                message: "Address is already an owner of this safe"
            });

        }

        // Add the new owner (note: this should probably be removing the owner instead)
        const updatedOwners = [...currentOwners, ownerAddress.toLowerCase()];
        console.log('Updated Owners:', updatedOwners);
        const updateResult = await query(
            `UPDATE safes 
             SET safe_owners_addresses = $1 
             WHERE contract_address = $2 
             RETURNING *`,
            [JSON.stringify(updatedOwners), contractAddress]
        );
        console.log('Update Result:', updateResult);

        if (!updateResult) {
            throw new Error('Failed to update safe owners');
        }

        return res.status(200).json({
            message: "Owner added successfully",
            data: {
                contractAddress,
                updatedOwners: updateResult[0].safe_owners_addresses
            }
        });


    } catch (error) {
        console.error('Error in removeOwner:', error);
        return res.status(500).json({
            message: "Error removing owner",
            error: error.message
        });
    }
};


export { createSafe, removeOwner, addOwner };