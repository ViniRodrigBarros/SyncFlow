import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TipoRegistro } from '@prisma/client';

export class UpdateRegistroDto {
  @IsOptional()
  @IsEnum(TipoRegistro)
  tipo?: TipoRegistro;

  @IsOptional()
  @IsISO8601()
  dataHora?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'descricao deve ter no mínimo 10 caracteres' })
  descricao?: string;
}
