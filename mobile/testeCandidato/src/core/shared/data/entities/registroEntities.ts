/**
 * Domain entities para a feature de Registros.
 * As ViewModels e telas trabalham com estes tipos limpos — DTOs
 * de servidor ficam isolados em `dtos/registroDto.ts`.
 */

export type TipoRegistro = 'COMPRA' | 'VENDA';

export interface FotoEntity {
  id: string;
  registroId: string;
  caminho: string;
  localUri: string | null;
  isLocalOnly: boolean;
  createdAt: number;
}

export interface RegistroEntity {
  id: string;
  empresaId: string;
  usuarioId: string;
  tipo: TipoRegistro;
  dataHora: number;
  descricao: string;
  isPending: boolean;
  hasError: boolean;
  createdAt: number;
  updatedAt: number;
  fotos: FotoEntity[];
}

export interface CreateRegistroInput {
  tipo: TipoRegistro;
  dataHora: number;
  descricao: string;
  fotos: NewFotoInput[];
}

export interface UpdateRegistroInput {
  id: string;
  tipo?: TipoRegistro;
  dataHora?: number;
  descricao?: string;
  fotosToAdd?: NewFotoInput[];
  fotosToRemove?: string[];
}

export interface NewFotoInput {
  /** URI local do arquivo selecionado (file:// ou content://). */
  localUri: string;
  /** Opcional: tipo MIME se conhecido (ex.: image/jpeg). */
  mimeType?: string;
  /** Opcional: nome do arquivo (ex.: foto.jpg). */
  fileName?: string;
}
