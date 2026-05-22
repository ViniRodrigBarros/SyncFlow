import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { TipoRegistro } from '@prisma/client';

export class CreateRegistroDto {
  @IsOptional()
  @IsUUID('all', { message: 'id deve ser um UUID' })
  id?: string;

  @IsEnum(TipoRegistro, { message: 'tipo deve ser COMPRA ou VENDA' })
  tipo: TipoRegistro;

  @IsISO8601({}, { message: 'dataHora deve estar em formato ISO 8601' })
  dataHora: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'descricao deve ter no mínimo 10 caracteres' })
  descricao: string;
}
