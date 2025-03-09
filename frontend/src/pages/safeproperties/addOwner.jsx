import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PrevNavigate from "../../components/prevNavigat";
import { useLocation } from "react-router-dom";
import MyContractABI from '../../mycontract.json';
import Loading from '../../components/loading';
import axios from 'axios';

const AddOwner = () => {
    const location = useLocation();
    const { contractAddress } = location.state || {};
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [owners, setOwners] = useState([]);
    const [walletSigner, setWalletSigner] = useState(null);
    const [proposedAddress, setProposedAddress] = useState('');
    const [mainContract, setMainContract] = useState(null);
    const [eventDetails, setEventDetails] = useState({
        eventPurpose: '',
        eventStatus: 0,
        isDeadlineActive: false,
        eventDeadline: 0,
        votesFor: 0,
        votesAgainst: 0
    });

    const EVENT_STATUS = {
        0: 'No Active Event',
        1: 'Pending',
        2: 'Successful',
        3: 'Failed'
    };

    useEffect(() => {
        const fetchContractData = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                setWalletSigner(signer);
                await provider.send("eth_requestAccounts", []);
                const contract = new ethers.Contract(contractAddress, MyContractABI.abi, provider);
                setMainContract(contract);

                const [
                    fetchedOwners,
                    purpose,
                    status,
                    deadlineActive,
                    deadline,
                    votesForCount,
                    votesAgainstCount
                ] = await Promise.all([
                    contract.getOwners(),
                    contract.eventPurpose(),
                    contract.eventStatus(),
                    contract.isDeadlineActive(),
                    contract.eventDeadline(),
                    contract.votesFor(),
                    contract.votesAgainst()
                ]);

                setEventDetails({
                    eventPurpose: purpose,
                    eventStatus: status,
                    isDeadlineActive: deadlineActive,
                    eventDeadline: new Date(deadline.toNumber() * 1000).toLocaleString(),
                    votesFor: votesForCount.toNumber(),
                    votesAgainst: votesAgainstCount.toNumber()
                });
                setOwners(fetchedOwners);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        if (window.ethereum) {
            fetchContractData();
        } else {
            setError("Ethereum provider not found. Please install MetaMask.");
            setIsLoading(false);
        }
    }, [contractAddress]);

    const initiateAddOwner = async () => {
        try {
            // Check if user exists in the system
            const response = await axios.post(`http://localhost:3000/checkPruposedOwnerAddress`, { proposedAddress });
            if (!response.status === 200) {
                setError("This address is not a part of the system");
                return;
            }

            const contract = new ethers.Contract(contractAddress, MyContractABI.abi, walletSigner);
            const tx = await contract.initiateAddOwner(proposedAddress);
            await tx.wait();

            setProposedAddress(mainContract.proposedAddress());
            alert(proposedAddress);

            // Setup event listener for successful addition
            contract.on("EventStatusChanged", async (status) => {
                if (status === 2) { // Successful
                    //Update database
                    await axios.post('http://localhost:3000/addOwnerAddress', {
                        contractAddress,
                        ownerAddress: proposedAddress
                    });
                }
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const voteOnEvent = async (approve) => {
        try {
            const contract = new ethers.Contract(contractAddress, MyContractABI.abi, walletSigner);
            const tx = await contract.voteForEvent(approve);
            await tx.wait();

            // Update vote counts
            const [votesFor, votesAgainst] = await Promise.all([
                mainContract.votesFor(),
                mainContract.votesAgainst()
            ]);

            setEventDetails(prev => ({
                ...prev,
                votesFor: votesFor.toNumber(),
                votesAgainst: votesAgainst.toNumber()
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col gap-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <PrevNavigate />
                <h2 className="text-2xl font-bold mb-4 text-teal-800 pl-12">Add Owner</h2>
                <p>Add a new owner to your Gnosis Safe.</p>
            </div>

            <div className="flex flex-col p-4 justify-center w-full gap-6 items-center">
                {/* Owners Section */}
                <div className="flex flex-col justify-center items-center gap-2 w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <h2 className="text-2xl font-bold text-white">Current Owners</h2>
                    <ul className="bg-white rounded-md shadow-md px-10 py-2">
                        {owners.map((owner, index) => (
                            <li key={index} className="owner-address">{owner}</li>
                        ))}
                    </ul>
                </div>

                {/* Event Status */}
                <div className="w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Event Status</h2>
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <p><strong>Purpose:</strong> {eventDetails.eventPurpose || 'No current event'}</p>
                        <p><strong>Status:</strong> {EVENT_STATUS[eventDetails.eventStatus]}</p>
                    </div>
                </div>

                {/* Add Owner Form */}
                <div className="w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Add New Owner</h2>
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <input
                            type="text"
                            placeholder="Enter Owner Address"
                            value={proposedAddress}
                            onChange={(e) => setProposedAddress(e.target.value.toLowerCase())}
                            className="w-full px-3 py-2 border rounded-md mb-4"
                        />
                        <button
                            onClick={initiateAddOwner}
                            className="w-full bg-teal-700 text-white py-2 rounded-md hover:bg-teal-800"
                        >
                            Initiate Add Owner
                        </button>
                    </div>
                </div>

                {/* Voting Section */}
                {eventDetails.eventStatus === 1 && (
                    <>
                        <div className="w-1/2 py-6 px-12 rounded-md shadow-md bg-black bg-opacity-80 flex gap-4">
                            <div className="w-1/2 bg-teal-700 rounded-md p-4">
                                <h3 className="text-xl font-bold text-white mb-2">Vote For</h3>
                                <div className="bg-white p-2 rounded-md">
                                    <p className="text-center text-2xl font-bold">{eventDetails.votesFor}</p>
                                    <button
                                        onClick={() => voteOnEvent(true)}
                                        className="w-full bg-green-500 text-white py-2 rounded-md mt-2"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                            <div className="w-1/2 bg-teal-700 rounded-md p-4">
                                <h3 className="text-xl font-bold text-white mb-2">Vote Against</h3>
                                <div className="bg-white p-2 rounded-md">
                                    <p className="text-center text-2xl font-bold">{eventDetails.votesAgainst}</p>
                                    <button
                                        onClick={() => voteOnEvent(false)}
                                        className="w-full bg-red-500 text-white py-2 rounded-md mt-2"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* propose add Owner Address */}
                        <div className="w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                            <h2 className="text-2xl font-bold text-white mb-4">Proposed Address</h2>
                            <div className="bg-white p-4 rounded-md shadow-md">
                                <p> {proposedAddress}</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Deadline Information */}
                <div className="flex flex-row justify-center items-center gap-6 w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <p className="bg-white p-2 rounded-md shadow-md">
                        <strong>Deadline Active:</strong> {eventDetails.isDeadlineActive ? 'Yes' : 'No'}
                    </p>
                    {eventDetails.isDeadlineActive && (
                        <p className="bg-white p-2 rounded-md shadow-md">
                            <strong>Event Deadline:</strong> {eventDetails.eventDeadline}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddOwner;