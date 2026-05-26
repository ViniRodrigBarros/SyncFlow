import { Model } from '@nozbe/watermelondb';
import { children, field, readonly, date } from '@nozbe/watermelondb/decorators';

import type Registro from './Registro';
import type Usuario from './Usuario';

export default class Empresa extends Model {
  static table = 'empresas';

  static associations = {
    usuarios: { type: 'has_many', foreignKey: 'empresa_id' },
    registros: { type: 'has_many', foreignKey: 'empresa_id' },
  } as const;

  @field('nome') declare nome: string;
  @readonly @date('created_at') declare createdAt: Date;
  @readonly @date('updated_at') declare updatedAt: Date;

  @children('usuarios') declare usuarios: Usuario[];
  @children('registros') declare registros: Registro[];
}
