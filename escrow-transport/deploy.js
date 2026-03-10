import { ethers } from "ethers";
import fs from "fs";

async function main() {

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(privateKey, provider);

  const abi = JSON.parse(fs.readFileSync("./artifacts/contracts/Escrow.sol/Escrow.json")).abi;
  const bytecode = JSON.parse(fs.readFileSync("./artifacts/contracts/Escrow.sol/Escrow.json")).bytecode;

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy();

  await contract.waitForDeployment();

  console.log("Escrow deployed at:", await contract.getAddress());
}

main();