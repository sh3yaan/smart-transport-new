let provider;
let signer;
let contract;

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
"function createOrder(address driver) payable",
"function submitDeliveryProof(uint256 orderId, string memory proof)",
"function confirmDelivery(uint256 orderId)",
"function getOrder(uint256 orderId) view returns(tuple(address customer,address driver,uint amount,bool delivered,bool paid,bool disputed,string deliveryProof))"
];

async function connectWallet(){

provider = new ethers.BrowserProvider(window.ethereum);

await provider.send("eth_requestAccounts", []);

signer = await provider.getSigner();

contract = new ethers.Contract(contractAddress, abi, signer);

alert("Wallet connected!");
}

async function createOrder(){

const driver = document.getElementById("driverAddress").value;
const amount = document.getElementById("ethAmount").value;

const tx = await contract.createOrder(driver,{
value: ethers.parseEther(amount)
});

await tx.wait();

alert("Order created!");
}

async function submitProof(){

const id = document.getElementById("orderIdProof").value;
const proof = document.getElementById("proof").value;

const tx = await contract.submitDeliveryProof(id,proof);

await tx.wait();

alert("Proof submitted!");
}

async function confirmDelivery(){

const id = document.getElementById("orderIdConfirm").value;

const tx = await contract.confirmDelivery(id);

await tx.wait();

alert("Payment released!");
}

async function viewOrder(){

const id = document.getElementById("viewOrderId").value;

const order = await contract.getOrder(id);

document.getElementById("orderDetails").innerHTML = `
<p><b>Customer:</b> ${order.customer}</p>
<p><b>Driver:</b> ${order.driver}</p>
<p><b>Amount:</b> ${ethers.formatEther(order.amount)} ETH</p>
<p><b>Delivered:</b> ${order.delivered}</p>
<p><b>Paid:</b> ${order.paid}</p>
<p><b>Disputed:</b> ${order.disputed}</p>
<p><b>Proof:</b> ${order.deliveryProof}</p>
`;
}