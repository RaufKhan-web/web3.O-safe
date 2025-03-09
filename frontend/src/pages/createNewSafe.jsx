import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MyContractABI from '../mycontract.json';
import { useNavigate } from 'react-router-dom';
import Loading from "../components/loading";
import PrevNavigate from '../components/prevNavigat';
import axios from 'axios';

export default function CreateNewSafe() {
    const [safeName, setSafeName] = useState('');
    const [treshold, setTreshhold] = useState('');
    const [ownersAddress, setOwnersAddress] = useState([]); // Array of owner addresses
    const [ownerInput, setOwnerInput] = useState(''); // Input for new owner address
    const [contractAddress, setContractAddress] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Simulates loading for 1 seconds
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loading />;
    }


    const addOwner = (e) => {
        e.preventDefault();

        // Validate address
        if (!isValidAddress(ownerInput)) {
            alert('Invalid wallet address');
            return;
        }

        // Add new owner to the array
        setOwnersAddress([...ownersAddress, ownerInput.toLowerCase()]);
        setOwnerInput(''); // Clear the input field
    };

    const deleteOwner = (index) => {
        setOwnersAddress(ownersAddress.filter((_, i) => i !== index));
    };

    const isValidAddress = (address) => {
        // Basic validation for Ethereum addresses
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    const deployContract = async (e) => {
        e.preventDefault();

        const errors = [];

        if (parseInt(treshold) <= 0) {
            errors.push(`Treshold must be greater than zero: Value of Treshold(${treshold})`);
        }
        if (ownersAddress.length < parseInt(treshold)) {
            errors.push(`Number of owners must be equal to or greater than the treshold: Number of Owners(${ownersAddress.length})`);
        }
        if (safeName.length < 5 || safeName.length > 15) {
            errors.push(`Safe name must be between 5 and 15 characters long: Name Lenght(${safeName.length})`);
        }
        if (errors.length > 0) {
            setError(errors);
            setIsError(true);
        }
        else {
            const response = await axios.post("http://localhost:3000/checkOwnersAddress", { ownersAddress });
            if (response.status === 200) {
                const missingLength = response.data.missingAddresses.length;
                if (missingLength > 0) {
                    for (var i = 0; i < missingLength; i++) {
                        errors.push(`Missing Address, not is the part of system: ${response.data.missingAddresses[i]} `)
                    }
                    setError(errors);
                    setIsError(true);
                }
                else {
                    try {
                        const provider = new ethers.providers.Web3Provider(window.ethereum);
                        const signer = provider.getSigner();
                        const factory = new ethers.ContractFactory(
                            MyContractABI.abi,
                            MyContractABI.data.bytecode, // Changed from MyContractABI.data.bytecode
                            signer
                        );

                        const contract = await factory.deploy(ownersAddress, treshold);
                        await contract.deployed();
                        const contractAddress = await contract.address;
                        console.log(contractAddress);

                        setContractAddress(contractAddress);

                        const response = await axios.post("http://localhost:3000/createNewSafe", {
                            safeName,
                            treshold,
                            ownersAddress,
                            contractAddress
                        });

                        if (response.status === 200) {
                            alert(response.data.message);
                            setTreshhold('');
                            setSafeName('');
                            setOwnersAddress([]);
                            navigate("/welcome");
                        } else {
                            alert('Contract creation failed');
                        }
                    } catch (error) {
                        setError(error.message);
                        setIsError(true);
                    }
                }
            }
            else {
                setError("Error checking owners address:", response.status);
                setIsError(true);
            }
        }
    };
    const handleBackgroundClick = () => {
        setIsError(false);
        setError([]);
    };

    return (
        <div className='flex justify-center items-center min-h-screen bg-teal-800 '>
            <div className={`${isError ? "opacity-50 pointer-events-none" : ""}`}>
                <div className='flex flex-col gap-4 p-4 px-8 justify-center items-center shadow-lg shadow-gray-300 bg-gray-300 rounded-lg w-[500px] h-auto'>
                    <div className='flex justify-center items-center mt-4 text-3xl font-bold text-teal-800'>
                        <h1>Enter Safe Details</h1>
                    </div>

                    <form className="flex flex-col gap-1 justify-start items-start w-[400px]">
                        <label className='text-teal-800 font-semibold opacity-90'>Enter Safe Name</label>
                        <input
                            type="text"
                            value={safeName}
                            onChange={(e) => setSafeName(e.target.value)}
                            className="text-black border p-2 rounded-lg shadow-teal-800 shadow-lg w-full mb-4"
                            placeholder='Min Len 5 Max Len 15'
                            required
                            minLength={5}
                            maxLength={15}
                        />

                        <label className='text-teal-800 font-semibold opacity-90'>Treshold value</label>
                        <input
                            type="number"
                            value={treshold}
                            onChange={(e) => setTreshhold(e.target.value)}
                            className="text-black border p-2 rounded-lg shadow-teal-800 shadow-lg w-full mb-4"
                            placeholder='Treshold must be greater than zero'
                            required
                        />

                        <label className='text-teal-800 font-semibold opacity-90'>Enter Owner Address</label>
                        <input
                            type="text"
                            value={ownerInput}
                            onChange={(e) => setOwnerInput(e.target.value)}
                            className="text-black border p-2 rounded-lg shadow-teal-800 shadow-lg w-full mb-4"
                            placeholder='Owners list greater or equal to treshold'
                        />
                        <button
                            className='ease-in duration-300 self-center rounded-md text-normal w-28 h-8 font-semibold shadow-md bg-teal-800 hover:bg-opacity-50 hover:w-32 hover:h-9 hover:delay-150 hover:text-lg'
                            onClick={addOwner}
                        >
                            Add Owner
                        </button>

                        {ownersAddress.length > 0 && (
                            <ul >
                                {ownersAddress.map((address, index) => (
                                    <li className='flex flex-row pb-2 gap-1' key={index}>
                                        {address}
                                        <button
                                            className='ease-in duration-300 mx-2 rounded-md text-normal w-6 h-6 font-semibold shadow-md bg-teal-800 hover:bg-opacity-50 hover:w-8 hover:h-7 hover:delay-150 hover:text-lg'
                                            onClick={() => deleteOwner(index)}
                                        >
                                            X
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <button
                            onClick={deployContract}
                            className='ease-in self-center mt-4 duration-300 rounded-md text-normal w-32 h-8 font-semibold shadow-md bg-teal-800 hover:bg-opacity-50 hover:w-36 hover:h-9 hover:delay-150 hover:text-lg'
                        >
                            Deploy Contract
                        </button>
                    </form>
                </div>
                <PrevNavigate />
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
}
