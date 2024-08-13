require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/QQ4QR9n4BQG9IpLPXVMr6rEj4ZA8P4C3',
      accounts: ['a948d8068e558918b3d0828a8a0bfb6684d5008e066760a37e9b56031370ec70'],
    },
  },
};