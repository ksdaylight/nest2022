import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMatch' })
export class MatchConstraint implements ValidatorConstraintInterface {
    validate(value: any, args?: ValidationArguments) {
        const [relatedProperty] = args.constraints;
        const relatedValue = (args.object as any)[relatedProperty];
        return value === relatedValue;
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const [relatedProperty] = validationArguments.constraints;
        return `${relatedProperty} and ${validationArguments.property} don't match`;
    }
}

export function isMatch(relatedProperty: string, validationOption?: ValidationOptions) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOption,
            constraints: [relatedProperty],
            validator: MatchConstraint,
        });
    };
}
