#![feature(proc_macro, wasm_import_module, wasm_custom_section)]

extern crate digest;
extern crate hex;
extern crate sha1;
extern crate sha2;
extern crate sha3;

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

use digest::Digest;
use sha1::Sha1;
use sha2::{Sha256, Sha512};
use sha3::{Sha3_256, Sha3_512};

fn hash_bytes<D: Digest>(input_bytes: &[u8]) -> String {
    let mut hasher = D::new();
    hasher.input(input_bytes);
    let output = hasher.result();
    return hex::encode(output);
}

#[wasm_bindgen]
pub fn hash_sha1(input_bytes: &[u8]) -> String {
    return hash_bytes::<Sha1>(input_bytes);
}

#[wasm_bindgen]
pub fn hash_sha2_256(input_bytes: &[u8]) -> String {
    return hash_bytes::<Sha256>(input_bytes);
}

#[wasm_bindgen]
pub fn hash_sha2_512(input_bytes: &[u8]) -> String {
    return hash_bytes::<Sha512>(input_bytes);
}

#[wasm_bindgen]
pub fn hash_sha3_256(input_bytes: &[u8]) -> String {
    return hash_bytes::<Sha3_256>(input_bytes);
}

#[wasm_bindgen]
pub fn hash_sha3_512(input_bytes: &[u8]) -> String {
    return hash_bytes::<Sha3_512>(input_bytes);
}
