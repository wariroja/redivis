const path = require('path');
const webpack = require('webpack');

module.exports = function () {
	return {
		entry: './javascripts/index.jsx',
		output: {
			path: path.resolve(__dirname, './dist'),
			filename: 'index.js',
		},
		plugins: [
			new webpack.DefinePlugin({
				// Don't get too excited, only has access to public data on Redivis
				'process.env.API_ACCESS_TOKEN': JSON.stringify('AAAAdQfxZHmvQZRzwyrfCW93n9hKt7QM'),
			}),
		],
		mode: 'development',
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								cacheDirectory: true,
								sourceType: 'unambiguous',
								presets: [
									['@babel/preset-react', { useSpread: true }],
									[
										'@babel/preset-env',
										{
											targets: ['safari 14', 'firefox 81', 'chrome 86'],
											modules: false,
											bugfixes: true,
											useBuiltIns: 'usage',
											corejs: { version: 3, proposals: true },
										},
									],
								],
								plugins: [
									'@babel/plugin-proposal-class-properties',
									'@babel/plugin-proposal-export-default-from',
								],
							},
						},
					],
				},
				{
					test: /\.css$/,
					exclude: /node_modules/,
					use: [
						{ loader: 'style-loader' },
						{
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: '[name]_[local]-[hash:base64:3]',
								},
								importLoaders: 1,
							},
						},
						'postcss-loader',
					],
				},
			],
		},
		resolve: {
			extensions: ['*', '.js', '.jsx'],
		},
		devtool: 'cheap-module-source-map',
	};
};
