import { RegisterUserUseCase } from './register-user.use-case';
import { UsernameTakenError } from '../../domain/errors/auth-errors';
import {
  FakeHasher,
  FakeTokenService,
  FakeUserRepository,
  SequentialIdGenerator,
} from './auth-test-doubles';

function buildSubject() {
  const users = new FakeUserRepository();
  const useCase = new RegisterUserUseCase(
    users,
    new FakeHasher(),
    new FakeTokenService(),
    new SequentialIdGenerator(),
  );
  return { users, useCase };
}

describe('RegisterUserUseCase', () => {
  it('should_create_a_user_with_a_hashed_password_and_return_a_token', async () => {
    // Arrange
    const { users, useCase } = buildSubject();

    // Act
    const result = await useCase.execute({ username: 'alice', password: 'secret' });

    // Assert
    expect(result.user).toEqual({ id: 'id-1', username: 'alice', role: 'user' });
    expect(result.accessToken).toBe('token:id-1');
    const stored = await users.findByUsername('alice');
    expect(stored?.passwordHash).toBe('hashed:secret');
  });

  it('should_throw_UsernameTakenError_when_the_username_already_exists', async () => {
    // Arrange
    const { useCase } = buildSubject();
    await useCase.execute({ username: 'alice', password: 'secret' });

    // Act / Assert
    await expect(useCase.execute({ username: 'alice', password: 'other' })).rejects.toThrow(
      UsernameTakenError,
    );
  });
});
