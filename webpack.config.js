const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');

const srcPath = path.resolve(__dirname, './app');
const buildPath = path.resolve(__dirname, 'dist');
const scriptsSrc = path.join(srcPath, '/assets/scripts');
const stylesSrc = path.join(srcPath, '/assets/scss');
const imagesSrc = path.join(srcPath, '/assets/images');

module.exports = {
  entry: {
    main: './app/app.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].min.js'
  },
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: scriptsSrc,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
            }
          },
          {
            loader: 'sass-loader',
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            context: imagesSrc,
            outputPath: path.join(buildPath, "assets/images/")
          }
        }
      },
    ]
  },
  plugins: [
    //new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'ROW reporting form',
      template: path.join(srcPath, "views/index.html"),
      filename: "./index.html",
      excludeChunks: [ 'server' ]
    }), 
    new MiniCssExtractPlugin({
      filename: "app.min.css"
    }),
  ]
};