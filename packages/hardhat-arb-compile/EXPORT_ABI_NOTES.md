# Export ABI Notes

Internal notes on `cargo stylus export-abi` behavior. Not part of the public docs.

## The `print_from_args()` conflict (stylus-sdk 0.9.0)

### Problem

With `stylus-sdk 0.9.0`, contracts that define an **explicit** `print_from_args()` function produce an empty ABI when compiled via `cargo stylus export-abi`. The command fails silently and our plugin catches the error, resulting in an artifact with `"abi": []`.

### Root Cause

In `stylus-sdk 0.9.0`, the `#[entrypoint]` and `#[public]` macros auto-generate the `print_from_args()` function when the `export-abi` feature is enabled. If the contract also defines its own explicit version:

```rust
// This pattern is BROKEN with stylus-sdk 0.9.0
#[cfg(feature = "export-abi")]
pub fn print_from_args() {
    Counter::print_abi(&mut std::env::args());
}
```

...there is a conflict (duplicate symbol) that causes `cargo stylus export-abi` to fail.

### Solution

Remove the explicit `print_from_args()` block. The SDK generates it automatically. The `main.rs` entry point remains unchanged — it calls the auto-generated function:

```rust
// main.rs — no changes needed
#[cfg(feature = "export-abi")]
fn main() {
    stylus_counter::print_from_args();
}
```

### Evidence

- `stylus-hello-world` (no explicit `print_from_args()`): 7 ABI entries — works
- `stylus-counter` (had explicit `print_from_args()`): 0 ABI entries — broken
- `stylus-counter` after removing explicit function: 2 ABI entries — works

### Context

The `print_from_args()` pattern was required in older versions of `stylus-sdk` (pre-0.9.0). The official `stylus-hello-world` template was updated to remove it, but older examples and tutorials still reference the explicit pattern. Our fixture was based on an older template.
