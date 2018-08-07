/* global module, require, __dirname */

const path = require("path");

module.exports = {
    entry: "./benchmark.js",
    output: {
        path: path.resolve(__dirname, "dist/benchmark/"),
        filename: "benchmark.js",
    },
    devtool: "source-map",
    // mode: "development",
    mode: "production",
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
};
