const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: 3001,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    publicPath: 'auto',
  },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  module: {
    rules: [
      { test: /\.(ts|tsx)$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'productsMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/RootComponent',
        './productSlice': './src/store/productSlice',
        './cartSlice': './src/store/cartSlice',
      },
      shared: {
        react: { 
          singleton: true, 
          eager: true, 
          requiredVersion: '^18.2.0' 
        },
        'react-dom': { 
          singleton: true, 
          eager: true, 
          requiredVersion: '^18.2.0' 
        },
        '@reduxjs/toolkit': { 
          singleton: true, 
          eager: true, 
          requiredVersion: '^2.2.1' // Match your installed @reduxjs/toolkit major version
        },
        'react-redux': { 
          singleton: true, 
          eager: true, 
          requiredVersion: '^9.1.0' // Match your installed react-redux major version (or ^8.0.0)
        },
        'react-router-dom': { singleton: true, eager: true, requiredVersion: '^7.18.2' }
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};
