// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICounter {
    function count() external view returns (uint256);
    function increment() external;
}

contract SolidityProxy {
    address public owner;
    ICounter public target;

    event ProxyCall(address indexed caller, string action);

    constructor(address _target) {
        owner = msg.sender;
        target = ICounter(_target);
    }

    function proxyCount() external view returns (uint256) {
        return target.count();
    }

    function proxyIncrement() external {
        require(msg.sender == owner, 'not owner');
        target.increment();
        emit ProxyCall(msg.sender, 'increment');
    }
}
