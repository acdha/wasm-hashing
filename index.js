import "./index.css";

import { Sha1, Sha256, Sha512, bytes_to_hex } from "asmcrypto.js";
import jsSHA from "jssha";
import filesize from "filesize";
let wasm_hashing = import("./wasm_hashing");

// TODO: add a file-based test using the file reader object in chunks to avoid data marshalling overhead
const testVectors = [
    "",
    "Hello World!",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(10),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(100),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(1000),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(10000),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(100000),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(1000000),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(10000000)
];

const expectedResults = {
    "SHA-1 128": [
        "da39a3ee5e6b4b0d3255bfef95601890afd80709",
        "2ef7bde608ce5404e97d5f042f95f89f1c232871",
        "bc80aa131f5dc29fdadee61cabc625082064d23b",
        "640feaca0bf209cf78702b13ad75f161867d169f",
        "e363dfc35f4d170906aafcbb6b1f6fd1ae854808",
        "451954ad9b09d854b96a2b65794b6329b5a04c77",
        "0bd3bee4732d984e430c51023e340443b6b516aa",
        "bad81161ca04adc5f20f13163bd88d405b689716",
        "84804fe33c33792b26acb06b95f5ef7beed0ffe6"
    ],
    "SHA-2 256": [
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        "00b5cd154c373b0844080996ac78864525f90ab5cfd411983ec055f98c2a6dbc",
        "94b1cd1e7669f4fe2c39c063f25c6e4c48ea71208a54efa4c2fe08a480e2ba06",
        "e59a4d700410ce60f912bd6e5b24f77230cbc68b27838c5a9c06daef94737a8a",
        "d81cd8dc1f97d7e7ef61f2acbbbd58c04ec6a1bbe5eff019f85e14395ad74d9f",
        "8b729df74a03932e63a29e8827a9cc06534e67f26cd69011c11a9780e5286805",
        "99932b5a76528365197749ea001419395e62e5968135af95ad9e88209f005cef",
        "539befd0460ec9d5be79209d891c6ef065b23e8a07159c0e487fb3c78c19e16f"
    ],
    "SHA-2 512": [
        "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
        "861844d6704e8573fec34d967e20bcfef3d424cf48be04e6dc08f2bd58c729743371015ead891cc3cf1c9d34b49264b510751b1ff9e537937bc46b5d6ff4ecc8",
        "073dbcddc9cb8fc1d392f3773cafae6d411f74b38797f3dc47aa99a3978855a836407f1d8f324742ad5970f9980ddd45d07caafd495c134ce666c0708137e803",
        "9b98468b435f19e22299f1dcdf2063f0f9cda4bfbfe721ae94c9dc4f7dc5bc2ee63a70d7a294423f1638a0574727a73fea1dbc7fac3e6a9ada4682352e01587f",
        "e65ffcd76ba36249abafa0611abb55bd7c18b425302455a56ed27606330faf91e6895d0dce543e3fdd4163fc7137e552780b744bf1c48a67cbdf33e18ccd4a73",
        "0a37a16ae154e67bc0abd74a199fc6e3ba851dcef99e5a14a9be3f3ff66d02ac70a464a6077a42a7273233c94c5230ed696039e48086ff0d30a44a11c86fc62c",
        "5da882de5d398be06be158da60f7a5d7e26b2ba1ebe3741267d5110c31dbd7703115d419e3c52b390c7be9aa760de5469a3f3f279503d94a3a5c8f2bbb6b28d5",
        "0c37d97a52a0f04d6be535d12d28b777733ce0077f8aacc40598077bab9e7f1f2c3b8535163119d2b46156bf1fc1678a93babac2eeeec1cb746fdda4b55e807e",
        "b96406d7eb9c230fe533b9ba2e43e6c8b8bd6fde1f011066ad4499678b9fb4c75f599b7c9b82100c50543e0aa0a8e1ad215408bdfce9a22f463cb097060a367c"
    ],
    "SHA-3 256": [
        "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
        "d0e47486bbf4c16acac26f8b653592973c1362909f90262877089f9c8a4536af",
        "acfa5466ece9195f880d45f56d49dcf6ca2fcab23f30535fa52d67a20a842c50",
        "f5fa59facf1698952acdc543d6d499124dcedf39e470ac1c2372d7ebbc2bd722",
        "92e6dca2ed66a5ec9c50b9f5ebc16d82dbbb34c55d110270ccfa26e8b95d3d94",
        "9afc908627dab591620b2fc45650376bd17b2ad818749ffc79a9f5d03b2862b7",
        "d2cb3acc757538f1f0d38e56ce713c8ee64af88604e5c62ff179e8e7619e5a90",
        "e26694d1b3e9c7c0378b96df9a7623e466f378dabab4d2699e37759d36c10cc5",
        "f68c5a7233460b5509c542422e8ddd8bd2ac02f912e73aa55187a63bf4648457"
    ],
    "SHA-3 512": [
        "a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26",
        "32400b5e89822de254e8d5d94252c52bdcb27a3562ca593e980364d9848b8041b98eabe16c1a6797484941d2376864a1b0e248b0f7af8b1555a778c336a5bf48",
        "0511505f5410a67cca3cd62b9dee60c6926a541c4484a3d188a6820a7f168942fc61251088104695090aa13e50dcd7efbbccc9c144d3b700f24f3a0cef0e5e42",
        "864d803092bf295b2ff822e8feee71cc043456aac09d02ec719ecacbffc4c9a11110e1b47ba587fd0a2f05d15aa2f7856489042a98e5ae506dfaaedbd62f7640",
        "a22b7e9ee67a6be4393f7c36ab4f6b9ef48dabb19465dd119d163d74a8b844ea95ddfa62aa9d331649165e04b32106938402052fad266fe2edd17be0dfb8ebd9",
        "32d374181709d34bb486e37658d1812b6da17e76876d58b786b12e81b534c2e89cb9a3c705aeb848cab06394f7ec18a3412b34ed46b049f5e6df6ed9e08fe8fa",
        "69a9b6a65efe0c5a301391b1d672f7ced2973a9d590952f99a2615d0004640b5f4c557b0c7b561d93da5f600daea3e28cf03c6d2a7984369552d1382412ee186",
        "af1e630f6e408b58c6d6a27d323e1819534608e04c4e2f9b50ccec6b5530bc41f0d779e52660f15070cb2fb80ebfa7547059d955b74dc38090aad8d664e8e5a4",
        "32b6c2ae4912766d037e04c23090a3e24bd9c021aa38dda97ec85666a4ca5265029c3f5df5d0b7f86bb0afeaa1d82ccd9f82bcc32bc74b35586e7c95f374fbf8"
    ]
};

