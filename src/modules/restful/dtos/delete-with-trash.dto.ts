import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';

import { toBoolean } from '@/modules/core/helpers/utils';

import { DeleteDto } from './delete.dto';

@DtoValidation()
export class DeleteWithTrashDto extends DeleteDto {
    @ApiPropertyOptional({
        description: '是否删除到回收站',
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    trash?: boolean;
}
