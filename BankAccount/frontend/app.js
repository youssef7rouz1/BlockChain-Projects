// Global variables
let provider, signer, contract;
const deploymentPath = "deployment.json";

// Ethers v6 parse/format
const toWei = (eth) => ethers.parseEther(eth);
const fromWei = (wei) => ethers.formatEther(wei);

window.onload = async function () {
  try {
    // 1) Check if MetaMask is installed
    if (!window.ethereum) {
      alert("🦊 Please install MetaMask.");
      return;
    }

    // 2) Connect to MetaMask (BrowserProvider in Ethers v6)
    provider = new ethers.BrowserProvider(window.ethereum);

    // 3) Request accounts from MetaMask
    await provider.send("eth_requestAccounts", []);

    // 4) Get the signer
    signer = await provider.getSigner();

    // 5) Fetch contract deployment data
    const res = await fetch(deploymentPath);
    const deployment = await res.json();

    // 6) Initialize contract
    contract = new ethers.Contract(
      deployment.contract.address,
      deployment.contract.abi,
      signer
    );

    // 7) Show connected account
    const account = await signer.getAddress();
    document.getElementById("currentAccount").innerText = account;

    // 8) Attach event listeners
    attachEventListeners();

    // 9) Log success
    console.log("✅ Contract loaded:", await contract.getAddress());
  } catch (err) {
    alert("❌ Failed to initialize DApp: " + err.message);
    console.error(err);
  }
};

// =========================
// Event Logging Utility
// =========================
function log(msg) {
  const logBox = document.getElementById("eventLog");
  const entry = document.createElement("div");
  entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}

// =========================
// Spinner UX
// =========================
function showSpinner(btn) {
  btn.disabled = true;
  btn.dataset.oldText = btn.innerText;
  btn.innerText = "⏳ Working...";
}

function hideSpinner(btn) {
  btn.disabled = false;
  btn.innerText = btn.dataset.oldText;
}

// =========================
// Attach Contract Events
// =========================
function attachEventListeners() {
  contract.on("AccountCreated", (owners, id) => {
    log(`🧾 AccountCreated [ID: ${id}] by: ${owners.join(", ")}`);
  });

  contract.on("Deposit", (user, accountId, value) => {
    log(`💰 Deposit: ${fromWei(value)} ETH to Account ${accountId} by ${user}`);
  });

  contract.on("WithdrawRequested", (user, accountId, withdrawId, amount) => {
    log(`📥 WithdrawRequested: ${fromWei(amount)} ETH by ${user} (Account ${accountId}, Request ${withdrawId})`);
  });

  contract.on("WithdrawApproved", (approver, accountId, withdrawId, approvals) => {
    log(`✅ WithdrawApproved by ${approver} (Account ${accountId}, Request ${withdrawId}) - Approvals: ${approvals}`);
  });

  contract.on("Withdraw", (user, accountId, withdrawId, amount) => {
    log(`💸 Withdraw: ${fromWei(amount)} ETH by ${user} (Account ${accountId}, Request ${withdrawId})`);
  });
}

// =========================
// Connect MetaMask Button
// =========================
async function connectWallet() {
  try {
    await provider.send("eth_requestAccounts", []);
    const account = await signer.getAddress();
    document.getElementById("currentAccount").innerText = account;
    log(`🔗 Connected wallet: ${account}`);
  } catch (err) {
    alert("❌ Wallet connection failed: " + err.message);
  }
}

// =========================
// Create Account
// =========================
async function createAccount() {
  const btn = event.target;
  showSpinner(btn);
  try {
    const raw = document.getElementById("ownerAddresses").value.trim();
    const owners = raw.split(",").map(a => a.trim()).filter(Boolean);

    const tx = await contract.createAccount(owners);
    await tx.wait();

    alert("✅ Account created successfully!");
  } catch (err) {
    alert("❌ " + err.message);
  }
  hideSpinner(btn);
}

// =========================
// View All Owned Accounts
// (detailed: shows balance & owners for each)
async function viewAccounts() {
  const btn = event.target;
  showSpinner(btn);
  try {
    const list = document.getElementById("accountsList");
    const accounts = await contract.getAccounts();
    list.innerHTML = "";

    if (accounts.length === 0) {
      list.innerHTML = "<li>No accounts found</li>";
      hideSpinner(btn);
      return;
    }

    for (const id of accounts) {
      const balance = await contract.getBalance(id);
      const owners = await contract.getOwners(id);
      const li = document.createElement("li");
      li.innerText = `🆔 ${id} | 💰 ${fromWei(balance)} ETH | 👥 ${owners.join(", ")}`;
      list.appendChild(li);
    }

    log(`📊 Loaded ${accounts.length} account(s)`);
  } catch (err) {
    alert("❌ " + err.message);
  }
  hideSpinner(btn);
}