let resultsTable = document.getElementById("results");
let resultsBody = resultsTable.querySelector("tbody");
let resultTemplate = document.getElementById("result-template");

let benchmarkQueue = [];
let results = new Map();

function setupBenchmarks(hashers) {
    for (let [hashName, implementations] of hashers) {
        let testResults = new Map();
        results.set(hashName, testResults);

        for (let [testVectorIndex, testVector] of testVectors.entries()) {
            let libResults = new Map();
            testResults.set(testVectorIndex, libResults);

            let shortInput = testVector;
            if (testVector.length > 14) {
                shortInput =
                    testVector.substr(0, 13) +
                    `… (${filesize(testVector.length - 14, { round: 1 })})`;
            }

            let entry = document.importNode(resultTemplate.content, true)
                .firstElementChild;
            entry.querySelector(".hash-name").textContent = hashName;
            entry.querySelector(".input").textContent = shortInput;
            entry.dataset.hashName = hashName;
            entry.dataset.testVectorIndex = testVectorIndex;
            resultsBody.appendChild(entry);

            for (let [libName, testHasher] of implementations) {
                libResults.set(libName, []);

                for (let i = 0; i < 10; i++) {
                    benchmarkQueue.push([
                        libName,
                        hashName,
                        testHasher,
                        testVectorIndex
                    ]);
                }
            }
        }
    }
}

