/** Typed application configuration, sourced from environment variables. */
export interface AppConfig {
  port: number;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  admin: {
    username: string;
    password: string;
  };
  database: {
    /** Postgres connection string. Empty ⇒ fall back to in-memory persistence. */
    url: string;
    /** Whether to require SSL (true for cloud Postgres, false for local). */
    ssl: boolean;
    /** Auto-create/update tables from the entities (handy for this project). */
    synchronize: boolean;
  };
}

export const configuration = (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  admin: {
    username: process.env.ADMIN_USERNAME ?? 'admin',
    password: process.env.ADMIN_PASSWORD ?? 'admin12345',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
    ssl: process.env.DATABASE_SSL === 'true',
    synchronize: process.env.DATABASE_SYNCHRONIZE !== 'false',
  },
});
