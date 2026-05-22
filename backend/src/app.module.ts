import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmpresasModule } from './empresas/empresas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RegistrosModule } from './registros/registros.module';
import { SyncModule } from './sync/sync.module';
import { FotosModule } from './fotos/fotos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    EmpresasModule,
    UsuariosModule,
    RegistrosModule,
    SyncModule,
    FotosModule,
  ],
})
export class AppModule {}
