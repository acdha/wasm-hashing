import "./index.css";

import { Sha1, Sha256, Sha512, bytes_to_hex } from "asmcrypto.js";
import filesize from "filesize";
let wasm_hashing = import("./wasm_hashing");

// TODO: add a file-based test using the file reader object in chunks to avoid data marshalling overhead
const testVectors = [
    "",
    "Hello World!",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(1000),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(10000),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(100000),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(1000000),
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(10000000)
];

let resultsTable = document.getElementById("results");
let resultsBody = resultsTable.querySelector("tbody");
let resultTemplate = document.getElementById("result-template");

let hashers = new Map();

function runNextBenchmark() {
    let [hashName, implementations] = hashers.entries().next().value;
    hashers.delete(hashName);

    runBenchmark(hashName, implementations);

    if (hashers.size) {
        window.requestAnimationFrame(runNextBenchmark);
    }
}

function runBenchmark(hashName, implementations) {
    /*
        Hashers is a Map mapping digest names to libName:digestFunction values
        values which will be run 10 times each for each test input.
    */

    let encoder = new TextEncoder();

    testVectors.forEach(testVector => {
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
        resultsBody.appendChild(entry);

        let encodedBytes = encoder.encode(testVector);

        for (let [libName, testHasher] of implementations) {
            let times = [];
            let result = null;

            for (let i = 0; i < 10; i++) {
                let startMilliseconds = performance.now();
                let newResult;

                try {
                    newResult = testHasher(encodedBytes);
                } catch (err) {
                    alert(
                        `Unhandled exception in ${libName} ${hashName}: ${err}`
                    );
                    throw `Unhandled exception in ${libName} ${hashName}: ${err}`;
                }

                if (result != null && result != newResult) {
                    alert(
                        `${libName} ${hashName} didn't return consistent results!`
                    );
                    throw `Inconsistent results from ${libName} for ${hashName}`;
                } else {
                    result = newResult;
                }

                let elapsedMilliseconds = performance.now() - startMilliseconds;

                times.push(elapsedMilliseconds / 1000);
            }

            entry.querySelector(`.${libName}-hash`).textContent = result;

            let minTime = entry.querySelector(`.${libName}-min-seconds`);
            minTime.value = minTime.textContent = Math.min(...times).toFixed(4);

            let maxTime = entry.querySelector(`.${libName}-max-seconds`);
            maxTime.value = maxTime.textContent = Math.max(...times).toFixed(4);
        }

        let hashResults = new Set(
            Array.from(entry.querySelectorAll(".hash.result")).map(
                i => i.textContent
            )
        );

        if (hashResults.size > 1) {
            entry.classList.add("error");
        }

        let minTimes = Array.from(entry.querySelectorAll(".min-seconds"));
        minTimes.sort((a, b) => {
            return a.value - b.value;
        });
        minTimes[0].classList.add("winner");

        let maxTimes = Array.from(entry.querySelectorAll(".max-seconds"));
        maxTimes.sort((a, b) => {
            return a.value - b.value;
        });
        maxTimes[0].classList.add("winner");
    });
}

wasm_hashing
    .then(hashing => {
        let asmSha1 = inputBytes => {
            const hasher = new Sha1();
            hasher.process(inputBytes);
            return bytes_to_hex(hasher.finish().result);
        };

        let asmSha256 = inputBytes => {
            const hasher = new Sha256();
            hasher.process(inputBytes);
            return bytes_to_hex(hasher.finish().result);
        };

        let asmSha512 = inputBytes => {
            const hasher = new Sha512();
            hasher.process(inputBytes);
            return bytes_to_hex(hasher.finish().result);
        };

        let wasmSha1 = inputBytes => {
            return hashing.sha1(inputBytes);
        };
        let wasmSha256 = inputBytes => {
            return hashing.sha256(inputBytes);
        };
        let wasmSha512 = inputBytes => {
            return hashing.sha512(inputBytes);
        };

        hashers.set(
            "SHA-1 128",
            new Map([["asmcrypto", asmSha1], ["wasm", wasmSha1]])
        );
        hashers.set(
            "SHA-2 256",
            new Map([["asmcrypto", asmSha256], ["wasm", wasmSha256]])
        );
        hashers.set(
            "SHA-2 512",
            new Map([["asmcrypto", asmSha512], ["wasm", wasmSha512]])
        );

        window.requestAnimationFrame(runNextBenchmark);
    })
    .catch(err => alert(`Unhandled error: ${err}`));
