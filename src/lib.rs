#![feature(proc_macro, wasm_import_module, wasm_custom_section)]

extern crate sha1;
extern crate sha2;
extern crate sha3;

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

use sha1::Sha1;
use sha2::{Sha256, Sha512};
use sha3::Sha3_256;

#[wasm_bindgen]
pub fn sha1(input_bytes: &[u8]) -> String {
    let mut hasher = Sha1::new();

    hasher.update(input_bytes);
    return hasher.digest().to_string();
}

#[wasm_bindgen]
pub fn sha2_256(input_bytes: &[u8]) -> String {
    use sha2::Digest;

    let mut hasher = Sha256::default();

    hasher.input(input_bytes);
    let output = hasher.result();
    return format!("{:x}", output);
}

#[wasm_bindgen]
pub fn sha2_512(input_bytes: &[u8]) -> String {
    use sha2::Digest;

    let mut hasher = Sha512::default();

    hasher.input(input_bytes);
    let output = hasher.result();
    return format!("{:x}", output);
}

#[wasm_bindgen]
pub fn sha3_256(input_bytes: &[u8]) -> String {
    use sha3::Digest;

    let mut hasher = Sha3_256::default();
    hasher.input(input_bytes);
    let output = hasher.result();
    return format!("{:x}", output);
}
