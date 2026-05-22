import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegistrosService } from './registros.service';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { UpdateRegistroDto } from './dto/update-registro.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('registros')
export class RegistrosController {
  constructor(private readonly registros: RegistrosService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.registros.listByEmpresa(user.empresaId);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.registros.findById(id, user);
  }

  @Post()
  create(@Body() dto: CreateRegistroDto, @CurrentUser() user: AuthUser) {
    return this.registros.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRegistroDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.registros.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.registros.remove(id, user);
  }
}
