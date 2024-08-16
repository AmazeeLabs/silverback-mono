import { z } from 'zod';

export enum ApplicationState {
  /**
   * The application is starting and not yet available.
   */
  Starting = 'starting',
  /**
   * A fatal error during startup happened, application is not available.
   */
  Fatal = 'fatal',
  /**
   * A build error happened. Application is still available, but not up-to-date.
   */
  Error = 'error',
  /**
   * Application is updating, but still available.
   */
  Updating = 'updating',
  /**
   * Application is up-to-date.
   */
  Ready = 'ready',
}

export type BuildModel = {
  id: number;
  startedAt: number;
  finishedAt: number;
  success: boolean;
  type: 'incremental' | 'full' | 'github-workflow';
  logs: string;
};

export const envVarNameSchema = z.string().regex(/^[a-z_][a-z0-9_]*$/i, {
  message: 'Invalid environment variable name',
});

export const envVarsSchema = z.record(envVarNameSchema, z.string(), {
  message: 'Invalid environment variables',
});

export const workflowPublisherPayloadSchema = z.object(
  {
    callbackUrl: z.string().url(),
    clearCache: z.boolean(),
    environmentVariables: envVarsSchema.optional(),
  },
  {
    message: 'Invalid publisher payload',
  },
);
export type WorkflowPublisherPayload = z.infer<
  typeof workflowPublisherPayloadSchema
>;

export const workflowStatusNotificationSchema = z.object(
  {
    status: z.enum(['started', 'success', 'failure']),
    workflowRunUrl: z.string().url(),
  },
  {
    message: 'Invalid workflow status notification',
  },
);
export type WorkflowStatusNotification = z.infer<
  typeof workflowStatusNotificationSchema
>;
