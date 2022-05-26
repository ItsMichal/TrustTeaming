const webpack = require('webpack');
const config = {
    mode: "development",
    entry:  {
        'login.js': __dirname + '/src/webScripts/login.js',
        'adminViewConfig.js': __dirname + '/src/webScripts/adminViewConfigs.jsx',
        'crimeMapListing.js': __dirname + '/src/webScripts/crimeMapListing.jsx',
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
                use: ["style-loader","css-loader"],
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
        extensions: ['.js', '.jsx', '.css']
    },
    output: {
        path: __dirname + '/src/static/dist',
        filename: '[name]',
    },
};
module.exports = config;