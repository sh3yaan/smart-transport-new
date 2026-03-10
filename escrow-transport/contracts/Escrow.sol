// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    struct Order {
        address customer;
        address driver;
        uint amount;
        bool delivered;
        bool paid;
        bool disputed;
        string deliveryProof;
    }

    uint public orderCount;
    mapping(uint => Order) public orders;

    // Events for transparent transaction logging on blockchain
    event OrderCreated(uint indexed orderId, address indexed customer, address indexed driver, uint amount);
    event DeliveryProofSubmitted(uint indexed orderId, address indexed driver, string proof);
    event DeliveryConfirmed(uint indexed orderId, address indexed customer, address indexed driver, uint amount);
    event DisputeRaised(uint indexed orderId, address indexed customer);
    event DisputeResolved(uint indexed orderId, bool paidToDriver, uint amount);

    // Customer creates order and locks payment
    function createOrder(address _driver) public payable {

        require(msg.value > 0, "Payment required");

        orderCount++;

        orders[orderCount] = Order(
            msg.sender,
            _driver,
            msg.value,
            false,
            false,
            false,
            ""
        );

        emit OrderCreated(orderCount, msg.sender, _driver, msg.value);
    }

    // Driver submits delivery proof (photo hash / document hash)
    function submitDeliveryProof(uint orderId, string memory proof) public {

        Order storage order = orders[orderId];

        require(msg.sender == order.driver, "Only driver can submit proof");

        order.deliveryProof = proof;

        emit DeliveryProofSubmitted(orderId, msg.sender, proof);
    }

    // Customer confirms delivery and releases payment
    function confirmDelivery(uint orderId) public {

        Order storage order = orders[orderId];

        require(msg.sender == order.customer, "Only customer");
        require(!order.paid, "Already paid");
        require(!order.disputed, "Order disputed");

        order.delivered = true;
        order.paid = true;

        payable(order.driver).transfer(order.amount);

        emit DeliveryConfirmed(orderId, msg.sender, order.driver, order.amount);
    }

    // Customer raises dispute
    function raiseDispute(uint orderId) public {

        Order storage order = orders[orderId];

        require(msg.sender == order.customer, "Only customer");
        require(!order.paid, "Already paid");

        order.disputed = true;

        emit DisputeRaised(orderId, msg.sender);
    }

    // Admin resolves dispute
    function resolveDispute(uint orderId, bool payDriver) public {

        require(msg.sender == admin, "Only admin");

        Order storage order = orders[orderId];

        require(order.disputed, "No dispute");

        order.disputed = false;
        order.paid = true;

        if(payDriver){
            payable(order.driver).transfer(order.amount);
        } else {
            payable(order.customer).transfer(order.amount);
        }

        emit DisputeResolved(orderId, payDriver, order.amount);
    }

    function getOrder(uint orderId) public view returns(Order memory){
        return orders[orderId];
    }
}
