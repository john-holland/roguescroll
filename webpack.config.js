const path = require('path');
const webpack = require('webpack');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');

module.exports = {
    context: __dirname + "/client/js",
    entry: path.resolve(__dirname, "client/js/context.js"),

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.bundle.js',
        library: {
            type: 'umd',
            name: 'RogueScroll',
            export: 'default',
            umdNamedDefine: true
        },
        globalObject: 'this',
        crossOriginLoading: 'anonymous'
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader',
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            'jquery': path.resolve(__dirname, 'node_modules/jquery/dist/jquery.js'),
            'jquery.transit': path.resolve(__dirname, 'node_modules/jquery.transit/jquery.transit.js'),
            'jquery.color': path.resolve(__dirname, 'node_modules/jquery-color/jquery.color.js'),
            'mori': path.resolve(__dirname, 'node_modules/mori/mori.js')
        }
    },
    externals: {
        'jquery': 'jQuery',
        'mori': 'mori',
        'underscore': '_',
        'pixi.js': 'PIXI'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            mori: 'mori'
        }),
        new SubresourceIntegrityPlugin({
            hashFuncNames: ['sha384'],
            enabled: process.env.NODE_ENV === 'production'
        })
    ],
    optimization: {
        moduleIds: 'named'
    }
};