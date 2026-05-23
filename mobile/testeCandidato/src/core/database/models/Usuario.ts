import { Model, Relation } from '@nozbe/watermelondb';
import {
  children,
  date,
  field,
  immutableRelation,
  readonly,
} from '@nozbe/watermelondb/decorators';

import type Empresa from './Empresa';
import type Registro from './Registro';

export default class Usuario extends Model {
  static table = 'usuarios';

  static associations = {
    empresas: { type: 'belongs_to', key: 'empresa_id' },
    registros: { type: 'has_many', foreignKey: 'usuario_id' },
  } as const;

  @field('nome') declare nome: string;
  @field('login') declare login: string;
  @field('empresa_id') declare empresaId: string;
  @readonly @date('created_at') declare createdAt: Date;
  @readonly @date('updated_at') declare updatedAt: Date;

  @immutableRelation('empresas', 'empresa_id') declare empresa: Relation<Empresa>;
  @children('registros') declare registros: Registro[];
}
