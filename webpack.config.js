require('dotenv').config();

var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var miniCssExtractPlugin = require("mini-css-extract-plugin");
const LiveReloadPlugin = require('webpack-livereload-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require("vue-loader/lib/plugin");

var baseConfig = {

    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        "presets": [["@babel/preset-env"]],
                        "plugins": ["transform-es2015-destructuring", "@babel/transform-runtime", "es6-promise"]
                    }
                }],
                exclude: /node_modules/
            },
            // {
            //     test: /\.scss$/,
            //     loader: 'style-loader!css-loader!sass-loader'
            // },
            // {
            //     test: /\.css$/i,
            //     use: [miniCssExtractPlugin.loader, 'css-loader'],
            // },
            {
                test: /\.(png|jpg|gif|svg|ttf|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]',
                    // 重要, 参考 https://stackoverflow.com/questions/59070216/webpack-file-loader-outputs-object-module
                    esModule: false
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'js': 'babel-loader?presets[]=env'
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
        }
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    performance: {
        hints: false
    }
};

let targets = ['web', 'node'].map((target) => {
    let obj = webpackMerge.merge(baseConfig, {
        target: target,
        entry: {
            app: target === 'web'
                ? process.env.NODE_ENV === 'development'
                    ? [`./src/${target}.entry.js`, 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000']
                    : [`./src/${target}.entry.js`]
                : [`./src/${target}.entry.js`],
        },
        output: {
            filename: `${target}.bundle.js`,
            libraryTarget: target === 'web' ? 'var' : 'commonjs2'
        },
        module: {
            rules: [
                // {
                //     test: /\.scss$/,
                //     use: [
                //         {
                //             loader: "sass-loader", options: {
                //                 additionalData: "$publicpath : " + publicpath
                //             }
                //         }]
                // },
                // {
                //     test: /\.scss$/,
                //     loader: 'style-loader!css-loader!sass-loader'
                // },
                {
                    test: /\.scss$/,
                    use: [{
                        loader: miniCssExtractPlugin.loader
                    }, {
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }]
                },
                // {
                //     test: /\.css$/,
                //     use: [
                //         {
                //             loader: miniCssExtractPlugin.loader
                //         },
                //         'css-loader',
                //     ],
                // },
            ]
        },
        plugins: target === 'web'
            ? process.env.NODE_ENV === 'development'
                ? [
                    new webpack.HotModuleReplacementPlugin(),
                    new miniCssExtractPlugin({
                        filename: 'style.css'
                    }),
                    new VueLoaderPlugin(),
                    new LiveReloadPlugin()
                ]
                : [
                    new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'}}),
                    new webpack.LoaderOptionsPlugin({minimize: true}),
                    // we specify a custom UglifyJsPlugin here to get source maps in production
                    new UglifyJsPlugin({
                        cache: true,
                        parallel: true,
                        uglifyOptions: {
                            compress: false,
                            ecma: 6,
                            mangle: true
                        },
                        sourceMap: true
                    }),
                    new miniCssExtractPlugin({
                        filename: 'style.css'
                    }),
                    new VueLoaderPlugin(),
                ]
            : [new VueLoaderPlugin()]
        ,
        devtool: target === 'web'
            ? process.env.NODE_ENV === 'development'
                ? '#eval-source-map'
                : '#source-map'
            : false
        ,
        mode: process.env.NODE_ENV === 'development'
            ? 'development'
            : 'production'
    });
    if (process.env.NODE_ENV === 'development' && target === 'web') {
        obj.module.rules[0].use.push({loader: 'webpack-module-hot-accept'});
    }
    return obj;
});

module.exports = targets;






