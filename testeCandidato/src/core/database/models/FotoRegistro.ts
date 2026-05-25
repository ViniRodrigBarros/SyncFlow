import { Model, Relation } from '@nozbe/watermelondb';
import {
  date,
  field,
  immutableRelation,
  readonly,
} from '@nozbe/watermelondb/decorators';

import type Registro from './Registro';

export default class FotoRegistro extends Model {
  static table = 'foto_registros';

  static associations = {
    registros: { type: 'belongs_to', key: 'registro_id' },
  } as const;

  @field('registro_id') declare registroId: string;
  @field('caminho') declare caminho: string;
  @field('is_local_only') declare isLocalOnly: boolean;
  @field('local_uri') declare localUri: string | null;
  @readonly @date('created_at') declare createdAt: Date;
  @readonly @date('updated_at') declare updatedAt: Date;

  @immutableRelation('registros', 'registro_id') declare registro: Relation<Registro>;
}
