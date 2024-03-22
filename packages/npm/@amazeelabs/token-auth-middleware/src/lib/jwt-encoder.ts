import { b64utoutf8, KJUR } from 'jsrsasign';

import {
  TokenEncoderInterface,
  TokenExpiredError,
  TokenInvalidError,
} from './handler.js';

/**
 * Simplified interface for creating and validating JSON Web Tokens.
 */
export class JwtEncoder implements TokenEncoderInterface {
  constructor(protected secret: string) {}

  async create(id: string, lifetime?: number) {
    const header = { alg: 'HS256', typ: 'JWT' };
    return KJUR.jws.JWS.sign(
      'HS256',
      JSON.stringify(header),
      JSON.stringify({
        id,
        exp: lifetime ? new Date().getTime() / 1000 + lifetime : undefined,
      }),
      this.secret,
    );
  }

  async validate(token: string) {
    const isValid = KJUR.jws.JWS.verifyJWT(token, this.secret, {
      alg: ['HS256'],
    });
    const { exp, id } = (JSON.parse(b64utoutf8(token.split('.')[1])) || {}) as {
      exp?: number;
      id?: string;
    };
    if (exp && exp < new Date().getTime() / 1000) {
      throw new TokenExpiredError();
    }
    if (!id || !isValid) {
      throw new TokenInvalidError();
    }
    return id;
  }
}
