/* global module, require, __dirname */

const path = require("path");

module.exports = [
    {
        entry: "./benchmark.js",
        output: {
            path: path.resolve(__dirname, "dist/benchmark/"),
            filename: "benchmark.js",
        },
        devtool: "source-map",
        mode: "production",
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
            ],
        },
    },
    {
        entry: "./sha256.webworker.js",
        target: "webworker",
        output: {
            path: path.resolve(__dirname, "dist/webworkers/sha256/"),
            filename: "webworker.js",
        },
        devtool: "source-map",
        mode: "production",
        module: {
            rules: [
                {
                    test: /\.wasm$/,
                    type: "webassembly/experimental",
                },
            ],
        },
    },
];
