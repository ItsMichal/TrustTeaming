/* eslint-disable no-undef */
// const webpack = require('webpack');
const config = {
    mode: "development",
    entry:  {
        'global.js': __dirname + '/src/webScripts/global.js',
        'global.css': __dirname + '/src/assets/css/global.css',
        'adminViewConfig.js': __dirname + '/src/webScripts/adminViewConfigs.jsx',
        'crimeMapListing.js': __dirname + '/src/webScripts/crimeMapListing.jsx',
        'sharedMap.js': __dirname+ '/src/webScripts/sharedMap.jsx'
    },    
    module: {
        rules: [
            {
            test: /\.(js|jsx)?/,
                exclude: /node_modules/,
                use: 'babel-loader'     
            } ,       
            {
                test: /\.css$/i,
                use: ["style-loader","css-loader",'postcss-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                loader: "url-loader",
                options : {
                    name: "/static/dist/images/[name].[ext]"
                }
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css'],
        alias: {
            react: __dirname+ '/node_modules/react'
        }
    },
    output: {
        path: __dirname + '/src/static/dist',
        filename: '[name]',
    },
};
module.exports = config;