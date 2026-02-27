//! Stylus Proxy Contract
//! Forwards count/increment calls to a target Solidity counter.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use alloy_sol_types::{sol, SolError};
use stylus_sdk::{
    alloy_primitives::{Address, U256},
    prelude::*,
};

sol! {
    error NotOwner(address caller, address owner);
}

sol_interface! {
    interface ICounter {
        function count() external view returns (uint256);
        function increment() external;
    }
}

sol_storage! {
    #[entrypoint]
    pub struct RustProxy {
        address owner;
        address target;
    }
}

#[public]
impl RustProxy {
    #[constructor]
    pub fn constructor(&mut self, owner: Address, target: Address) {
        self.owner.set(owner);
        self.target.set(target);
    }

    pub fn owner(&self) -> Address {
        self.owner.get()
    }

    pub fn target(&self) -> Address {
        self.target.get()
    }

    pub fn proxy_count(&self) -> Result<U256, Vec<u8>> {
        let target = self.target.get();
        let counter = ICounter::new(target);
        Ok(counter.count(self)?)
    }

    pub fn proxy_increment(&mut self) -> Result<(), Vec<u8>> {
        let owner = self.owner.get();
        let caller = self.vm().msg_sender();
        if caller != owner {
            return Err(NotOwner { caller, owner }.abi_encode());
        }
        let target = self.target.get();
        let counter = ICounter::new(target);
        counter.increment(self)?;
        Ok(())
    }
}
