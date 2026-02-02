//! Stylus Storage Contract
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::U256, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct Storage {
        uint256 value;
    }
}

#[public]
impl Storage {
    pub fn get(&self) -> U256 {
        self.value.get()
    }

    pub fn set(&mut self, new_value: U256) {
        self.value.set(new_value);
    }
}
