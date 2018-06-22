#![feature(proc_macro, wasm_import_module, wasm_custom_section)]

extern crate wasm_bindgen;
extern crate sha2;

use wasm_bindgen::prelude::*;

    use sha2::{Sha256, Digest};

#[wasm_bindgen]
pub fn hello_world() -> String {
    return "Hello!".to_string();
}

#[wasm_bindgen]
pub fn sha256(input_bytes: &[u8]) -> String {

    let mut hasher = Sha256::default();

    hasher.input(input_bytes);
    let output = hasher.result();
    return format!("{:x}", output);
}
