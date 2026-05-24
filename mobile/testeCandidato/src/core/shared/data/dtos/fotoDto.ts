/**
 * DTOs do backend NestJS para `/fotos`.
 *
 * Upload: `POST /fotos/registro/:registroId` aceita `multipart/form-data` com
 * campo `fotos` (várias) e `ids` opcional (array de UUIDs alocados pelo
 * cliente para que o servidor reuse o mesmo id da foto criada offline).
 */

export const FOTOS_ROUTES = {
  upload: (registroId: string) => `/fotos/registro/${registroId}`,
  remove: (id: string) => `/fotos/${id}`,
} as const;

export interface FotoUploadResponseDto {
  id: string;
  registroId: string;
  caminho: string;
  createdAt: string;
  updatedAt: string;
}
