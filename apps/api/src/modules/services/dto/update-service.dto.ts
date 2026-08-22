import { PartialType } from '@nestjs/mapped-types';

import { CreateServiceDto } from './create-service.dto';

/**
 * Тело PATCH /api/services/:id.
 *
 * Все поля CreateServiceDto становятся необязательными, но сохраняют исходные
 * правила валидации. Контроллер должен импортировать этот класс обычным import,
 * чтобы ValidationPipe получил его runtime-метаданные.
 */
export class UpdateServiceDto extends PartialType(CreateServiceDto, {
  skipNullProperties: false,
}) {}
