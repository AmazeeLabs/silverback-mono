
const conf = require('../webpack.config');
const path = require('path');

module.exports = ({ config, mode }) => {
	config.module.rules.push({
		test: /\.ts$/,
		loader: require.resolve('babel-loader'),
	});

	config.module.rules.push({
		test: /\.(jpe?g|svg|png)$/,
		loader: "url-loader",
		options: {
			limit: 8192,
			fallback: "file-loader",

			// fallback options
			name: '[name].[hash].[ext]',
			outputPath: 'images/',
		},
	});

	config.module.rules.push(      {
		test: /\.twig$/,
		use: [
			{
				loader: 'twig-loader',
				options: {
					twigOptions: {
						namespaces: {
							storybook: path.resolve('stories')
						}
					}
				}
			}
		],
	},);

	config.module.rules.push({
		test: /\.css$/,
    use: [
			'postcss-loader',
    ]
	});

	config.resolve.extensions.push('.ts');
	return config;
};
