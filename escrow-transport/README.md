# 🚚 Smart Transport Escrow

A decentralized logistics payment system built using Ethereum smart contracts.  
This project allows customers to lock payments in escrow and release them to drivers only after delivery is confirmed.

The goal of this system is to remove the need for a trusted intermediary and ensure secure, transparent delivery payments.

---

## 📌 Features

- Escrow-based delivery payments
- Driver delivery proof submission
- Customer delivery confirmation
- Admin dispute resolution
- Secure smart contract payment release
- Transparent blockchain transactions

---

## ⚙️ How It Works

1. **Customer creates order**  
   The customer creates a delivery order and locks ETH into the smart contract.

2. **Driver submits delivery proof**  
   The driver submits a proof of delivery (e.g., IPFS hash or document).

3. **Customer confirms delivery**  
   If the delivery is correct, the customer confirms it.

4. **Payment released**  
   The smart contract automatically transfers the funds to the driver.

5. **Dispute handling**  
   If there is an issue, the customer can raise a dispute which can be resolved by the admin.

---

## 🧱 Tech Stack

Blockchain:
- Solidity
- Hardhat
- Ethereum local node

Backend / Scripts:
- JavaScript
- ethers.js

Frontend:
- HTML
- CSS
- JavaScript

---

## 🚀 Running the Project

### 1 Install dependencies
npm install


### 2 Start local blockchain
npx hardhat node


### 3 Deploy the contract
node deploy.js


### 4 Run test script
node testEscrow.js


---

## 🔐 Smart Contract Capabilities

The Escrow smart contract manages:

- Order creation
- Payment locking
- Delivery proof storage
- Delivery confirmation
- Dispute handling
- Payment settlement

All transactions are stored on the blockchain and cannot be altered.

---

## 📈 Future Improvements

- Web-based user interface
- Wallet connection with MetaMask
- Image upload for delivery proof
- GPS delivery verification
- Decentralized storage with IPFS
- Driver reputation system

---


