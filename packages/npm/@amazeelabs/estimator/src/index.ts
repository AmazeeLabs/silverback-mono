import type { input } from 'zod';

import { configSchema } from './configschema.js';

export type Configuration = input<typeof configSchema>;
