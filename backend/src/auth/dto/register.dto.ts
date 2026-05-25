import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'nome é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'login é obrigatório' })
  login: string;

  @IsString()
  @IsNotEmpty({ message: 'senha é obrigatória' })
  @MinLength(4, { message: 'senha deve ter no mínimo 4 caracteres' })
  senha: string;

  @Type(() => Number)
  @IsInt({ message: 'empresaId deve ser um número inteiro' })
  empresaId: number;
}