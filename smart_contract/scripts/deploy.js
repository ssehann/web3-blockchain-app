const main = async () => {
    //  create a contract factory for the Transactions: deploy new instances of a smart contract
    const transactionsFactory = await hre.ethers.getContractFactory("Transactions");
    // deploys the contract to the blockchain: returns a promise that resolves to the deployed contract instance
    const transactionsContract = await transactionsFactory.deploy();
    // waits until the contract deployment transaction is mined and confirmed
    await transactionsContract.deployed();
    // logs the address of the deployed contract = where your contract is located on the blockchain
    console.log("Transactions deployed to: ", transactionsContract.address);
  };
  
  // start the deployment process
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
  
  runMain();

// how deployment process works:
// 1. Contract Compilation and Artifacts: when you run Hardhat compilation command (npx hardhat compile),
// smart contract code (Transactions.sol) is compile into artifacts which include bytecode and ABI
// 2. Hardhat Runtime Environment (HRE): deployment script then uses HRE to access the compiled contract artifacts
// 3. Contract Deployment: deploy method on the contract factory sends a transaction to deploy the contract to the blockchain
// 4. After deployment, you get an instance of the deployed contract, which allows you to interact with it on the blockchain.
