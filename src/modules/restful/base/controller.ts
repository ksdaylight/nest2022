import { Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { DeleteDto } from '../dtos/delete.dto';

import { ListQueryDto } from '../dtos/query.dto';

export abstract class BaseController<S> {
    protected service: S;

    private setService(service: S) {
        this.service = service;
    }

    constructor(service: S) {
        this.setService(service);
    }

    async list(@Query() options: ListQueryDto, ...args: any[]) {
        return (this.service as any).paginate(options);
    }

    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
        ...args: any[]
    ) {
        return (this.service as any).detail(id);
    }

    async store(
        @Body()
        data: any,
        ...args: any[]
    ) {
        return (this.service as any).create(data);
    }

    async update(
        @Body()
        data: any,
        ...args: any[]
    ) {
        return (this.service as any).update(data);
    }

    async delete(
        @Body()
        { ids }: DeleteDto,
        ...args: any[]
    ) {
        return (this.service as any).delete(ids);
    }
}
