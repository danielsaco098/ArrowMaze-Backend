import { LoginUserUseCase } from './login-user.use-case';
import { RegisterUserUseCase } from './register-user.use-case';
import { InvalidCredentialsError } from '../../domain/errors/auth-errors';
import {
  FakeHasher,
  FakeTokenService,
  FakeUserRepository,
  SequentialIdGenerator,
} from './auth-test-doubles';

function buildSubject() {
  const users = new FakeUserRepository();
  const hasher = new FakeHasher();
  const tokens = new FakeTokenService();
  const register = new RegisterUserUseCase(users, hasher, tokens, new SequentialIdGenerator());
  const login = new LoginUserUseCase(users, hasher, tokens);
  return { register, login };
}

describe('LoginUserUseCase', () => {
  it('should_return_a_token_when_credentials_are_valid', async () => {
    // Arrange
    const { register, login } = buildSubject();
    await register.execute({ username: 'bob', password: 'pw' });

    // Act
    const result = await login.execute({ username: 'bob', password: 'pw' });

    // Assert
    expect(result.user.username).toBe('bob');
    expect(result.accessToken).toBe('token:id-1');
  });

  it('should_throw_InvalidCredentialsError_when_the_user_does_not_exist', async () => {
    const { login } = buildSubject();
    await expect(login.execute({ username: 'ghost', password: 'pw' })).rejects.toThrow(
      InvalidCredentialsError,
    );
  });

  it('should_throw_InvalidCredentialsError_when_the_password_is_wrong', async () => {
    const { register, login } = buildSubject();
    await register.execute({ username: 'bob', password: 'pw' });

    await expect(login.execute({ username: 'bob', password: 'wrong' })).rejects.toThrow(
      InvalidCredentialsError,
    );
  });
});
