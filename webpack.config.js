const webpack = require('webpack');
const config = {
    mode: "development",
    entry:  {
        login: __dirname + '/src/webScripts/login.js',
        adminViewConfig: __dirname + '/src/webScripts/adminViewConfigs.jsx'
    },    
   
  
    module: {
        rules: [
            {
            test: /\.(js|jsx)?/,
                exclude: /node_modules/,
                use: 'babel-loader'     
            }        
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    output: {
        path: __dirname + '/src/static/dist',
        filename: '[name].js',
    },
};
module.exports = config;