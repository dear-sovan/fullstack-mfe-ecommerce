const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: 3002,
    historyApiFallback: true,
    // Add CORS headers if running across different localhost ports
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      { test: /\.(ts|tsx)$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'productDetailsMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductDetailsApp': './src/App',
      },
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
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};