function runNextBenchmark() {
    runBenchmark(...benchmarkQueue.shift());
    updateResultDisplay();

    if (benchmarkQueue.length > 0) {
        window.requestAnimationFrame(runNextBenchmark);
    }
}

function* chunkIterator(inputBytes, chunkSize = 65536) {
    let chunkCount = inputBytes.byteLength / chunkSize;

    for (var i = 0, j = 0; i < chunkCount; i++, j += chunkSize) {
        yield inputBytes.slice(j, j + chunkSize);
    }
}

function runBenchmark(libName, hashName, digestFunction, testVectorIndex) {
    /*
        Hashers is a Map mapping digest names to libName:digestFunction values
        values which will be run 10 times each for each test input.
    */

    let encoder = new TextEncoder();
    let encodedBytes = encoder.encode(testVectors[testVectorIndex]);
    let result;
    let resultElement = document.querySelector(
        `[data-hash-name="${hashName}"][data-test-vector-index="${testVectorIndex}"] .${libName}-hash`
    );
    let expectedResult = expectedResults[hashName][testVectorIndex];

    let startMilliseconds = performance.now();

    try {
        if (digestFunction.cannotIterate) {
            result = digestFunction(encodedBytes);
        } else {
            result = digestFunction(chunkIterator(encodedBytes));
        }
    } catch (err) {
        let msg = `Unhandled exception in ${libName} ${hashName}: ${err}`;
        alert(msg);
        throw msg;
    }

    let elapsedMilliseconds = performance.now() - startMilliseconds;

    if (resultElement.textContent && resultElement.textContent != result) {
        let msg =
            `Inconsistent output from ${libName} ${hashName}:` +
            `previously got "${resultElement.textContent}"` +
            ` but just got "${result}" (correct result: ${expectedResult})`;
        alert(msg);
        throw msg;
    }
    resultElement.textContent = result;

    if (result != expectedResult) {
        resultElement.classList.add("error");
        resultElement.closest("tr").classList.add("error");
    }

    results
        .get(hashName)
        .get(testVectorIndex)
        .get(libName)
        .push(elapsedMilliseconds);
}

function updateResultDisplay() {
    for (let [hashName, hashResults] of results) {
        for (let [testVectorIndex, allLibraryResults] of hashResults) {
            let testRow = resultsBody.querySelector(
                `[data-hash-name="${hashName}"][data-test-vector-index="${testVectorIndex}"]`
            );

            for (let [libName, times] of allLibraryResults) {
                let minTimeRow = testRow.querySelector(
                    `.${libName}-min-seconds`
                );

                let minTime = (minTimeRow.value = Math.min(...times));

                minTimeRow.textContent = (minTime / 1000).toFixed(4);

                let maxTimeRow = testRow.querySelector(
                    `.${libName}-max-seconds`
                );
                let maxTime = (maxTimeRow.value = Math.max(...times));

                maxTimeRow.textContent = (maxTime / 1000).toFixed(4);
            }

            let hashResults = new Set(
                Array.from(testRow.querySelectorAll(".hash.result")).map(i =>
                    i.textContent.toString().trim()
                )
            );

            hashResults.delete(""); // We'll ignore empty results since not all algorithms are supported by every library

            if (hashResults.size > 1) {
                testRow.classList.add("error");
            }

            highlightResults(testRow.querySelectorAll(".min-seconds"));
            highlightResults(testRow.querySelectorAll(".max-seconds"));
        }
    }
}

function highlightResults(nodeList) {
    // We'll skip anything without a value since some libraries won't have a result for an unsupported algorithm
    let resultElements = Array.from(nodeList).filter(i => isFinite(i.value));

    if (resultElements.length < 2) {
        return;
    }

    resultElements.sort((a, b) => {
        return a.value - b.value;
    });

    let minValue = resultElements[0].value;
    let maxValue = resultElements[resultElements.length - 1].value;

    resultElements.forEach(i => {
        if (i.value == minValue) {
            i.classList.add("winner");
        } else if (i.value == maxValue && maxValue > minValue) {
            i.classList.add("loser");
        }
    });
}

