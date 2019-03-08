import { document, console } from 'global';
import { storiesOf } from '@storybook/html';

import Example from './example.twig';

storiesOf('Example', module)
	.add('example', () => Example({
		title: 'This is a title',
		content: 'And this is some content.'
	}));
