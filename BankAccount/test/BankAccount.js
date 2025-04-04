const {
  
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("BankAccount", function () {
  async function deployBankAccount() {
    const [addr0, addr1,addr2,addr3,addr4] = await ethers.getSigners();

    const BankAccount = await ethers.getContractFactory("BankAccount");
    const bankAccount = await BankAccount.deploy();

    return {bankAccount, addr0, addr1,addr2,addr3 ,addr4};
  }

  async function deployBankAccountWithAccounts(nbOwners=1 , deposit=0,withdrawAmounts=[]) {

    const {bankAccount, addr0, addr1,addr2,addr3 ,addr4} = await loadFixture(deployBankAccount);
    let addresses=[]
    if (nbOwners==2) {
      addresses=[addr1.address];

      
    }else if (nbOwners==3) {
      addresses=[addr1.address,addr2.address];
      
    }else if (nbOwners==4) {
      addresses=[addr1.address,addr2.address,addr3.address];
      
    }
    await bankAccount.connect(addr0).createAccount(addresses);
    if (deposit>0) {
      await bankAccount.connect(addr0).deposit(0 ,{value : deposit.toString()});
      
    }
    for (const withdrawlAmount of withdrawAmounts){
      await bankAccount.connect(addr0).requestWithdraw(0,withdrawlAmount);

    }
    return {bankAccount, addr0, addr1,addr2,addr3 ,addr4};
  }

  describe("Deployment", () =>{

    it("Should deploy without error", async()=> {

      await loadFixture(deployBankAccount)
    })


  });

  describe("Create an account" , ()=>{
    it("Should allow creating a single user account",async ()=>{

      const {bankAccount ,addr0 }= await loadFixture(deployBankAccount);
      await bankAccount.connect(addr0).createAccount([]);
      const accounts =await  bankAccount.connect(addr0).getAccounts();
      
      expect(accounts.length).to.equal(1);


    });

    it("Should allow creating a double user account",async ()=>{

      const {bankAccount ,addr0,addr1 }= await loadFixture(deployBankAccount);
      await bankAccount.connect(addr0).createAccount([addr1.address]);
      const accounts1 =await  bankAccount.connect(addr0).getAccounts();
      
      expect(accounts1.length).to.equal(1);

      const accounts2 =await  bankAccount.connect(addr1).getAccounts();
      
      expect(accounts2.length).to.equal(1);


    });

    it("Should allow creating a triple user account",async ()=>{

      const {bankAccount ,addr0,addr1,addr2 }= await loadFixture(deployBankAccount);
      await bankAccount.connect(addr0).createAccount([addr1.address,addr2.address]);
      const accounts1 =await  bankAccount.connect(addr0).getAccounts();
      
      expect(accounts1.length).to.equal(1);

      const accounts2 =await  bankAccount.connect(addr1).getAccounts();
      
      expect(accounts2.length).to.equal(1);
      const accounts3 =await  bankAccount.connect(addr2).getAccounts();
      
      expect(accounts3.length).to.equal(1);


    });

    it("Should allow creating a quad user account",async ()=>{

      const {bankAccount ,addr0,addr1,addr2,addr3 }= await loadFixture(deployBankAccount);
      await bankAccount.connect(addr0).createAccount([addr1.address,addr2.address,addr3.address]);
      const accounts1 =await  bankAccount.connect(addr0).getAccounts();
      
      expect(accounts1.length).to.equal(1);

      const accounts2 =await  bankAccount.connect(addr1).getAccounts();
      
      expect(accounts2.length).to.equal(1);
      const accounts3 =await  bankAccount.connect(addr2).getAccounts();
      
      expect(accounts3.length).to.equal(1);
      const accounts4 =await  bankAccount.connect(addr3).getAccounts();
      
      expect(accounts4.length).to.equal(1);


    });


    it("Should revert if creating an account with more then 4 users",async ()=>{

      const {bankAccount ,addr0,addr1,addr2,addr3,addr4 }= await loadFixture(deployBankAccount);
      await expect(bankAccount.connect(addr0).createAccount([addr1.address,addr2.address,addr3.address,addr4.address])).to.be.revertedWith("the account can have a maximum of 4 owners");
      


    });

    it("Should revert if creating an account with duplicate owners",async ()=>{

      const {bankAccount ,addr0,addr1}= await loadFixture(deployBankAccount);
      await expect(bankAccount.connect(addr0).createAccount([addr1.address,addr1.address])).to.be.revertedWith("Duplicate owners is prohibited");
      await expect(bankAccount.connect(addr0).createAccount([addr0])).to.be.revertedWith("Duplicate owners is prohibited");



    });

    it("Should revert if creating an account with a user already having 3 accounts",async ()=>{

      const {bankAccount ,addr0,addr1}= await loadFixture(deployBankAccount);
      for (let index = 0; index < 3; index++) {
        await bankAccount.connect(addr0).createAccount([]);        
      }
      
      await expect(bankAccount.connect(addr0).createAccount([])).to.be.revertedWith("A max of 3 accounts for each user");
      await expect(bankAccount.connect(addr1).createAccount([addr0])).to.be.revertedWith("A max of 3 accounts for each user");



    });



    


    

    
  });

  describe("Depositing ",() => {

    it("Should allow deposit from account owner",async()=>{
      const {bankAccount,addr0}=await deployBankAccountWithAccounts(1);
      await expect(bankAccount.connect(addr0).deposit(0,{value : 100})).to.changeEtherBalances([bankAccount,addr0],[100,-100]);

      
    });

    it("Should NOT allow deposit from NON account owner",async()=>{
      const {bankAccount,addr1}=await deployBankAccountWithAccounts(1);
      await expect(bankAccount.connect(addr1).deposit(0,{value : 100})).to.be.revertedWith("You are no owner of this account , transaction denied");

      
    });

  });
  describe("Withdraw",() => {
    describe("Request a withdraw",()=>{

      it("Account owner can request  a withdraw",async()=>{
        const {bankAccount , addr0}=await deployBankAccountWithAccounts(1,100);
        await bankAccount.connect(addr0).requestWithdraw(0,100);


      });

      it("Account owner can NOT make a withdraw  with invalid amount",async()=>{
        const {bankAccount , addr0}=await deployBankAccountWithAccounts(1,100);
        await expect(bankAccount.connect(addr0).requestWithdraw(0,101)).to.be.revertedWith("insufficient balance");

        


      });
      it("Should be able to request multiple withdrawls ",async()=>{
        const {bankAccount ,addr0}=await deployBankAccountWithAccounts(1,100);
        await (bankAccount.connect(addr0).requestWithdraw(0,50));
        await (bankAccount.connect(addr0).requestWithdraw(0,50));

        
      });
      it("Should not be able to request a withdraw if not account  owner ",async()=>{
        const {bankAccount ,addr1}=await deployBankAccountWithAccounts(1,100);
        await expect(bankAccount.connect(addr1).requestWithdraw(0,100)).to.be.reverted;

        
      });

     


    });

    describe("Approve a withdraw",()=>{
      it("Should be able to approve a withdraw if OWNER",async()=>{
        const {bankAccount ,addr1} = await deployBankAccountWithAccounts(2,100,[100]);
        await bankAccount.connect(addr1).approveWithdraw(0,0);
        expect(await bankAccount.getApprovals(0,0)).to.equal(1);
        


      });
      
      it("Should NOT allow owner to approve multiple times",async()=>{
        const {bankAccount ,addr1} = await deployBankAccountWithAccounts(2,100,[100]);
        await bankAccount.connect(addr1).approveWithdraw(0,0);
        await expect( bankAccount.connect(addr1).approveWithdraw(0,0)).to.be.reverted;
        

        
      });

      it("Should NOT be able to approve a withdraw if NOT OWNER",async()=>{
        const {bankAccount ,addr2} = await deployBankAccountWithAccounts(2,100,[100]);
        await expect( bankAccount.connect(addr2).approveWithdraw(0,0)).to.be.reverted;
        

        
      });
      
      it("Should NOT be able to approve a withdraw if Creator of request",async()=>{
        const {bankAccount ,addr0} = await deployBankAccountWithAccounts(2,100,[100]);
        await expect( bankAccount.connect(addr0).approveWithdraw(0,0)).to.be.reverted;

        

        
      })

    })

    describe("Make a withdraw",()=>{
      it("Should allow creator to withdraw approved request",async()=>{
        const {bankAccount ,addr0,addr1} = await deployBankAccountWithAccounts(2,100,[100]);
        await bankAccount.connect(addr1).approveWithdraw(0,0);
        await expect(bankAccount.connect(addr0).withdraw(0,0)).to.be.changeEtherBalances([addr0,bankAccount],[100,-100]);
      })
      it("Should NOT allow creator to withdraw approved request TWICE",async()=>{
        const {bankAccount ,addr0,addr1} = await deployBankAccountWithAccounts(2,300,[100]);
        await bankAccount.connect(addr1).approveWithdraw(0,0);
        await expect(bankAccount.connect(addr0).withdraw(0,0)).to.be.changeEtherBalances([addr0,bankAccount],[100,-100]);
        await expect(bankAccount.connect(addr0).withdraw(0,0)).to.be.reverted;
      })

      it("Should NOT allow NON creator to withdraw approved request",async()=>{
        const {bankAccount ,addr0,addr1} = await deployBankAccountWithAccounts(2,200,[100]);
        await bankAccount.connect(addr1).approveWithdraw(0,0);
        await expect(bankAccount.connect(addr1).withdraw(0,0)).to.be.reverted;
      });
      it("Should NOT allow  creator to withdraw NON approved request",async()=>{
        const {bankAccount ,addr0,addr1} = await deployBankAccountWithAccounts(2,200,[100]);
        
        await expect(bankAccount.connect(addr1).withdraw(0,0)).to.be.reverted;
      });


    });





  });

  

  describe("Getters", () => {
    it("Should return the correct balance", async () => {
      const { bankAccount, addr0, addr1 } = await deployBankAccountWithAccounts(2);
  
      // Deposit from both users
      await bankAccount.connect(addr0).deposit(0, { value: 100 });
      await bankAccount.connect(addr1).deposit(0, { value: 80 });
  
      const balance = await bankAccount.getBalance(0);
      expect(balance).to.equal(180); // 100 + 80
    });
  
    it("Should return correct owners of the account", async () => {
      const { bankAccount, addr0, addr1 } = await deployBankAccountWithAccounts(2);
      const owners = await bankAccount.getOwners(0);
      expect(owners).to.include.members([addr0.address, addr1.address]);
      expect(owners.length).to.equal(2);
    });
  
    it("Should return correct approvals for a withdraw request", async () => {
      const { bankAccount, addr0, addr1,addr2 } = await deployBankAccountWithAccounts(3, 100, [50]);
      await bankAccount.connect(addr1).approveWithdraw(0, 0);
      await bankAccount.connect(addr2).approveWithdraw(0, 0);
      const approvals = await bankAccount.getApprovals(0, 0);
      expect(approvals).to.equal(2);
    });
  
    it("Should return correct accounts for a user", async () => {
      const { bankAccount, addr0 } = await deployBankAccountWithAccounts(1);
      const accounts = await bankAccount.connect(addr0).getAccounts();
      expect(accounts.length).to.equal(1);
      expect(accounts[0]).to.equal(0);
    });
  });
  
});
