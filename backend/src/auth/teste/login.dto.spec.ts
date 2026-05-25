import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../dto/login.dto';

async function validateDto(input: any) {
  const dto = plainToInstance(LoginDto, input);
  return validate(dto);
}

describe('LoginDto', () => {
  it('aceita payload válido', async () => {
    const errors = await validateDto({
      login: 'alpha@teste.com',
      senha: '123456',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejeita login vazio', async () => {
    const errors = await validateDto({ login: '', senha: '123456' });
    expect(errors.some(e => e.property === 'login')).toBe(true);
  });

  it('rejeita login ausente', async () => {
    const errors = await validateDto({ senha: '123456' });
    expect(errors.some(e => e.property === 'login')).toBe(true);
  });

  it('rejeita senha com menos de 4 caracteres', async () => {
    const errors = await validateDto({
      login: 'alpha@teste.com',
      senha: '123',
    });
    const senhaError = errors.find(e => e.property === 'senha');
    expect(senhaError).toBeDefined();
    expect(senhaError?.constraints?.minLength).toBeDefined();
  });

  it('rejeita senha ausente', async () => {
    const errors = await validateDto({ login: 'alpha@teste.com' });
    expect(errors.some(e => e.property === 'senha')).toBe(true);
  });

  it('rejeita campos com tipo incorreto', async () => {
    const errors = await validateDto({ login: 123, senha: 456 });
    expect(errors.length).toBeGreaterThan(0);
  });
});
