import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

@UseGuards(JwtAuthGuard)
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresas: EmpresasService) {}

  @Get('me')
  async minhaEmpresa(@CurrentUser() user: AuthUser) {
    return this.empresas.findByIdOrFail(user.empresaId);
  }
  @Get('findAll')
  async findAll() {
    return this.empresas.findAll();
  }

  @Post('create')
  async create(@Body() dto: CreateEmpresaDto) {
    return this.empresas.create(dto);
  }

  @Delete('delet/:id')
  async delet(@Param('id', ParseIntPipe) id: number) {
    return this.empresas.delet(id);
  }
}
