import { NextFunction, Request, RequestHandler, Response } from 'express';
import basicAuth from 'express-basic-auth';

import { getConfig } from './config';
import {
  oAuth2AuthCodeMiddleware,
  OAuth2GrantTypes,
  oAuth2ResourceOwnerPasswordMiddleware,
} from './oAuth2';

/**
 * Returns the Express authentication middleware based on the configuration.
 *
 * Favours OAuth2, then Basic Auth, then falling back to no auth
 * if not configured (= grant access).
 */
export const getAuthenticationMiddleware: RequestHandler =
  ((): RequestHandler => {
    const oAuth2Config = getConfig().oAuth2;
    if (oAuth2Config) {
      if (oAuth2Config.grantType === OAuth2GrantTypes.AuthorizationCode) {
        return oAuth2AuthCodeMiddleware;
      } else if (
        oAuth2Config.grantType === OAuth2GrantTypes.ResourceOwnerPassword
      ) {
        return oAuth2ResourceOwnerPasswordMiddleware;
      } else {
        console.error(
          'Only the AuthorizationCode and ResourceOwnerPassword grant types are currently supported.',
        );
      }
    }

    const basicAuthConfig = getConfig().basicAuth;
    if (basicAuthConfig) {
      return basicAuth({
        users: { [basicAuthConfig.username]: basicAuthConfig.password },
        challenge: true,
      });
    }

    return (req: Request, res: Response, next: NextFunction): void => next();
  })();

/**
 * Checks if a session is required based on the configuration.
 */
export const isSessionRequired = (): boolean => {
  let result = false;
  if (getConfig().oAuth2) {
    const oAuth2Config = getConfig().oAuth2;
    if (!oAuth2Config) {
      throw new Error('Missing OAuth2 configuration.');
    }
    if (oAuth2Config.grantType === OAuth2GrantTypes.AuthorizationCode) {
      result = true;
    }
  }
  return result;
};
