import PrevNavigate from "../../../components/prevNavigat"
import { useState, useEffect } from "react";
import Loading from '../../../components/loading';
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RemainingTransactions = () => {
    const location = useLocation();
    const { contractAddress } = location.state || {};
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isError, setIsError] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    var trans_details = null;

    const handleBackgroundClick = () => {
        setIsError(false);
        setError(null);
    };
    useEffect(() => {
        const fetchAllPendingTransactions = async () => {
            try {
                const response = await axios.post("http://localhost:3000/getAllPendingTransactions", { contractAddress });

                if (response.status === 200) {
                    trans_details = Array.isArray(response.data.result)
                        ? response.data.result
                        : [response.data.result];
                    setTransactions(trans_details);
                    setIsLoading(false);
                } else {
                    console.error("Error fetching transactions:", response.status);
                    setError("Error fetching transactions");
                    setIsLoading(false);
                }

            } catch (err) {
                setError(err.message);
            }
        };
        if (contractAddress) fetchAllPendingTransactions();
    }, [contractAddress]);



    if (isLoading) {
        return <Loading />;
    }
    return (
        <div className="flex flex-col gap-10">
            <div className={`${isError ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <PrevNavigate />
                    <h2 className="text-2xl font-bold mb-4 text-teal-800 pl-12">Pending Trasactions</h2>
                    <p>Manage your pending transactions that require confirmations from multiple owners.</p>
                </div>
                <div className="flex flex-col justify-center py-12 h-auto w-full items-center">
                    {transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                            <div onClick={() => {
                                const params = { contractAddress: contractAddress, transactionId: transaction.transaction_id }
                                navigate('/dashboard/safe/transactions/transaction-details', { state: params });
                            }}
                                key={index} className="w-1/2 py-2 px-12 rounded-md shadow-md bg-teal-700 cursor-pointer hover:bg-black hover:bg-opacity-75">
                                <h3 className="text-xl font-bold text-white mb-2">{transaction.transaction_name}</h3>
                                <div className="bg-white p-1 rounded-md shadow-md">
                                    <p><strong>Status: </strong>{transaction.transaction_executed ? ("Approved") : ("Pending")}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No pending transactions found</div>
                    )}
                </div>
            </div>
            {isError && (
                <div onClick={handleBackgroundClick} className="fixed inset-0 flex items-center justify-center z-50">
                    <div onClick={(e) => e.stopPropagation()} className='flex flex-col justify-center gap-2 p-4 items-center w-auto h-auto bg-gray-300 shadow-red-600 rounded-lg shadow-lg mt-4 text-3xl font-bold'>
                        <h1 className='font-bold text-red-600'>Error</h1>

                        <ul className='flex flex-col justify-center items-center w-auto gap-2'>
                            {error.map((error, index) => (
                                <li className="font-semibold content-center opacity-90 text-xl" key={index}>{index + 1}: {error}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

        </div>
    )
}

export default RemainingTransactions;