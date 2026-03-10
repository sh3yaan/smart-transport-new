import { ethers } from "ethers";

async function main() {

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const customer = await provider.getSigner(0);
  const driver = await provider.getSigner(1);
  const admin = await provider.getSigner(2);

  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const abi = [
  "function createOrder(address driver) payable",
  "function submitDeliveryProof(uint256 orderId, string memory proof)",
  "function raiseDispute(uint256 orderId)",
  "function resolveDispute(uint256 orderId, bool payDriver)"
  ];

  const escrowCustomer = new ethers.Contract(contractAddress, abi, customer);
  const escrowDriver = new ethers.Contract(contractAddress, abi, driver);
  const escrowAdmin = new ethers.Contract(contractAddress, abi, admin);

  console.log("Customer creates order with 1 ETH...");
const tx1 = await escrowCustomer.createOrder(await driver.getAddress(), {
  value: ethers.parseEther("1")
});
await tx1.wait();

console.log("Driver submits delivery proof...");
const tx2 = await escrowDriver.submitDeliveryProof(1, "ipfs://delivery-proof");
await tx2.wait();

console.log("Customer raises dispute...");
const tx3 = await escrowCustomer.raiseDispute(1);
await tx3.wait();

console.log("Admin resolves dispute and pays driver...");
const tx4 = await escrowAdmin.resolveDispute(1, true);
await tx4.wait();

  console.log("Dispute resolved!");
}

main();