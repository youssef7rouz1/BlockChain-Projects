// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.7;

contract BankAccount {
    //Creating events
    event Deposit(
        address indexed user,
        uint256 indexed accountId,
        uint256 value,
        uint256 timestamp
    );

    event WithdrawRequested(
        address indexed user,
        uint256 indexed accountId,
        uint256 indexed withdrawId,
        uint256 amount,
        uint256 timestamp
    );

    event WithdrawApproved(
        address indexed approver,
        uint256 indexed accountId,
        uint256 indexed withdrawId,
        uint256 approvals,
        uint256 timestamp
    );

    event Withdraw(
        address indexed user,
        uint256 indexed accountId,
        uint256 indexed withdrawId,
        uint256 amount,
        uint256 timestamp
    );

    event AccountCreated(
        address[] owners,
        uint256 indexed id,
        uint256 timestamp
    );

    struct WithdrawRequest {
        address user;
        uint256 amount;
        uint256 approvals;
        mapping(address => bool) ownerApprovals;
        bool approved;
    }

    struct Account {
        address[] owners;
        uint256 balance;
        mapping(uint256 => WithdrawRequest) WithdrawRequests;
    }

    mapping(uint256 => Account) accounts;
    mapping(address => uint256[]) userAccounts;
    mapping(uint256 => bool) public accountExists;

    uint256 nextAccountId;
    uint256 nextWithdrawId;

    modifier accountOwner(uint256 accountId) {
        bool isOwner = false;
        for (uint i = 0; i < accounts[accountId].owners.length; i++) {
            if (accounts[accountId].owners[i] == msg.sender) {
                isOwner = true;
                break;
            }
        }
        require(
            isOwner,
            "You are no owner of this account , transaction denied"
        );
        _;
    }

    modifier validOwner(address[] calldata owners) {
        require(
            owners.length + 1 <= 4,
            "the account can have a maximum of 4 owners"
        );

        for (uint i = 0; i < owners.length; i++) {
            if (msg.sender == owners[i]) {
                revert("Duplicate owners is prohibited");
            }
            for (uint j = i + 1; j < owners.length; j++) {
                if (owners[i] == owners[j]) {
                    revert("Duplicate owners is prohibited");
                }
            }
        }
        _;
    }

    modifier sufficientBalance(uint256 accountId, uint256 amount) {
        require(accounts[accountId].balance >= amount, "insufficient balance");
        _;
    }

    modifier canApprove(uint256 accountId, uint256 withdrawid) {
        require(
            accounts[accountId].WithdrawRequests[withdrawid].approved == false,
            "Request already approved "
        );
        require(
            msg.sender != accounts[accountId].WithdrawRequests[withdrawid].user,
            "A withdraw requester can't approve his own request "
        );

        require(
            accounts[accountId].WithdrawRequests[withdrawid].user != address(0),
            "This address doesn't exist"
        );
        require(
            accounts[accountId].WithdrawRequests[withdrawid].ownerApprovals[
                msg.sender
            ] == false,
            "You have already approved this witdraw"
        );
        _;
    }

    modifier canWithdraw(uint256 accountId, uint256 withdrawId) {
        require(
            msg.sender == accounts[accountId].WithdrawRequests[withdrawId].user,
            "You can't use a request you didn't make"
        );
        require(
            accounts[accountId].WithdrawRequests[withdrawId].approved == true,
            "this request is not approved"
        );
        _;
    }

    modifier onlyExistingAccount(uint256 accountId) {
        require(accountExists[accountId], "Account does not exist");
        _;
    }

    function deposit(
        uint256 accountId
    ) external payable onlyExistingAccount(accountId) accountOwner(accountId) {
        accounts[accountId].balance += msg.value;
    }

    function createAccount(
        address[] calldata otherowners
    ) external validOwner(otherowners) {
        address[] memory owners = new address[](otherowners.length + 1);
        owners[otherowners.length] = msg.sender;

        uint256 id = nextAccountId;
        for (uint i = 0; i < owners.length; i++) {
            if (i < owners.length - 1) {
                owners[i] = otherowners[i];
            }
            if (userAccounts[owners[i]].length > 2) {
                revert("A max of 3 accounts for each user");
            }

            userAccounts[owners[i]].push(id);
        }

        accounts[id].owners = owners;
        accountExists[id] = true;
        nextAccountId++;
        emit AccountCreated(owners, id, block.timestamp);
    }

    function requestWithdraw(
        uint256 accountId,
        uint256 amount
    )
        external
        accountOwner(accountId)
        sufficientBalance(accountId, amount)
        onlyExistingAccount(accountId)
        returns (uint256)
    {
        uint256 id = nextWithdrawId;
        WithdrawRequest storage request = accounts[accountId].WithdrawRequests[
            id
        ];
        request.user = msg.sender;
        request.amount = amount;
        nextWithdrawId++;
        emit WithdrawRequested(
            msg.sender,
            accountId,
            id,
            amount,
            block.timestamp
        );
        return id;
    }

    function getPendingWithdrawals(
        uint256 accountId
    )
        external
        view
        onlyExistingAccount(accountId)
        accountOwner(accountId)
        returns (uint256[] memory)
    {
        // Estimate max size (same as nextWithdrawId)
        uint256[] memory temp = new uint256[](nextWithdrawId);
        uint256 count = 0;

        for (uint256 i = 0; i < nextWithdrawId; i++) {
            if (
                accounts[accountId].WithdrawRequests[i].user != address(0) &&
                accounts[accountId].WithdrawRequests[i].approved == false
            ) {
                temp[count] = i;
                count++;
            }
        }

        // Resize result array
        uint256[] memory pending = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            pending[j] = temp[j];
        }

        return pending;
    }

    function approveWithdraw(
        uint256 accountId,
        uint256 withdrawId
    )
        external
        accountOwner(accountId)
        canApprove(accountId, withdrawId)
        onlyExistingAccount(accountId)
    {
        WithdrawRequest storage request = accounts[accountId].WithdrawRequests[
            withdrawId
        ];

        request.approvals++;
        request.ownerApprovals[msg.sender] = true;

        emit WithdrawApproved(
            msg.sender,
            accountId,
            withdrawId,
            request.approvals,
            block.timestamp
        );

        if (request.approvals == accounts[accountId].owners.length - 1) {
            request.approved = true;
        }
    }

    function withdraw(
        uint256 accountId,
        uint256 withdrawId
    )
        external
        canWithdraw(accountId, withdrawId)
        onlyExistingAccount(accountId)
    {
        // Step 1: Cache amount and reduce balance BEFORE sending funds
        WithdrawRequest storage request = accounts[accountId].WithdrawRequests[
            withdrawId
        ];
        uint256 amount = request.amount;

        require(amount <= accounts[accountId].balance, "insufficient funds");

        // Step 2: Update state first (prevent reentrancy)
        accounts[accountId].balance -= amount;
        delete accounts[accountId].WithdrawRequests[withdrawId];

        // Step 3: Transfer ETH
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");

        // Step 4: Emit event
        emit Withdraw(
            msg.sender,
            accountId,
            withdrawId,
            amount,
            block.timestamp
        );
    }

    function getBalance(uint256 accountId) public view returns (uint256) {
        return accounts[accountId].balance;
    }

    function getOwners(
        uint256 accountId
    ) public view returns (address[] memory) {
        return accounts[accountId].owners;
    }

    function getApprovals(
        uint256 accountId,
        uint256 withdrawId
    ) public view returns (uint256) {
        return accounts[accountId].WithdrawRequests[withdrawId].approvals;
    }

    function getAccounts() public view returns (uint256[] memory) {
        return userAccounts[msg.sender];
    }
}