// =========================
// Deposit ETH
// =========================
async function deposit() {
  const btn = event.target;
  showSpinner(btn);
  try {
    const id = document.getElementById("depositAccountId").value.trim();
    const amount = document.getElementById("depositAmount").value.trim();

    const tx = await contract.deposit(id, { value: toWei(amount) });
    await tx.wait();

    alert("✅ Deposit complete");
  } catch (err) {
    alert("❌ " + err.message);
  }
  hideSpinner(btn);
}

// =========================
// Request Withdraw
// =========================
async function requestWithdraw() {
  const btn = event.target;
  showSpinner(btn);
  try {
    const id = document.getElementById("requestAccountId").value.trim();
    const amount = document.getElementById("requestAmount").value.trim();

    const tx = await contract.requestWithdraw(id, toWei(amount));
    await tx.wait();

    alert("✅ Withdraw request submitted");
  } catch (err) {
    alert("❌ " + err.message);
  }
  hideSpinner(btn);
}

// =========================
// Approve Withdraw
// =========================
async function approveWithdraw() {
  const btn = event.target;
  showSpinner(btn);
  try {
    const id = document.getElementById("approveAccountId").value.trim();
    const withdrawId = document.getElementById("approveWithdrawId").value.trim();

    const tx = await contract.approveWithdraw(id, withdrawId);
    await tx.wait();

    alert("✅ Approval successful");
  } catch (err) {
    alert("❌ " + err.message);
  }
  hideSpinner(btn);
}

// =========================
// Execute Withdraw
// =========================
async function withdraw() {
  const btn = event.target;
  showSpinner(btn);
  try {
    const id = document.getElementById("withdrawAccountId").value.trim();
    const withdrawId = document.getElementById("withdrawId").value.trim();

    const tx = await contract.withdraw(id, withdrawId);
    await tx.wait();

    alert("✅ Withdrawal completed");
  } catch (err) {
    alert("❌ " + err.message);
  }
  hideSpinner(btn);
}

// =========================
// Get Account Info
// (balance, owners, pending withdrawals)
// =========================
async function getAccountInfo() {
  const btn = event.target;
  showSpinner(btn);
  try {
    const id = document.getElementById("balanceAccountId").value.trim();

    const balance = await contract.getBalance(id);
    const owners = await contract.getOwners(id);
    const pending = await contract.getPendingWithdrawals(id);

    document.getElementById("accountInfo").innerText = `
🆔 Account ID: ${id}
💰 Balance: ${fromWei(balance)} ETH
👥 Owners: ${owners.join(", ")}
⏳ Pending Withdrawals: ${pending.join(", ")}
    `;
  } catch (err) {
    alert("❌ " + err.message);
  }
  hideSpinner(btn);
}

// =========================
// (NEW) Fetch Balance Only
// =========================
async function fetchBalance() {
  try {
    const accountIdStr = document.getElementById("balanceAccountIdSolo").value.trim();
    const balance = await contract.getBalance(accountIdStr);
    document.getElementById("balanceResult").innerText = fromWei(balance);
  } catch (err) {
    alert("Error fetching balance: " + err.message);
  }
}

// =========================
// (NEW) Fetch Owners
// =========================
async function fetchOwners() {
  try {
    const accountIdStr = document.getElementById("ownersAccountId").value.trim();
    const owners = await contract.getOwners(accountIdStr);

    const ownersList = document.getElementById("ownersResult");
    ownersList.innerHTML = ""; // clear old results

    owners.forEach(owner => {
      const li = document.createElement("li");
      li.innerText = owner;
      ownersList.appendChild(li);
    });
  } catch (err) {
    alert("Error fetching owners: " + err.message);
  }
}

// =========================
// (NEW) Fetch Approvals
// =========================
async function fetchApprovals() {
  try {
    const accountIdStr = document.getElementById("approvalsAccountId").value.trim();
    const withdrawIdStr = document.getElementById("approvalsWithdrawId").value.trim();

    const approvals = await contract.getApprovals(accountIdStr, withdrawIdStr);
    document.getElementById("approvalsResult").innerText = approvals.toString();
  } catch (err) {
    alert("Error fetching approvals: " + err.message);
  }
}

// =========================
// (NEW) Get My Accounts
// =========================
async function fetchMyAccounts() {
  try {
    const accountIds = await contract.getAccounts();

    const myAccountsList = document.getElementById("myAccountsResult");
    myAccountsList.innerHTML = ""; // clear

    if (accountIds.length === 0) {
      myAccountsList.innerHTML = "<li>No accounts found</li>";
      return;
    }

    accountIds.forEach(id => {
      const li = document.createElement("li");
      li.innerText = `Account ID: ${id}`;
      myAccountsList.appendChild(li);
    });
  } catch (err) {
    alert("Error fetching your accounts: " + err.message);
  }
}
