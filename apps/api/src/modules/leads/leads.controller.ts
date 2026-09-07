import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { ROLE, type AdminLeadDto, type LeadDto, type Paginated } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import type { JwtPayload } from '../../auth/auth.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadManagerCommentDto } from './dto/update-lead-manager-comment.dto';
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
  findAll(@Query() query: ListLeadsDto): Promise<Paginated<AdminLeadDto>> {
    return this.leads.findAll(query);
  }

  /** Неизменяемая история смены статуса; видна только сотрудникам центра. */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get(':id/status-history')
  findStatusHistory(@Param('id') id: string) {
    return this.leads.findStatusHistory(id);
  }

  /** Карточка заявки вместе с актуальными данными выбранной услуги */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdminLeadDto> {
    return this.leads.findOne(id);
  }

  /** Смена статуса всегда записывает в аудит прежний статус, новый статус и сотрудника. */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @CurrentUser() manager: JwtPayload,
  ): Promise<AdminLeadDto> {
    return this.leads.updateStatus(id, dto, manager);
  }

  /** Внутренняя заметка существует отдельно от истории смены статусов. */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Patch(':id/manager-comment')
  updateManagerComment(
    @Param('id') id: string,
    @Body() dto: UpdateLeadManagerCommentDto,
  ): Promise<AdminLeadDto> {
    return this.leads.updateManagerComment(id, dto);
  }
}
