const path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
	entry: ['./src/main.js'],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve("./build"),
	},
  devServer: {
		static: {
			directory: path.join('./public'),
		},
		compress: true,
		hot: true,
		port: 9000,
	},
  module: {
	unknownContextCritical: false
  },
  plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve("./assets"),
					to: path.resolve("./build/assets"),
					force: true
				},
				{
					from: path.resolve("./node_modules/web-ifc"),
					to: path.resolve("./build/web-ifc"),
					force: true
				}
			],
			options: {concurrency: 100}
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/index.html'
		}),
		new Webpack.HotModuleReplacementPlugin()
  ]
};