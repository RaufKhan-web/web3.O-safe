// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GnosisSafe {
    // Owners and threshold
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;
    uint256 public length_of_transaction_id;

    // Add-owner, Remove-owner and updateTreshold process
    address public proposedAddress;
    string public eventPurpose;
    string public currentStatus;
    uint256 public proposedTreshold;
    enum EventStatus { Null, Pending, Successful, Failed, Draw}
    mapping(EventStatus => string) public statusToString;
    EventStatus public eventStatus;
    uint256 public eventDeadline;
    mapping(address => bool) public addOwnerVotes;
    uint256 public votesFor;
    uint256 public votesAgainst;
    bool public isDeadlineActive = false;

    // Transaction structure
    struct Transaction {
        address destination;
        uint256 amount;
        /*bytes data;*/
        bool executed;
        uint256 confirmations;
    }
    

    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    uint256 public transactionCount;

    // Events
    event SafeInitialized(address[] owners, uint256 threshold);
    event EventStatusChanged(string status);
    event TransactionProposed(uint256 indexed transactionId, address indexed proposer, address destination, uint256 amount/*, bytes data*/);
    event TransactionConfirmed(uint256 indexed transactionId, address indexed owner);
    event TransactionExecuted(uint256  indexed transactionId, address indexed executor, address destination, uint256 amount);
    event EventInitiated(address indexed ownerEvent, string status, string purpose);
    event EventForUpdateTresholdInitiated(uint256 tresholdEvent, string status, string purpose);
    event OwnerVoted(address indexed owner, string approve, string purpose);
    
    constructor(address[] memory _owners, uint256 _threshold) {
        require(_owners.length > 0, "Owners required");
        require(_threshold > 0 && _threshold <= _owners.length, "Invalid threshold");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        threshold = _threshold;
        statusToString[EventStatus.Null] = "Null";
        statusToString[EventStatus.Pending] = "Pending";
        statusToString[EventStatus.Successful] = "Successful";
        statusToString[EventStatus.Failed] = "Failed";
        statusToString[EventStatus.Draw] = "Draw";

        emit SafeInitialized(owners, threshold);
    }

    function submitTransaction(address destination, uint256 amount /*,bytes calldata data*/) payable public onlyOwner {
        require(msg.value == amount, "invalid amount");
        uint256 transactionId = transactionCount++;
        length_of_transaction_id = transactionId;
        transactions[transactionId] = Transaction({
            destination: destination,
            amount: amount,
            /* data: data,*/
            executed: false,
            confirmations: 0
        });

        emit TransactionProposed(transactionId, msg.sender, destination, amount/*, data*/);
        confirmTransaction(transactionId);
    }

    function confirmTransaction(uint256 transactionId) public onlyOwner {
        Transaction storage txn = transactions[transactionId];

        require(length_of_transaction_id >= transactionId, "This transaction has been never made");
        require(!txn.executed, "Transaction already executed");
        require(!confirmations[transactionId][msg.sender], "Transaction already confirmed");

        confirmations[transactionId][msg.sender] = true;
        txn.confirmations++;

        emit TransactionConfirmed(transactionId, msg.sender);
    }

    function executeTransaction(uint256 transactionId) external onlyOwner {
        Transaction storage txn = transactions[transactionId];

        require(txn.confirmations >= threshold, "Not enough confirmations");
        require(!txn.executed, "Transaction already executed");
        
        (bool success, ) = payable(txn.destination).call{value: txn.amount}("");
        require(success, "Transaction failed");
        txn.executed = true;

        emit TransactionExecuted(transactionId, msg.sender, txn.destination, txn.amount);
    }
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier eventNotActive() {
        require(eventStatus == EventStatus.Null, "Event already active");
        _;
    }

    modifier eventActive() {
        require(eventStatus == EventStatus.Pending, "No active event process");
        _;
    }

    function initiateAddOwner(address _proposedAddOwner) external onlyOwner eventNotActive {
        require(_proposedAddOwner != address(0), "Invalid owner address");
        require(!isOwner[_proposedAddOwner], "Already an owner");
        proposedAddress = _proposedAddOwner;
        eventPurpose = "addowner";
        eventProcessBegin();
    }

    function initiateRemoveOwner(address _proposedRemoveOwner) external onlyOwner eventNotActive {
        require(isOwner[_proposedRemoveOwner], "Address is not an owner");
        require(owners.length > 2, "Alert this is the last owner of this safe");
        proposedAddress = _proposedRemoveOwner;
        eventPurpose = "removeowner";
        eventProcessBegin();
    }

    function initiateUpdateTreshold(uint256 _proposedNewTreshold) external onlyOwner eventNotActive {
        require(_proposedNewTreshold <= owners.length,"propsed treshold value is greater then the number of owners");
        require(_proposedNewTreshold > 0,"propsed treshold value must be grater then zero");
        proposedTreshold = _proposedNewTreshold;
        eventPurpose = "updatetreshold";
        eventProcessBegin();

    }

    function eventProcessBegin() internal {
        eventStatus = EventStatus.Pending;
        currentStatus = statusToString[eventStatus];
        eventDeadline = block.timestamp + 180; // 24-hour voting period
        isDeadlineActive = true;
        votesFor = 0;
        votesAgainst = 0;

        if(keccak256(abi.encodePacked(eventPurpose)) == keccak256(abi.encodePacked("updatetreshold"))){
            emit EventForUpdateTresholdInitiated(proposedTreshold, currentStatus, eventPurpose);
        }
        else{
            emit EventInitiated(proposedAddress, currentStatus, eventPurpose);
        }
    }

    modifier checkEventDeadline(bool approve){
        if (isDeadlineActive && block.timestamp >= eventDeadline){
            _;
            resetEventProcess();
        }
        else{
            _;
            voteExecute(approve);
        }
    }

    function voteForEvent(bool approve) external onlyOwner eventActive checkEventDeadline(approve){
        
    }

    function voteExecute(bool approve) internal {
    require(!addOwnerVotes[msg.sender], "Already voted");

        addOwnerVotes[msg.sender] = true;

        if (approve) {
            votesFor++;
            emit OwnerVoted(msg.sender, "approved", eventPurpose);
        } else {
            votesAgainst++;
            emit OwnerVoted(msg.sender, "reject", eventPurpose);
        }

        // Check if voting is decided
        if(keccak256(abi.encodePacked(eventPurpose)) == keccak256(abi.encodePacked("addowner"))){
            if (votesFor > owners.length / 2) {
                finalizeAddOwner(true);
            } else if (votesAgainst > owners.length / 2) {
                finalizeAddOwner(false);
            }
            else if(((votesFor + votesAgainst) == owners.length) && (votesFor == votesAgainst)){
                eventStatus = EventStatus.Draw;
                currentStatus = statusToString[eventStatus];
                emit EventInitiated(proposedAddress, currentStatus, eventPurpose);
                resetEventProcess();
            }
        }
        else if(keccak256(abi.encodePacked(eventPurpose)) == keccak256(abi.encodePacked("removeowner"))){
             if (votesFor > owners.length / 2) {
                finalizeRemoveOwner(true);
            } else if (votesAgainst > owners.length / 2) {
                finalizeRemoveOwner(false);
            }
             else if(((votesFor + votesAgainst) == owners.length) && (votesFor == votesAgainst)){
                eventStatus = EventStatus.Draw;
                currentStatus = statusToString[eventStatus];
                emit EventInitiated(proposedAddress, currentStatus, eventPurpose);
                resetEventProcess();
            }
        }
        else{
            if (votesFor > owners.length / 2) {
                finalizeUpdateTrehold(true);
            } else if (votesAgainst > owners.length / 2) {
                finalizeUpdateTrehold(false);
            }
             else if(((votesFor + votesAgainst) == owners.length) && (votesFor == votesAgainst)){
                eventStatus = EventStatus.Draw;
                currentStatus = statusToString[eventStatus];
                emit EventForUpdateTresholdInitiated(proposedTreshold, currentStatus, eventPurpose);
                resetEventProcess();
            }
        }
    }

    function finalizeAddOwner(bool success) internal eventActive {
        if (success) {
            isOwner[proposedAddress] = true;
            owners.push(proposedAddress);
            eventStatus = EventStatus.Successful;
            currentStatus = statusToString[eventStatus];
        } 
        else {
            eventStatus = EventStatus.Failed;
        }
        emit EventInitiated(proposedAddress, currentStatus, eventPurpose);
        // Reset state
        resetEventProcess();
    }

    function finalizeRemoveOwner(bool success) internal eventActive {
        if (success) {
             // Find the index of the owner in the owners array
            uint256 index;
            for (uint256 i = 0; i < owners.length; i++) {
                if (owners[i] == proposedAddress) {
                    index = i;
                    break;
                }
            }
            // Remove the owner from the array
            owners[index] = owners[owners.length - 1];
            owners.pop();
            // Remove the owner from the mapping
            isOwner[proposedAddress] = false;
            threshold -= 1;
        eventStatus = EventStatus.Successful;
        currentStatus = statusToString[eventStatus];
        }
        else {
            eventStatus = EventStatus.Failed;
            currentStatus = statusToString[eventStatus];
        }
        emit EventInitiated(proposedAddress, currentStatus, eventPurpose);
        // Reset state
        resetEventProcess();
    }

    function finalizeUpdateTrehold(bool success) internal eventActive{
        if(success){
            threshold = proposedTreshold;
            eventStatus = EventStatus.Successful;
            currentStatus = statusToString[eventStatus];
        }
        else{
            eventStatus = EventStatus.Failed;
            currentStatus = statusToString[eventStatus];
        }
        emit EventForUpdateTresholdInitiated(proposedTreshold, currentStatus, eventPurpose);
        // Reset state
        resetEventProcess();
    }

    function resetEventProcess() internal {
        proposedAddress = address(0);
        proposedTreshold = 0;
        eventStatus = EventStatus.Null;
        currentStatus = statusToString[eventStatus];
        eventPurpose = "";
        isDeadlineActive = false;
        votesFor = 0;
        votesAgainst = 0;

        // Reset individual votes
        for (uint256 i = 0; i < owners.length; i++) {
            addOwnerVotes[owners[i]] = false;
        }
        emit EventStatusChanged(currentStatus);
    }

    // Utility functions
    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransaction(uint256 transactionId)
        external
        view
        returns (
            address destination,
            uint256 amount,
            // bytes memory data,
            bool executed,
            uint256 confirmations
        )
    {
        Transaction storage txn = transactions[transactionId];
        return (txn.destination, txn.amount, /*txn.data,*/ txn.executed, txn.confirmations);
    }

}