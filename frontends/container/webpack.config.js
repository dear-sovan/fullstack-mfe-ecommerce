const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
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
      name: 'container',
      remotes: {
        productsMfe: `promise new Promise(resolve => {
          const remoteUrl = window.location.origin + '/mfe/products-mfe/remoteEntry.js';
          if (window.productsMfe) return resolve(window.productsMfe);

          const script = document.createElement('script');
          script.src = remoteUrl;
          script.onload = () => resolve(window.productsMfe);
          script.onerror = () => console.error('Failed to load productsMfe');
          document.head.appendChild(script);
        })`,
        productDetailsMfe: `promise new Promise(resolve => {
          const remoteUrl = window.location.origin + '/mfe/product-details-mfe/remoteEntry.js';
          if (window.productDetailsMfe) return resolve(window.productDetailsMfe);

          const script = document.createElement('script');
          script.src = remoteUrl;
          script.onload = () => resolve(window.productDetailsMfe);
          script.onerror = () => console.error('Failed to load productDetailsMfe');
          document.head.appendChild(script);
        })`,
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        '@reduxjs/toolkit': { singleton: true },
        'react-redux': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};