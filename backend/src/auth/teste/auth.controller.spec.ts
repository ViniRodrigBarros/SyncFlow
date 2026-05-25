import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthUser } from '../current-user.decorator';

describe('AuthController', () => {
  let controller: AuthController;
  let service: {
    login: jest.Mock;
    register: jest.Mock;
    me: jest.Mock;
  };

  const user: AuthUser = {
    id: 1,
    login: 'alpha@teste.com',
    nome: 'Usuário Alpha',
    empresaId: 1,
    empresa: { id: 1, nome: 'Empresa Alpha' },
  };

  beforeEach(() => {
    service = {
      login: jest.fn(),
      register: jest.fn(),
      me: jest.fn(),
    };
    controller = new AuthController(service as unknown as AuthService);
  });

  describe('login', () => {
    it('delega para AuthService.login e retorna o resultado', async () => {
      const dto = { login: 'alpha@teste.com', senha: '123456' };
      const expected = { token: 'abc', usuario: { id: 1 } };
      service.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('register', () => {
    it('delega para AuthService.register e retorna o resultado', async () => {
      const dto = {
        nome: 'Novo',
        login: 'novo@teste.com',
        senha: '123456',
        empresaId: 1,
      };
      const expected = { token: 'xyz', usuario: { id: 99 } };
      service.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('me', () => {
    it('chama AuthService.me com o id do usuário logado', async () => {
      const expected = { id: 1, login: 'alpha@teste.com' };
      service.me.mockResolvedValue(expected);

      const result = await controller.me(user);

      expect(service.me).toHaveBeenCalledWith(user.id);
      expect(result).toBe(expected);
    });
  });
});
