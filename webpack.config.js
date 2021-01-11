const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');

const srcPath = path.resolve(__dirname, './app');
const buildPath = path.resolve(__dirname, 'dist');
const govUkPath = 'node_modules/govuk-frontend/govuk';
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
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
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
      /*{
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                    publicPath: 'fonts', //<--resolve the path in css files
                    outputPath: path.join(__dirname, 'dist/fonts'), //<-- path to place font files
                    context: './node_modules/govuk-frontend/govuk/assets'
                }
            }
        ]
      }*/
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
    new CopyPlugin({
      patterns: [
        { from: path.resolve(govUkPath, 'assets/images'), to: 'assets/images' },
        { from: path.resolve(govUkPath, 'assets/fonts'), to: 'assets/fonts' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "app.min.css"
    }),
  ]
};