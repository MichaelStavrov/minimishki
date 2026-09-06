import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ROLE, type PartyCategoryDto } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreatePartyCategoryDto } from './dto/create-party-category.dto';
import { UpdatePartyCategoryDto } from './dto/update-party-category.dto';
import { CreatePartyItemDto } from './dto/create-party-item.dto';
import { UpdatePartyItemDto } from './dto/update-party-item.dto';
import { PartyCatalogService } from './party-catalog.service';

@Controller('party-categories')
export class PartyCatalogController {
  constructor(private readonly partyCatalog: PartyCatalogService) {}

  @Public()
  @Get()
  findPublic(): Promise<PartyCategoryDto[]> {
    return this.partyCatalog.findPublic();
  }

  @Roles(ROLE.ADMIN)
  @Post()
  create(@Body() dto: CreatePartyCategoryDto): Promise<PartyCategoryDto> {
    return this.partyCatalog.create(dto);
  }

  @Roles(ROLE.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePartyCategoryDto): Promise<PartyCategoryDto> {
    return this.partyCatalog.update(id, dto);
  }

  @Roles(ROLE.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.partyCatalog.remove(id);
  }

  @Roles(ROLE.ADMIN) @Post(':categoryId/items') createItem(
    @Param('categoryId') categoryId: string,
    @Body() dto: CreatePartyItemDto,
  ) {
    return this.partyCatalog.createItem(categoryId, dto);
  }
  @Roles(ROLE.ADMIN) @Patch('items/:id') updateItem(
    @Param('id') id: string,
    @Body() dto: UpdatePartyItemDto,
  ) {
    return this.partyCatalog.updateItem(id, dto);
  }
  @Roles(ROLE.ADMIN) @Delete('items/:id') @HttpCode(HttpStatus.NO_CONTENT) removeItem(
    @Param('id') id: string,
  ) {
    return this.partyCatalog.removeItem(id);
  }
}
