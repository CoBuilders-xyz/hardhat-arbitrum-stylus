//! Stylus Init Counter Contract
//! A counter with a constructor that accepts an initial value.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::U256, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct InitCounter {
        uint256 count;
    }
}

#[public]
impl InitCounter {
    #[constructor]
    pub fn constructor(&mut self, initial_value: U256) {
        self.count.set(initial_value);
    }

    pub fn count(&self) -> U256 {
        self.count.get()
    }

    pub fn increment(&mut self) {
        let count = self.count.get();
        self.count.set(count + U256::from(1));
    }
}
