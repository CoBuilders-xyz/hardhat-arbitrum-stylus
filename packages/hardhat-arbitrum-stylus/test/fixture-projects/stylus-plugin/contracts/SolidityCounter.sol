// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SolidityCounter
 * @notice A simple counter contract for testing dual compilation
 */
contract SolidityCounter {
    uint256 private _count;

    event CountChanged(uint256 newCount);

    error Underflow();
    error InvalidCount(uint256 current, uint256 requested);

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

    function decrementCustom() public {
        if (_count == 0) revert Underflow();
        _count -= 1;
        emit CountChanged(_count);
    }

    function setCount(uint256 newCount) public {
        _count = newCount;
        emit CountChanged(_count);
    }

    function setCountChecked(uint256 newCount) public {
        if (newCount > 1000) revert InvalidCount(_count, newCount);
        _count = newCount;
        emit CountChanged(_count);
    }
}
