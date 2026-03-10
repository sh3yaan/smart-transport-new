import { ethers } from "ethers";

async function main() {

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const abi = [
    "function orders(uint256) view returns (address customer, address driver, uint256 amount, bool delivered, bool disputed)"
  ];

  const contract = new ethers.Contract(contractAddress, abi, provider);

  const order = await contract.orders(0);

  console.log("Order details:");
  console.log("Customer:", order.customer);
  console.log("Driver:", order.driver);
  console.log("Amount:", ethers.formatEther(order.amount), "ETH");
  console.log("Delivered:", order.delivered);
  console.log("Disputed:", order.disputed);

}

main();