import { document, console } from 'global';
import { storiesOf } from '@storybook/html';

const example = require('./example.twig');

storiesOf('Example', module)
	.add('example', () => example({
		content: 'This is some content.'
	}))
	.add('example2', () => example({
		showBanana: true,
		content: 'This is some other content.'
	}))
;
