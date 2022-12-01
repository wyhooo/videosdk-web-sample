const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const args = process.argv;
let https = false;
let disableCORP = true;
if (args.includes('https')) https = true;
if (args.includes('corp')) disableCORP = false;

module.exports = {
  mode: 'production',
  entry: {
    app: './src/js/index.js'
  },
  stats: {
    errorDetails: false
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 500000
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  // resolve: {
  //   fallback: {
  //     crypto: require.resolve('crypto-browserify')
  //   },
  //   alias: {
  //     process: 'process/browser',
  //     browser: 'crypto-browserify'
  //   }
  // },
  target: 'web',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.BABEL_ENV': JSON.stringify('production')
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html'
    })
  ]
};
