let provider;
let signer;
let contract;

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  "function createOrder(address driver) payable",
  "function submitDeliveryProof(uint256 orderId, string memory proof)",
  "function confirmDelivery(uint256 orderId)",
  "function raiseDispute(uint256 orderId)",
  "function resolveDispute(uint256 orderId, bool payDriver)",
  "function getOrder(uint256 orderId) view returns(tuple(address customer,address driver,uint amount,bool delivered,bool paid,bool disputed,string deliveryProof))",
  "function admin() view returns(address)",
  "function orderCount() view returns(uint256)",
  "event OrderCreated(uint indexed orderId, address indexed customer, address indexed driver, uint amount)",
  "event DeliveryProofSubmitted(uint indexed orderId, address indexed driver, string proof)",
  "event DeliveryConfirmed(uint indexed orderId, address indexed customer, address indexed driver, uint amount)",
  "event DisputeRaised(uint indexed orderId, address indexed customer)",
  "event DisputeResolved(uint indexed orderId, bool paidToDriver, uint amount)"
];

async function connectWallet(){
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    const address = await signer.getAddress();
    const shortAddress = address.slice(0, 6) + "..." + address.slice(-4);
    
    document.getElementById("walletStatus").innerHTML = `
      <span class="status-connected">Connected: ${shortAddress}</span>
    `;
    document.getElementById("connectBtn").textContent = "Connected";
    document.getElementById("connectBtn").disabled = true;

    // Check if user is admin and show admin panel
    const adminAddress = await contract.admin();
    if (address.toLowerCase() === adminAddress.toLowerCase()) {
      document.getElementById("adminPanel").style.display = "block";
    }

    showNotification("Wallet connected successfully!", "success");
  } catch (error) {
    showNotification("Failed to connect wallet: " + error.message, "error");
  }
}

async function createOrder(){
  try {
    const driver = document.getElementById("driverAddress").value;
    const amount = document.getElementById("ethAmount").value;

    if (!driver || !amount) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    const tx = await contract.createOrder(driver, {
      value: ethers.parseEther(amount)
    });

    showNotification("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();

    document.getElementById("driverAddress").value = "";
    document.getElementById("ethAmount").value = "";

    showNotification("Order created successfully!", "success");
    loadTransactionHistory();
  } catch (error) {
    showNotification("Failed to create order: " + error.message, "error");
  }
}

async function submitProof(){
  try {
    const id = document.getElementById("orderIdProof").value;
    const proof = document.getElementById("proof").value;

    if (!id || !proof) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    const tx = await contract.submitDeliveryProof(id, proof);
    showNotification("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();

    document.getElementById("orderIdProof").value = "";
    document.getElementById("proof").value = "";

    showNotification("Delivery proof submitted successfully!", "success");
    loadTransactionHistory();
  } catch (error) {
    showNotification("Failed to submit proof: " + error.message, "error");
  }
}

async function confirmDelivery(){
  try {
    const id = document.getElementById("orderIdConfirm").value;

    if (!id) {
      showNotification("Please enter an order ID", "error");
      return;
    }

    const tx = await contract.confirmDelivery(id);
    showNotification("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();

    document.getElementById("orderIdConfirm").value = "";

    showNotification("Delivery confirmed! Payment released to driver.", "success");
    loadTransactionHistory();
  } catch (error) {
    showNotification("Failed to confirm delivery: " + error.message, "error");
  }
}

async function viewOrder(){
  try {
    const id = document.getElementById("viewOrderId").value;

    if (!id) {
      showNotification("Please enter an order ID", "error");
      return;
    }

    const order = await contract.getOrder(id);

    let statusClass = "status-pending";
    let statusText = "Pending";
    
    if (order.disputed) {
      statusClass = "status-disputed";
      statusText = "Disputed";
    } else if (order.paid) {
      statusClass = "status-paid";
      statusText = "Paid";
    } else if (order.delivered) {
      statusClass = "status-delivered";
      statusText = "Delivered";
    }

    document.getElementById("orderDetails").innerHTML = `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">Order #${id}</span>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="order-info">
          <p><strong>Customer:</strong> <span class="address">${order.customer}</span></p>
          <p><strong>Driver:</strong> <span class="address">${order.driver}</span></p>
          <p><strong>Amount:</strong> <span class="amount">${ethers.formatEther(order.amount)} ETH</span></p>
          <p><strong>Delivered:</strong> ${order.delivered ? "Yes" : "No"}</p>
          <p><strong>Paid:</strong> ${order.paid ? "Yes" : "No"}</p>
          <p><strong>Disputed:</strong> ${order.disputed ? "Yes" : "No"}</p>
          <p><strong>Delivery Proof:</strong> ${order.deliveryProof || "Not submitted"}</p>
        </div>
      </div>
    `;
  } catch (error) {
    showNotification("Failed to fetch order: " + error.message, "error");
  }
}

// Raise dispute function
async function raiseDispute(){
  try {
    const id = document.getElementById("disputeOrderId").value;

    if (!id) {
      showNotification("Please enter an order ID", "error");
      return;
    }

    const tx = await contract.raiseDispute(id);
    showNotification("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();

    document.getElementById("disputeOrderId").value = "";

    showNotification("Dispute raised successfully! Admin will review.", "success");
    loadTransactionHistory();
  } catch (error) {
    showNotification("Failed to raise dispute: " + error.message, "error");
  }
}

// Admin resolve dispute function
async function resolveDispute(){
  try {
    const id = document.getElementById("resolveOrderId").value;
    const payDriver = document.getElementById("payDriver").value === "true";

    if (!id) {
      showNotification("Please enter an order ID", "error");
      return;
    }

    const tx = await contract.resolveDispute(id, payDriver);
    showNotification("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();

    document.getElementById("resolveOrderId").value = "";

    const recipient = payDriver ? "driver" : "customer";
    showNotification(`Dispute resolved! Payment sent to ${recipient}.`, "success");
    loadTransactionHistory();
  } catch (error) {
    showNotification("Failed to resolve dispute: " + error.message, "error");
  }
}

// Load transaction history from blockchain events
async function loadTransactionHistory(){
  try {
    if (!contract) return;

    const orderCount = await contract.orderCount();
    const historyContainer = document.getElementById("transactionHistory");
    
    if (orderCount === 0n) {
      historyContainer.innerHTML = "<p class='no-history'>No transactions yet.</p>";
      return;
    }

    let historyHTML = "";
    
    // Get recent orders (last 10)
    const start = orderCount > 10n ? orderCount - 10n + 1n : 1n;
    
    for (let i = orderCount; i >= start; i--) {
      const order = await contract.getOrder(i);
      
      let statusClass = "status-pending";
      let statusText = "Pending";
      
      if (order.disputed) {
        statusClass = "status-disputed";
        statusText = "Disputed";
      } else if (order.paid) {
        statusClass = "status-paid";
        statusText = "Completed";
      } else if (order.delivered) {
        statusClass = "status-delivered";
        statusText = "Delivered";
      }

      historyHTML += `
        <div class="history-item">
          <div class="history-header">
            <span class="order-id">Order #${i}</span>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
          <div class="history-details">
            <span class="amount">${ethers.formatEther(order.amount)} ETH</span>
            <span class="address">${order.driver.slice(0,6)}...${order.driver.slice(-4)}</span>
          </div>
        </div>
      `;
    }

    historyContainer.innerHTML = historyHTML;
  } catch (error) {
    console.error("Failed to load history:", error);
  }
}

// Show notification
function showNotification(message, type){
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";
  
  setTimeout(() => {
    notification.style.display = "none";
  }, 5000);
}
