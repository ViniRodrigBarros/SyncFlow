/**
 * DTOs do backend NestJS para `/registros`. O backend devolve `dataHora` como
 * string ISO 8601 e `tipo` como enum 'COMPRA' | 'VENDA'. IDs são UUID v4.
 *
 * Hoje o app é offline-first e usa o sync engine do WatermelonDB para
 * propagar tudo — esses DTOs ficam reservados para chamadas one-off
 * (ex.: refetch manual ou debug). O registro local é a fonte da verdade.
 */

import type { TipoRegistro } from '../entities/registroEntities';

export const REGISTROS_ROUTES = {
  list: '/registros',
  byId: (id: string) => `/registros/${id}`,
  create: '/registros',
  update: (id: string) => `/registros/${id}`,
  remove: (id: string) => `/registros/${id}`,
} as const;

export interface FotoRegistroDto {
  id: string;
  registroId: string;
  caminho: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistroDto {
  id: string;
  empresaId: number;
  usuarioId: number;
  tipo: TipoRegistro;
  dataHora: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
  fotos?: FotoRegistroDto[];
}

export interface CreateRegistroRequestDto {
  id?: string;
  tipo: TipoRegistro;
  dataHora: string;
  descricao: string;
}

export interface UpdateRegistroRequestDto {
  tipo?: TipoRegistro;
  dataHora?: string;
  descricao?: string;
}
