const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './client/js/context.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.bundle.js',
        library: {
            type: 'umd',
            name: 'RogueScroll',
            export: 'default',
            umdNamedDefine: true
        },
        globalObject: 'this'
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
            'jquery.color': path.resolve(__dirname, 'node_modules/jquery-color/jquery.color.js')
        }
    },
    externals: {
        'jquery': 'jQuery',
        'mori': 'mori',
        'underscore': '_'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        })
    ],
    optimization: {
        moduleIds: 'named'
    }
};