wasm_hashing
    .then(hashing => {
        let asmSha1 = byteSliceIterator => {
            const hasher = new Sha1();
            for (let chunk of byteSliceIterator) {
                hasher.process(chunk);
            }
            return bytes_to_hex(hasher.finish().result);
        };

        let asmSha2_256 = byteSliceIterator => {
            const hasher = new Sha256();
            for (let chunk of byteSliceIterator) {
                hasher.process(chunk);
            }
            return bytes_to_hex(hasher.finish().result);
        };

        let asmSha2_512 = byteSliceIterator => {
            const hasher = new Sha512();
            for (let chunk of byteSliceIterator) {
                hasher.process(chunk);
            }
            return bytes_to_hex(hasher.finish().result);
        };

        let jsSha1 = byteSliceIterator => {
            let hasher = new jsSHA("SHA-1", "ARRAYBUFFER");
            for (let chunk of byteSliceIterator) {
                hasher.update(chunk.buffer);
            }
            return hasher.getHash("HEX");
        };

        let jsSha2_256 = byteSliceIterator => {
            let hasher = new jsSHA("SHA-256", "ARRAYBUFFER");
            for (let chunk of byteSliceIterator) {
                hasher.update(chunk.buffer);
            }
            return hasher.getHash("HEX");
        };

        let jsSha2_512 = byteSliceIterator => {
            let hasher = new jsSHA("SHA-512", "ARRAYBUFFER");
            for (let chunk of byteSliceIterator) {
                hasher.update(chunk.buffer);
            }
            return hasher.getHash("HEX");
        };

        let jsSha3_256 = byteSliceIterator => {
            let hasher = new jsSHA("SHA3-256", "ARRAYBUFFER");
            for (let chunk of byteSliceIterator) {
                hasher.update(chunk.buffer);
            }
            return hasher.getHash("HEX");
        };

        let jsSha3_512 = byteSliceIterator => {
            let hasher = new jsSHA("SHA3-512", "ARRAYBUFFER");
            for (let chunk of byteSliceIterator) {
                hasher.update(chunk.buffer);
            }
            return hasher.getHash("HEX");
        };

        // Until there's a clean way to bridge iterators or callbacks between Rust we'll just hope
        // that the JS runtime is smart enough not to copy huge inputs but this clearly won't be
        // viable as a long-term solution:
        let wasmSha1 = inputBytes => {
            return hashing.hash_sha1(inputBytes);
        };
        let wasmSha2_256 = inputBytes => {
            return hashing.hash_sha2_256(inputBytes);
        };
        let wasmSha2_512 = inputBytes => {
            return hashing.hash_sha2_512(inputBytes);
        };
        let wasmSha3_256 = inputBytes => {
            return hashing.hash_sha3_256(inputBytes);
        };
        let wasmSha3_512 = inputBytes => {
            return hashing.hash_sha3_512(inputBytes);
        };

        [
            wasmSha1,
            wasmSha2_256,
            wasmSha2_512,
            wasmSha3_256,
            wasmSha3_512
        ].forEach(i => (i.cannotIterate = true));

        let hashers = new Map();

        hashers.set(
            "SHA-1 128",
            new Map([
                ["asmcrypto", asmSha1],
                ["jssha", jsSha1],
                ["wasm", wasmSha1]
            ])
        );

        hashers.set(
            "SHA-2 256",
            new Map([
                ["asmcrypto", asmSha2_256],
                ["jssha", jsSha2_256],
                ["wasm", wasmSha2_256]
            ])
        );

        hashers.set(
            "SHA-2 512",
            new Map([
                ["asmcrypto", asmSha2_512],
                ["jssha", jsSha2_512],
                ["wasm", wasmSha2_512]
            ])
        );

        hashers.set(
            "SHA-3 256",
            new Map([["jssha", jsSha3_256], ["wasm", wasmSha3_256]])
        );

        hashers.set(
            "SHA-3 512",
            new Map([["jssha", jsSha3_512], ["wasm", wasmSha3_512]])
        );

        setupBenchmarks(hashers);
        window.requestAnimationFrame(runNextBenchmark);
    })
    .catch(err => alert(`Unhandled error: ${err}`));
