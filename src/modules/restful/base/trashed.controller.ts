import { Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { DeleteWithTrashDto, ListWithTrashedQueryDto, RestoreDto } from '../dtos';

export abstract class BaseControllerWithTrash<S> {
    protected service: S;

    private setService(service: S) {
        this.service = service;
    }

    constructor(service: S) {
        this.setService(service);
    }

    async list(@Query() options: ListWithTrashedQueryDto, ...args: any[]) {
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
        { ids, trash }: DeleteWithTrashDto,
        ...args: any[]
    ) {
        return (this.service as any).delete(ids, trash);
    }

    async restore(
        @Body()
        { ids }: RestoreDto,
        ...args: any[]
    ) {
        return (this.service as any).restore(ids);
    }
}
