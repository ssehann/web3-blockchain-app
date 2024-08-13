// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

// like a class - define the state variables and functions that make up the logic of your smart contract
contract Transactions { 
    uint256 transactionCount; // state variable #1: number of transactions, for monitoring how active the contract is

    // log the details of each transaction that external consumers (i.e. a front-end app or other contracts) can listen to
    event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);
  
    struct TransferStruct { // like an object, for internal data management and state representation
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] transactions; // state variable #2: store all the transactions recorded by the contract

    // public function that allows anyone to add a transaction to the blockchain
    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public {
        transactionCount += 1;
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));
        // contain info from special global variables like 'msg' and 'block' objects

        // emit is what actually makes the transfer
        // emit an event in transaction log - can be accessed by external tools, but it does not affect the contract's state
        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    // public view function allows anyone to retrieve all transactions stored in memory
    // by default, view functions are read-only and memory is not accessible
    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    // no need for memory keyword since return type is uint256
    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }

    // how this blockchain works:
    // 1. storing data: transactions are recorded on the blockchain through the addToBlockchain
        // each transaction is stored in the array, and its details are logged via the Transfer event
    // 2. retrieving data: users can interact with this data by calling view functions
    // 3. logging + emitting events: users can listen for updates and changes without having to constantly query the blockchain

    // two primary data locations in Solidity:
    // storage: where all contract's state variables are stored - persistent and resides on blockchain
    // memory: temporary and non-persistent on the blockchain, erased between (or at the end of) function executions
    // - transactionCount is a uint256 (a basic type) stored in memory, no need for memory keyword in getTransactionCount
    // - but TransferStruct[] is an Array (complex type) stored in either storage or memory, you need to specify where it resides
    // when you return it from a function, so you need the memory keyword in getAllTransactions
        // 1. Solidity needs to allocate space in memory for the array to be returned to the caller.
        // By specifying memory, you indicate that this allocation is temporary and only needed for the duration of the function call.
        // 2. When the function is called, Solidity will copy the array data from storage to memory so that it can be returned to the caller
    // - also in the event emitter addToBlockchain(), you need the memory keyword for params of complex data types like strings/arrays
    // to indicate that they're local, temporary variables that don't need to be saved on the blockchain
        // Solidity will copy these variables into memory so that the function can operate on them without affecting the original data stored in storage

}