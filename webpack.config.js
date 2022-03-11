var path = require('path');

module.exports = {
    context: __dirname + "/client/js",
    entry: path.resolve(__dirname, "client/js/context.js"),
    output: {
        path: path.resolve(__dirname, "client/"),
        filename: "game.js"
    },
     module: {
        loaders: [
            { test: /\.hbs$/i, loader: "handlebars-loader" },
            { test: /\.html$|\.css$/i, loader: "raw" },
            { test: /\.html$/i, loader: "html" },
            { test: /\.css$/i, loader: "css" }
        ]
    }
};