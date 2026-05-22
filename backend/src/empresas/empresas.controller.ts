import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { EmpresasService } from './empresas.service';

@UseGuards(JwtAuthGuard)
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresas: EmpresasService) {}

  @Get('me')
  async minhaEmpresa(@CurrentUser() user: AuthUser) {
    return this.empresas.findByIdOrFail(user.empresaId);
  }
}
