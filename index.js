let wasm_hashing = import("./wasm_hashing");

let giganticString = "ABCDEFGHIGJKLMNOPQRSTUVWXYZ".repeat(100000);

wasm_hashing
    .then(hashing => {
        console.log(hashing);
        console.log(hashing.hello_world());

        let encoder = new TextEncoder();

        ["", "Hello World!", giganticString].forEach(testVector => {
            let encodedBytes = encoder.encode(testVector);

            let startMilliseconds = performance.now();

            let result = hashing.sha256(encodedBytes);

            let elapsedMilliseconds = performance.now() - startMilliseconds;

            console.log(
                'SHA-256 "%s" (%d bytes in %0.5fs; %d bytes/s): %s',
                testVector.length > 14 ? testVector.substr(0, 13) + "…" : testVector,
                encodedBytes.byteLength,
                elapsedMilliseconds / 1000,
                Math.round(encodedBytes.byteLength / (elapsedMilliseconds / 1000)),
                result
            );
        });
    })
    .catch(err => console.error(err));
