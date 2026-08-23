import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { ROLE, type LeadDto, type Paginated } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadsService } from './leads.service';

/** Маршруты /api/leads */
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  /**
   * Публичная форма сайта.
   *
   * Статус отсутствует в CreateLeadDto и всегда назначается сервисом как NEW.
   */
  @Public()
  @Post()
  create(@Body() dto: CreateLeadDto): Promise<LeadDto> {
    return this.leads.create(dto);
  }

  /** Список заявок с пагинацией, поиском и административными фильтрами */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get()
  findAll(@Query() query: ListLeadsDto): Promise<Paginated<LeadDto>> {
    return this.leads.findAll(query);
  }

  /** Карточка заявки вместе с актуальными данными выбранной услуги */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<LeadDto> {
    return this.leads.findOne(id);
  }

  /** Единственная разрешённая операция изменения — смена статуса */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto): Promise<LeadDto> {
    return this.leads.updateStatus(id, dto);
  }
}
