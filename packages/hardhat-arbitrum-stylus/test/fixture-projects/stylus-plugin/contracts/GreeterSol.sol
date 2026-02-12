// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GreeterSol
 * @notice A simple greeter contract with constructor arguments for testing
 */
contract GreeterSol {
    string private _greeting;

    event GreetingChanged(string newGreeting);

    constructor(string memory greeting_) {
        _greeting = greeting_;
    }

    function greet() public view returns (string memory) {
        return _greeting;
    }

    function setGreeting(string memory newGreeting) public {
        _greeting = newGreeting;
        emit GreetingChanged(newGreeting);
    }
}
