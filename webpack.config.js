const webpack = require('webpack');
const config = {
    mode: "development",
    entry:  {
        login: __dirname + '/src/webScripts/login.js',
    
    },    
    output: {
        path: __dirname + '/src/static/dist',
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
  
    module: {
        rules: [
            {
            test: /\.(js|jsx)?/,
                exclude: /node_modules/,
                use: 'babel-loader'     
            }        
        ]
    }
};
module.exports = config;