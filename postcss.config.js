const path = require('path');

module.exports = {
	plugins: [
		require('postcss-mixins')({
			mixinsDir: path.join(__dirname, 'stylesheets/mixins'),
		}),
		require('postcss-preset-env')({
			stage: 1,
		}),
		require('postcss-pxtorem')({
			rootValue: 16,
			unitPrecision: 5,
			propList: ['*'],
		}),
	],
};
