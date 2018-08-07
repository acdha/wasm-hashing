/* global self, postMessage, FileReaderSync */

let wasm_hashing = import("./wasm_hashing");

const BLOCK_SIZE = 1048576;

wasm_hashing.then(wasm => {
    let Sha2_256Hasher = wasm.Sha2_256Hasher;

    self.addEventListener("message", ({ data: { file, fullPath } }) => {
        let sha256 = new Sha2_256Hasher();

        const fileSize = file.size;
        const startMilliseconds = performance.now();

        for (
            let reader = new FileReaderSync(), start = 0, end;
            start < fileSize;
            start = end
        ) {
            end = start + Math.min(BLOCK_SIZE, fileSize - start);
            let slice = file.slice(start, end);
            let bytes = reader.readAsArrayBuffer(slice);

            sha256.update(new Uint8Array(bytes));

            postMessage({
                type: "PROGRESS_UPDATE",
                fullPath,
                bytesHashed: end,
                elapsedMilliseconds: performance.now() - startMilliseconds,
            });
        }

        let hashResult = sha256.hex_digest();

        // This is a sanity check against
        if (
            file.size > 0 &&
            hashResult ==
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        ) {
            throw `Hashed ${file.size} bytes as an empty result!`;
        }

        postMessage({
            type: "RESULT",
            fullPath,
            sha256: hashResult,
            bytesHashed: fileSize,
            elapsedMilliseconds: performance.now() - startMilliseconds,
        });
    });
});
