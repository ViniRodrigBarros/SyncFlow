import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from '../dto/register.dto';

async function validateDto(input: any) {
  const dto = plainToInstance(RegisterDto, input);
  return validate(dto);
}

describe('RegisterDto', () => {
  const valid = {
    nome: 'Novo Usuário',
    login: 'novo@teste.com',
    senha: '123456',
    empresaId: 1,
  };

  it('aceita payload válido', async () => {
    const errors = await validateDto(valid);
    expect(errors).toHaveLength(0);
  });

  it('converte empresaId string para number (@Type)', async () => {
    const dto = plainToInstance(RegisterDto, { ...valid, empresaId: '5' });
    expect(typeof dto.empresaId).toBe('number');
    expect(dto.empresaId).toBe(5);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejeita nome vazio', async () => {
    const errors = await validateDto({ ...valid, nome: '' });
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });

  it('rejeita login vazio', async () => {
    const errors = await validateDto({ ...valid, login: '' });
    expect(errors.some(e => e.property === 'login')).toBe(true);
  });

  it('rejeita senha menor que 4 caracteres', async () => {
    const errors = await validateDto({ ...valid, senha: 'ab' });
    const senha = errors.find(e => e.property === 'senha');
    expect(senha?.constraints?.minLength).toBeDefined();
  });

  it('rejeita empresaId não inteiro', async () => {
    const errors = await validateDto({ ...valid, empresaId: 'abc' });
    expect(errors.some(e => e.property === 'empresaId')).toBe(true);
  });

  it('rejeita quando campos obrigatórios estão ausentes', async () => {
    const errors = await validateDto({});
    const props = errors.map(e => e.property);
    expect(props).toEqual(
      expect.arrayContaining(['nome', 'login', 'senha', 'empresaId']),
    );
  });
});
