import { appSchema, tableSchema } from '@nozbe/watermelondb';


export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'empresas',
      columns: [
        { name: 'nome', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'usuarios',
      columns: [
        { name: 'nome', type: 'string' },
        { name: 'login', type: 'string' },
        { name: 'empresa_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'registros',
      columns: [
        { name: 'empresa_id', type: 'string', isIndexed: true },
        { name: 'usuario_id', type: 'string', isIndexed: true },
        { name: 'tipo', type: 'string' },
        { name: 'data_hora', type: 'number' },
        { name: 'descricao', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'foto_registros',
      columns: [
        { name: 'registro_id', type: 'string', isIndexed: true },
        { name: 'caminho', type: 'string' },
        // Suporte offline-first para fotos: arquivo ainda não enviado ao servidor
        { name: 'is_local_only', type: 'boolean' },
        { name: 'local_uri', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
