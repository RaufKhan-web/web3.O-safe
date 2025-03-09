import PrevNavigate from "../../../components/prevNavigat"
import { useState, useEffect } from "react";
import Loading from '../../../components/loading';
import { useLocation } from "react-router-dom";
import MyContractABI from '../../../mycontract.json';
import axios from 'axios';
import { ethers } from 'ethers';

const TransactionDetails = () => {
    const location = useLocation();
    const { contractAddress, transactionId } = location.state || {};
    const [owners, setOwners] = useState([]);
    const [transactionDetail, setTransactionDetail] = useState([]);
    const [walletSigner, setWalletSigner] = useState(null);
    const [mainContract, setMainContract] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eventDetails, setEventDetails] = useState({
        currentThreshold: 0,
    });

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                // Connect to Ethereum provider (e.g., MetaMask)
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                setWalletSigner(signer);
                await provider.send("eth_requestAccounts", []);
                // Create contract instance
                const contract = new ethers.Contract(contractAddress, MyContractABI.abi, provider);
                setMainContract(contract);

                // Fetch owners
                const [threshold, fetchedOwners, fetchTransactionDetail] = await Promise.all([
                    contract.threshold(),
                    contract.getOwners(),
                    contract.getTransaction(transactionId)
                ]);

                setEventDetails({
                    currentThreshold: threshold.toNumber(),
                });
                setOwners(fetchedOwners);
                setTransactionDetail(fetchTransactionDetail);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };
        if (window.ethereum) {
            fetchOwners();
        } else {
            setError("Ethereum provider not found. Please install MetaMask.");
            setIsLoading(false);
        }
    }, [contractAddress]);

    const transactionConfirmation = async () => {
        try {
            const contract = new ethers.Contract(contractAddress, MyContractABI.abi, walletSigner);
            const tx = await contract.confirmTransaction(transactionId);
            await tx.wait();
            setTransactionDetail(await mainContract.getTransaction(transactionId));

        }
        catch (err) {
            setError(err.message);
        }
    }
    const releaseAmount = async () => {
        try {
            const contract = new ethers.Contract(contractAddress, MyContractABI.abi, walletSigner);
            const tx = await contract.executeTransaction(transactionId);
            await tx.wait();
            setTransactionDetail(await mainContract.getTransaction(transactionId));
            console.log(transactionDetail[2])
            await axios.post(`http://localhost:3000/updateTransactionStatus`, { contractAddress, transactionId });
        }
        catch (err) {
            setError(err.message);
        }
    }

    if (isLoading) {
        return <Loading />;
    }
    if (error) return <div>Error: {error}</div>;
    return (
        <div className="flex flex-col ">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <PrevNavigate />
                <h2 className="text-2xl font-bold mb-4 text-teal-800 pl-12">Transaction Details</h2>
                <p>Check and Approved the transaction, Once Approvel Votes meet the Treshold Any One of Owner's can release the Payment.</p>
            </div>
            <div className="flex flex-col justify-center py-10 w-full gap-6 items-center">
                <div className="flex flex-col justify-center items-center gap-2 w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <h2 className="text-2xl font-bold">Gnosis Safe Owners</h2>
                    <ul className="bg-white rounded-md shadow-md px-10 py-2">
                        {owners.map((owner, index) => (
                            <li key={index} className="owner-address">
                                {owner}
                            </li>
                        ))}
                    </ul>
                </div>
                {transactionDetail[2] == false && (
                    <div className="flex flex-row justify-center items-center gap-4 w-1/2 py-6 px-10 rounded-md shadow-md bg-black bg-opacity-80">
                        <div className="flex flex-col justify-center items-center gap-4 w-10/12 bg-teal-700 rounded-md shadow-md ">
                            <div className="p-2">
                                <h2 className="text-lg font-bold">Gnosis Safe Treshold</h2>
                                <p className="bg-white rounded-md shadow-md p-2">{eventDetails.currentThreshold}</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-4 w-10/12 bg-teal-700 rounded-md shadow-md ">
                            <div className="flex flex-col justify-center items-center p-2">
                                <h2 className="text-lg font-bold ">Required Owner's Confirmation</h2>
                                <button onClick={transactionConfirmation} className="ease-in-out duration-500 font-medium bg-white p-1 rounded-md shadow-md hover:bg-black hover:bg-opacity-50 hover:text-white hover:text-lg">
                                    Confirmation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Transaction Detail */}
                <div className="w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <h2 className="text-base font-bold text-black mb-4">Recepient Address: {transactionDetail[0]}</h2>
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <p><strong>Amount:</strong> {ethers.utils.formatEther(transactionDetail[1]).toString()}</p>
                        <p><strong>Release Status:</strong> {transactionDetail[2] == false ? "False" : "True"}</p>
                        <p><strong>Confirmation Status:</strong> {parseInt(transactionDetail[3], 16)}</p>
                    </div>
                </div>
                {/* Release Amount */}
                {transactionDetail[2] == false && (
                    <div className="w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                        <h2 className="text-base font-bold text-black mb-4">Once Treshold Meets Any Owner Release Amount by Clicking Release </h2>
                        <button onClick={releaseAmount} className="ease-in-out duration-500 font-medium bg-white p-1 rounded-md shadow-md hover:bg-black hover:bg-opacity-50 hover:text-white hover:text-lg">
                            Release Amount
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TransactionDetails;