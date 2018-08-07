#![feature(use_extern_macros)]

extern crate digest;
extern crate hex;
extern crate sha1;
extern crate sha2;
extern crate sha3;

extern crate wasm_bindgen;

use std::cell::Cell;
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

#[wasm_bindgen]
pub struct Sha1Hasher {
    hasher: Cell<Sha1>,
}

#[wasm_bindgen]
pub struct Sha2_256Hasher {
    hasher: Cell<Sha256>,
}

#[wasm_bindgen]
pub struct Sha2_512Hasher {
    hasher: Cell<Sha512>,
}

#[wasm_bindgen]
pub struct Sha3_256Hasher {
    hasher: Cell<Sha3_256>,
}

#[wasm_bindgen]
pub struct Sha3_512Hasher {
    hasher: Cell<Sha3_512>,
}

#[wasm_bindgen]
impl Sha1Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha1Hasher {
        Sha1Hasher {
            hasher: Cell::new(Sha1::default()),
        }
    }

    pub fn update(&mut self, input_bytes: &[u8]) {
        let hasher = self.hasher.get_mut();
        hasher.input(input_bytes)
    }

    pub fn hex_digest(&mut self) -> String {
        let hasher = self.hasher.take();
        let output = hasher.result();
        return format!("{:x}", output);
    }
}

#[wasm_bindgen]
impl Sha2_256Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha2_256Hasher {
        Sha2_256Hasher {
            hasher: Cell::new(Sha256::default()),
        }
    }

    pub fn update(&mut self, input_bytes: &[u8]) {
        let hasher = self.hasher.get_mut();
        hasher.input(input_bytes)
    }

    pub fn hex_digest(&mut self) -> String {
        let hasher = self.hasher.take();
        let output = hasher.result();
        return format!("{:x}", output);
    }
}

#[wasm_bindgen]
impl Sha2_512Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha2_512Hasher {
        Sha2_512Hasher {
            hasher: Cell::new(Sha512::default()),
        }
    }

    pub fn update(&mut self, input_bytes: &[u8]) {
        let hasher = self.hasher.get_mut();
        hasher.input(input_bytes)
    }

    pub fn hex_digest(&mut self) -> String {
        let hasher = self.hasher.take();
        let output = hasher.result();
        return format!("{:x}", output);
    }
}

#[wasm_bindgen]
impl Sha3_256Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha3_256Hasher {
        Sha3_256Hasher {
            hasher: Cell::new(Sha3_256::default()),
        }
    }

    pub fn update(&mut self, input_bytes: &[u8]) {
        let hasher = self.hasher.get_mut();
        hasher.input(input_bytes)
    }

    pub fn hex_digest(&mut self) -> String {
        let hasher = self.hasher.take();
        let output = hasher.result();
        return format!("{:x}", output);
    }
}

#[wasm_bindgen]
impl Sha3_512Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sha3_512Hasher {
        Sha3_512Hasher {
            hasher: Cell::new(Sha3_512::default()),
        }
    }

    pub fn update(&mut self, input_bytes: &[u8]) {
        let hasher = self.hasher.get_mut();
        hasher.input(input_bytes)
    }

    pub fn hex_digest(&mut self) -> String {
        let hasher = self.hasher.take();
        let output = hasher.result();
        return format!("{:x}", output);
    }
}
