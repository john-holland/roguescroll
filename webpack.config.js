var path = require('path');

module.exports = {
    context: __dirname + "/client/js",
    entry: path.resolve(__dirname, "client/js/rogue-scroll.js"),
    output: {
        path: path.resolve(__dirname, "client/"),
        filename: "game.js"
    },
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        "jquery": "jQuery"
    },
     module: {
        loaders: [
            { test: /\.hbs$/i, loader: "handlebars-loader" },
            { test: /\.html$|\.css$/i, loader: "raw" },
            { test: /\.html$/i, loader: "html" },
            { test: /\.css$/i, loader: "css" },
            { test: __dirname + "/client/js/rogue-scroll.js", loader: "expose?RogueScroll" },
            { test: __dirname + "/client/js/util/chance.js", loader: "expose?chance" }
        ]
    }
};