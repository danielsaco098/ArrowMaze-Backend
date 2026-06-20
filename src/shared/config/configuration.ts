/** Typed application configuration, sourced from environment variables. */
export interface AppConfig {
  port: number;
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export const configuration = (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
});
