export interface TokenPayload {
  sub: string;
  username: string;
  role: string;
}

/** Port for issuing and verifying authentication tokens (DI token + abstraction). */
export abstract class TokenService {
  abstract sign(payload: TokenPayload): Promise<string>;
  abstract verify(token: string): Promise<TokenPayload>;
}
