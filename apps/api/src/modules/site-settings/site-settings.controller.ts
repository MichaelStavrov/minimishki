import { Body, Controller, Get, Patch } from '@nestjs/common';

import { ROLE, type SiteSettingsDto } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { SiteSettingsService } from './site-settings.service';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettings: SiteSettingsService) {}

  @Public()
  @Get()
  get(): Promise<SiteSettingsDto> {
    return this.siteSettings.get();
  }

  @Roles(ROLE.MANAGER)
  @Patch()
  update(@Body() dto: UpdateSiteSettingsDto): Promise<SiteSettingsDto> {
    return this.siteSettings.update(dto);
  }
}
