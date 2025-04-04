const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
  
    const BankAccount = await hre.ethers.getContractFactory("BankAccount", deployer);
  
    const bankAccount = await BankAccount.deploy();
    await bankAccount.waitForDeployment();
  
    await writeDeploymentInfo(bankAccount, deployer);
  
    console.log("✅ BankAccount deployed to:", bankAccount.target);
  }

  async function writeDeploymentInfo(contract, signer) {
    const data = {
      contract: {
        address: contract.target, 
        signerAddress: signer.address,
        abi: contract.interface.format(),
      },
    };
  
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile("../frontend/deployment.json", content, { encoding: "utf-8" });
  }
  

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
