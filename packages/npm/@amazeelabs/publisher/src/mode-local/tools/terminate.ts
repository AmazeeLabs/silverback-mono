// We cannot do
//   import terminate from 'terminate/promise'
// because "/promise" subpath is not registered in the "exports" of the
// terminate package. So we import the default callback-style function and
// promisify it ourselves.

import terminateWithCallback from 'terminate';
import Terminate from 'terminate/promise'; // This import will be thrown out by rollup.
import { promisify } from 'util';

export const terminate: typeof Terminate = promisify(terminateWithCallback);
