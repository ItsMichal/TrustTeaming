const tailwindcss = require('tailwindcss');
module.exports = {
  plugins: [
    'postcss-preset-env',
    require('autoprefixer'),
    require('postcss-nested'),
    tailwindcss
  ],
};