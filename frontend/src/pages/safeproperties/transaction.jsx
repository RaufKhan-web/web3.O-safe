import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { Menu, X, Shield, CheckCheck } from 'lucide-react';
import Loading from '../../components/loading';
import MyContractABI from '../../mycontract.json';
import axios from 'axios';
import { ethers } from 'ethers';


// Side Menu Component
const SideMenu = ({ isOpen, onClose, contractAddress }) => {
    const navigate = useNavigate();

    const menuItems = [
        {
            icon: <Shield className="w-6 h-6" />,
            label: 'Remaining Transactions',
            path: '/dashboard/safe/transactions/remaining-transactions'
        },
        {
            icon: <CheckCheck className="w-6 h-6" />,
            label: 'Executed Transactions',
            path: '/dashboard/safe/transactions/executed-transactions'
        }
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40"
                    onClick={onClose}
                />
            )}
            <div
                className={`fixed top-0 left-0 w-64 h-full bg-teal-900 text-white 
        transform transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 border-b border-teal-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold truncate">Transaction Menu</h2>
                    <X
                        className="cursor-pointer"
                        onClick={onClose}
                    />
                </div>
                <nav className="mt-4">
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            onClick={() => {
                                const params = { contractAddress: contractAddress }
                                navigate(item.path, { state: params });
                                onClose();
                            }}
                            className="flex items-center p-3 hover:bg-teal-800 cursor-pointer transition"
                        >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );
};

// Main Safe Dashboard
const Transaction = () => {
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const location = useLocation();
    const { contractAddress } = location.state || {};
    const [isLoading, setIsLoading] = useState(true);
    const [destinationAddress, setDestinationAddress] = useState("");
    const [nickName, setNickName] = useState("");
    const [ethAmount, setETHAmount] = useState(null);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState([]);
    const transactionExecuted = false;
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Simulates loading for 3 seconds
        return () => clearTimeout(timer);
    }, []);

    const isValidAddress = (address) => {
        // Basic validation for Ethereum addresses
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    const handleBackgroundClick = () => {
        setIsError(false);
        setError([]);
    };

    const initiateTransaction = async (e) => {
        e.preventDefault();
        console.log(nickName);
        console.log(ethAmount);
        console.log(destinationAddress);
        const errors = [];
        if (nickName.length < 5 || nickName.length > 15) {
            errors.push(`Transaction nick name must be between 5 and 15 characters long: Nick Name Lenght(${nickName.length})`);
        }
        if (!isValidAddress(destinationAddress)) {
            alert('Invalid wallet address');
            return;
        }
        if (errors.length > 0) {
            setError(errors);
            setIsError(true);
        }
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, MyContractABI.abi, signer);
            const amount = ethers.utils.parseEther(ethAmount) // Convert ETH amount to Wei
            const transaction = await contract.submitTransaction(destinationAddress, amount, { value: amount });
            const receipt = await transaction.wait();
            const transactionid = receipt.events.find(e => e.event === "TransactionProposed")?.args.transactionId;
            const transactionId = parseInt(transactionid._hex, 16);
            console.log("Transaction ID:", transactionid.toString());
            const response = await axios.post("http://localhost:3000/addNewTransaction", {
                nickName,
                contractAddress,
                transactionExecuted,
                transactionId
            });
            if (response.status === 200) {
                alert(response.data.message);
                setNickName('');
                setDestinationAddress('');
            } else {
                setError(['transaction is faild']);
                setIsError(true);
            }
        }
        catch (error) {
            setError([error.message]);
            setIsError(true);
        }
    }

    if (isLoading) {
        return <Loading />;
    }

    const handleClick = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className={`${isError ? "opacity-50 pointer-events-none" : ""}`}>
                <header className="bg-teal-900 text-white p-4 flex justify-between items-center">
                    <button
                        onClick={() => setIsSideMenuOpen(true)}
                        className="p-2 bg-teal-700 rounded-md hover:bg-teal-600"
                    >
                        <Menu />
                    </button>
                    <h1 className="text-xl font-bold">Transaction Management Dashboard</h1>
                </header>

                <SideMenu
                    isOpen={isSideMenuOpen}
                    contractAddress={contractAddress}
                    onClose={() => setIsSideMenuOpen(false)}
                />
                <div className='flex flex-col justify-center gap-12 py-10 mt-12 items-center'>
                    <form className="flex flex-col gap-1 justify-start bg-white rounded-md p-6 shadow-lg shadow-teal-800  items-start w-auto">
                        <label className='text-teal-800 font-semibold opacity-90'>Enter Transaction Nick Name </label>
                        <input
                            type="text"
                            value={nickName}
                            onChange={(e) => setNickName(e.target.value)}
                            className="text-black border p-2 rounded-lg shadow-teal-800 shadow-lg w-80 mb-4"
                            placeholder='Min Len 5 Max Len 15'
                            required
                            minLength={5}
                            maxLength={15}
                        />

                        <label className='text-teal-800 font-semibold opacity-90'>Enter Recipient Address</label>
                        <input
                            type="text"
                            value={destinationAddress}
                            onChange={(e) => setDestinationAddress(e.target.value)}
                            className="text-black border p-2 rounded-lg shadow-teal-800 shadow-lg w-80 mb-4"
                            placeholder='Destination Ethereum Wallet Address'
                            required
                        />

                        <label className='text-teal-800 font-semibold opacity-90'>Enter Eth Amount</label>
                        <input
                            type="number"
                            value={ethAmount}
                            onChange={(e) => setETHAmount(e.target.value)}
                            className="text-black border p-2 rounded-lg shadow-teal-800 shadow-lg w-80 mb-4"
                            placeholder='Amount you want to Transfer'
                            required
                            minLength={5}
                            maxLength={15}
                        />

                        <button
                            onClick={initiateTransaction}
                            className='ease-in self-center p-2 mt-4 duration-300 rounded-md text-base w-auto h-auto font-semibold shadow-md bg-teal-800 hover:bg-opacity-50 hover:delay-150 hover:text-lg'
                        >
                            Initiate Transaction
                        </button>
                    </form>

                    <div className='flex flex-col justify-center items-center'>
                        <button onClick={handleClick} className='ease-in duration-300 text-white rounded-md text-base p-2 w-auto h-auto font-semibold shadow-md bg-teal-800 hover:delay-150 hover:text-lg'>
                            Back To The Safe Dashboard
                        </button>
                    </div>
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
    );
};


export default Transaction;
