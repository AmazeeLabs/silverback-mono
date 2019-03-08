const postCss = require('../postcss.config');

const path = require('path');

module.exports = ({ config, mode }) => {
	config.module.rules.push({
		test: /\.ts$/,
		use: [
			{
				loader: require.resolve('babel-loader'),
			},
		],
	});

	config.module.rules.push({
		test: /\.twig$/,
    use: 'twigjs-loader',
	});

	config.module.rules.push({
		test: /\.css$/,
    use: [
    		{ loader: 'postcss-loader' },
    ]
	});

	config.resolve.extensions.push('.ts');
	return config;
};
