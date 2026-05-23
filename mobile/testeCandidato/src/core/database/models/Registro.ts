import { Model, Relation } from '@nozbe/watermelondb';
import {
  children,
  date,
  field,
  immutableRelation,
  readonly,
} from '@nozbe/watermelondb/decorators';

import type Empresa from './Empresa';
import type FotoRegistro from './FotoRegistro';
import type Usuario from './Usuario';

export type TipoRegistro = 'COMPRA' | 'VENDA';

export default class Registro extends Model {
  static table = 'registros';

  static associations = {
    empresas: { type: 'belongs_to', key: 'empresa_id' },
    usuarios: { type: 'belongs_to', key: 'usuario_id' },
    foto_registros: { type: 'has_many', foreignKey: 'registro_id' },
  } as const;

  @field('empresa_id') declare empresaId: string;
  @field('usuario_id') declare usuarioId: string;
  @field('tipo') declare tipo: TipoRegistro;
  @date('data_hora') declare dataHora: Date;
  @field('descricao') declare descricao: string;
  @readonly @date('created_at') declare createdAt: Date;
  @readonly @date('updated_at') declare updatedAt: Date;

  @immutableRelation('empresas', 'empresa_id') declare empresa: Relation<Empresa>;
  @immutableRelation('usuarios', 'usuario_id') declare usuario: Relation<Usuario>;
  @children('foto_registros') declare fotos: FotoRegistro[];
}
