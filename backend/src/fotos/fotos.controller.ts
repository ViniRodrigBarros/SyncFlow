import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FotosService } from './fotos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

@UseGuards(JwtAuthGuard)
@Controller('fotos')
export class FotosController {
  constructor(private readonly fotos: FotosService) {}

  @Get('registro/:registroId')
  list(
    @Param('registroId') registroId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.fotos.listByRegistro(registroId, user);
  }

  @Post('registro/:registroId')
  @UseInterceptors(
    FilesInterceptor('fotos', 20, {
      storage: diskStorage({
        destination: (_req, _file, cb) =>
          cb(null, join(process.cwd(), uploadDir.replace(/^\.\//, ''))),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${uuidv4()}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\//.test(file.mimetype)) {
          return cb(
            new BadRequestException('Apenas imagens são aceitas'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @Param('registroId') registroId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { ids?: string | string[] },
    @CurrentUser() user: AuthUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    let ids: string[] = [];
    if (Array.isArray(body.ids)) ids = body.ids;
    else if (typeof body.ids === 'string') {
      try {
        const parsed = JSON.parse(body.ids);
        ids = Array.isArray(parsed) ? parsed : [body.ids];
      } catch {
        ids = [body.ids];
      }
    }

    const result = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caminho = `/uploads/${file.filename}`;
      const foto = await this.fotos.addFoto(
        registroId,
        caminho,
        user,
        ids[i],
      );
      result.push(foto);
    }
    return result;
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.fotos.remove(id, user);
  }
}
