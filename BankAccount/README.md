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

## 📁 Project Structure

```bash
BankAccount/
├── contracts/           # Solidity smart contracts
│   └── BankAccount.sol
├── frontend/            # Web frontend files
│   ├── index.html
│   ├── app.js
│   └── deployment.json
├── scripts/             # Deployment scripts
│   └── deploy.js
├── test/                # Unit tests
│   └── bankAccount.t.js
├── hardhat.config.js    # Hardhat config
└── README.md

---

## ⚙️ Getting Started Locally

1️⃣ Clone the repository

```bash
git clone https://github.com/youssef7rouz1/BlockChain-Projects.git
cd BlockChain-Projects
```

2️⃣ Install dependencies

```bash
npm install
```

3️⃣ Run the local blockchain

```bash
npx hardhat node
```

📌 Keep this terminal running in the background

4️⃣ Deploy the contract (in a **new terminal**)

```bash
npx hardhat run scripts/deploy.js --network localhost
```

✅ This writes the contract's address and ABI into `frontend/deployment.json`

5️⃣ Launch the frontend

```bash
cd frontend
npx live-server
```

Then visit: http://127.0.0.1:8080

🦊 Make sure MetaMask is connected to the **Hardhat network** (Chain ID: `31337`)

## 🌐 MetaMask Setup (Local Network)

Open MetaMask → Add Network and enter:

```yaml
Network Name: Hardhat
New RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

🔑 Import a private key from the following command:

```bash
npx hardhat accounts
```

---

## 🛡️ Security Considerations

✅ Checks-Effects-Interactions pattern  
✅ Reentrancy-safe ETH transfers  
✅ Strict access control using modifiers  
✅ Multi-owner approval before withdrawal

---

## 🧠 Learnings & Highlights

- Full-stack DApp design (Smart Contract ↔ Frontend)  
- Solidity logic for **multi-signature withdrawal approval**  
- Frontend integration with **Ethers.js v6**  
- Writing and organizing **30+ unit tests** with Hardhat  
- Simulating local network and MetaMask testing

---



