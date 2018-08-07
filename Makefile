all:
	cargo build --target=wasm32-unknown-unknown --release
	wasm-bindgen target/wasm32-unknown-unknown/release/wasm_hashing.wasm --out-dir=.
	yarn run webpack --progress --display-optimization-bailout --display-error-details
