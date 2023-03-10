import { Type } from '@nestjs/common';

import { BaseControllerWithTrash } from '../base';
import { BaseController } from '../base/controller';
import { CRUD_OPTIONS_REGISTER } from '../constants';
import { CrudOptionsRegister } from '../types';

export const Crud =
    (factory: CrudOptionsRegister) =>
    <T extends BaseController<any> | BaseControllerWithTrash<any>>(Target: Type<T>) => {
        Reflect.defineMetadata(CRUD_OPTIONS_REGISTER, factory, Target);
    };
