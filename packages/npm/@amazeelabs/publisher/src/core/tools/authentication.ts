import { NextFunction, Request, RequestHandler, Response } from 'express';
import basicAuth from 'express-basic-auth';

import { getConfig, PublisherConfig } from './config';
import {
  oAuth2AuthCodeMiddleware,
  oAuth2ResourceOwnerPasswordMiddleware,
} from './oAuth2';
import { OAuth2GrantTypes } from './oAuth2GrantTypes';

/**
 * Returns the Express authentication middleware based on the configuration.
 *
 * Favours OAuth2, then Basic Auth, then falling back to no auth
 * if not configured (= grant access).
 */
export const getAuthenticationMiddleware = (
  config: PublisherConfig,
): RequestHandler =>
  ((): RequestHandler => {
    const skipAuthentication =
      process.env.PUBLISHER_SKIP_AUTHENTICATION === 'true';
    if (skipAuthentication) {
      return (req: Request, res: Response, next: NextFunction): void => next();
    }

    const oAuth2Config = config.oAuth2;
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
