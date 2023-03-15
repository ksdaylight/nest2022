import { Injectable } from '@nestjs/common';
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource, ObjectType, Repository } from 'typeorm';

type Condition = {
    entity: ObjectType<any>;
    map?: string;
};
@ValidatorConstraint({ name: 'dataExist', async: true })
@Injectable()
export class DataExistConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(value: any, args?: ValidationArguments) {
        let repo: Repository<any>;
        if (!value) return true;

        let map = 'id';
        if ('entity' in args.constraints[0]) {
            map = args.constraints[0].map ?? 'id';
            repo = this.dataSource.getRepository(args.constraints[0].entity);
        } else {
            repo = this.dataSource.getRepository(args.constraints[0]);
        }
        const item = await repo.findOne({ where: { [map]: value } });
        return !!item;
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        if (!validationArguments.constraints[0]) {
            return 'Model not been specified!';
        }
        return `All instance of ${validationArguments.constraints[0].name} must been exists in databse!`;
    }
}

function IsDataExist(
    entity: ObjectType<any>,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

function IsDataExist(
    condition: Condition,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;
function IsDataExist(
    condition: ObjectType<any> | Condition,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [condition],
            validator: DataExistConstraint,
        });
    };
}
export { IsDataExist };
