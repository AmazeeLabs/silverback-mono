export {
  TokenAuthHandler,
  TokenExpiredError,
  TokenInvalidError,
} from './lib/handler.js';
export type {
  AuthenticationBackendInterface,
  TokenEncoderInterface,
} from './lib/handler.js';
export { JwtEncoder } from './lib/jwt-encoder.js';
export {
  EmailBackend,
  PostmarkEmailBackend,
  TestEmailBackend,
} from './lib/email-backend.js';

export { TokenAuthClient } from './lib/client.js';
