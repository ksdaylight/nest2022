import { Type } from '@nestjs/common';

import { BaseControllerWithTrash } from '../base';
import { BaseController } from '../base/controller';
import { CRUD_OPTIONS } from '../constants';
import { CrudOptions } from '../types';

export const Crud =
    (options: CrudOptions) =>
    <T extends BaseController<any> | BaseControllerWithTrash<any>>(Target: Type<T>) => {
        Reflect.defineMetadata(CRUD_OPTIONS, options, Target);
    };
