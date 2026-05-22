import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'login é obrigatório' })
  login: string;

  @IsString()
  @IsNotEmpty({ message: 'senha é obrigatória' })
  @MinLength(4, { message: 'senha deve ter no mínimo 4 caracteres' })
  senha: string;
}
