# 🪙 Multi-Owner Bank Account DApp

A decentralized Ethereum application (DApp) that simulates a multi-signature bank account system. Built with **Solidity**, **Hardhat**, and **Ethers.js**, and features a complete web frontend for interaction via MetaMask.

---

## 🚀 Features

- ✅ Create joint accounts with up to 4 owners  
- 💰 Deposit ETH into shared accounts  
- 📥 Request withdrawals (pending approval)  
- ✅ Approve withdrawals via multi-signature logic  
- 💸 Execute withdrawals once approved  
- 📜 Real-time event logging via Ethers.js  
- 🔐 Role-based access control and secure smart contract logic  
- 🧪 31 unit tests using Hardhat + Chai  

---

## 🧰 Tech Stack

| Layer           | Technology                            |
|------------------|----------------------------------------|
| Smart Contracts  | **Solidity (v0.8.18+)**                |
| Testing          | **Hardhat**, **Chai**, **Mocha**       |
| Frontend         | **HTML**, **JavaScript**, **Ethers.js**|
| Wallet           | **MetaMask**                          |
| Dev Blockchain   | **Hardhat Local Node**                |

---

## 🧪 Test Coverage

✅ **31 unit tests** ensure functionality and edge case protection:

- Account creation (1 to 4 owners)  
- Duplicate/invalid owners  
- Owner account limits  
- Deposits and withdrawals  
- Multi-owner approvals  
- Reentrancy-safe logic  
- Access control enforcement  

### Run all tests with:

```bash
npx hardhat test
