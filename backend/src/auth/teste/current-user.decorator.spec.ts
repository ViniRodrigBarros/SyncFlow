import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser, AuthUser } from '../current-user.decorator';

/**
 * Decorators feitos com `createParamDecorator` armazenam o factory em
 * metadata da rota. Para testar a lógica de extração, aplicamos o
 * decorator imperativamente em uma classe dummy e recuperamos o factory
 * do metadata — sem depender de sintaxe `@decorator()` em runtime.
 */
function extractFactory(decorator: ReturnType<typeof CurrentUser>) {
  class Dummy {}
  (decorator as any)(Dummy.prototype, 'handler', 0);
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Dummy, 'handler');
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser decorator', () => {
  const user: AuthUser = {
    id: 1,
    login: 'alpha@teste.com',
    nome: 'Usuário Alpha',
    empresaId: 1,
    empresa: { id: 1, nome: 'Empresa Alpha' },
  };

  function buildContext(req: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
    } as unknown as ExecutionContext;
  }

  it('extrai req.user do request HTTP', () => {
    const factory = extractFactory(CurrentUser());
    const ctx = buildContext({ user });

    const result = factory(undefined, ctx);

    expect(result).toEqual(user);
  });

  it('retorna undefined quando req.user não existe', () => {
    const factory = extractFactory(CurrentUser());
    const ctx = buildContext({});

    const result = factory(undefined, ctx);

    expect(result).toBeUndefined();
  });
});
