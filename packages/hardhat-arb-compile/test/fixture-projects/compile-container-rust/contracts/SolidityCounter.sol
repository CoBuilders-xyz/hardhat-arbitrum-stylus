// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SolidityCounter
 * @notice A simple counter contract for testing dual compilation
 */
contract SolidityCounter {
    uint256 private _count;

    event CountChanged(uint256 newCount);

    function count() public view returns (uint256) {
        return _count;
    }

    function increment() public {
        _count += 1;
        emit CountChanged(_count);
    }

    function decrement() public {
        require(_count > 0, 'Counter: cannot decrement below zero');
        _count -= 1;
        emit CountChanged(_count);
    }

    function setCount(uint256 newCount) public {
        _count = newCount;
        emit CountChanged(_count);
    }
}
