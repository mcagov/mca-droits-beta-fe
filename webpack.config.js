/* eslint-disable */
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = (env) => {
  const devMode = !env || !env.production;

  return {
    mode: devMode ? 'development' : 'production',
    entry: {
      main: ['@babel/polyfill', './app/js/index.js'],
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'assets/js/[name].js',
      library: '[name]Module',
    },
    resolve: {
      extensions: ['.js', '.json', '.scss', '.css', '.njk'],
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { sourceMap: true, url: false } },
            { loader: 'postcss-loader', options: { sourceMap: true } },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ],
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
              },
            },
          ],
        },
      ],
    },
    stats: {
      colors: true,
    },
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].css',
      }),
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        proxy: 'http://localhost:5000/',
        files: ['dist/css/*.css', 'dist/js/*.js', 'app/views/**/*.html'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'app/assets/images/'),
            to: path.join(__dirname, 'dist/assets/images/'),
            noErrorOnMissing: true,
          },
          {
            from: path.join(__dirname, 'app/assets/downloads/'),
            to: path.join(__dirname, 'dist/assets/downloads/'),
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    optimization: {
      minimize: !devMode,
      minimizer: [
        new TerserPlugin({
          sourceMap: true,
          parallel: true,
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
            },
          },
        }),
      ],
    },
  };
};
