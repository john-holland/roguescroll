var path = require('path');

module.exports = {
    mode: 'development',
    context: __dirname + "/client/js",
    entry: path.resolve(__dirname, "client/js/context.js"),
    output: {
        path: path.resolve(__dirname, "client/"),
        filename: "game.js"
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
     module: {
        rules: [
            { test: /\.hbs$/i, use: "handlebars-loader" },
            { test: /\.html$|\.css$/i, use: "raw-loader" },
            { test: /\.html$/i, use: "html-loader" },
            { test: /\.css$/i, use: "css-loader" }
        ]
    }
};