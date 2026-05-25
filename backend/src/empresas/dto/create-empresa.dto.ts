import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty({ message: 'nome é obrigatório' })
  @MinLength(2, { message: 'nome deve ter no mínimo 2 caracteres' })
  @MaxLength(255, { message: 'nome deve ter no máximo 255 caracteres' })
  nome: string;
}
