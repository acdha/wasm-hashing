# WASM Hashing Experiment

Experiment using Rust + WebAssembly to generate SHA-{1,2,3} hash implementations

## Current status

See https://acdha.github.io/wasm-hashing/ to try it in your browser. For static strings, the WASM code is the performance lead on almost every size although [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) may be competitive on SHA-1 at some message sizes.

One especially compelling story for this approach is that all common digest algorithms are supported by https://github.com/RustCrypto/hashes whereas most of the other JavaScript libraries only support a few or, in the case of jsSHA, are extremely slow.

## Building

1. Make sure the Rust nightly toolchain is setup correctly on your system
1. Make sure you have all of the JavaScript dependencies (e.g. `yarn install --dev`)
1. `make`
1. Use something like [`httplz`](https://crates.io/crates/https) to serve the `dist/` folder

## Contributing

Make sure you're comfortable releasing any code under CC0
