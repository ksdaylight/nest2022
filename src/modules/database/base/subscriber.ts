import { isNil } from 'lodash';
import {
    EntitySubscriberInterface,
    ObjectLiteral,
    ObjectType,
    UpdateEvent,
    InsertEvent,
    SoftRemoveEvent,
    RemoveEvent,
    RecoverEvent,
    TransactionStartEvent,
    TransactionCommitEvent,
    TransactionRollbackEvent,
    DataSource,
    EntityTarget,
} from 'typeorm';

import { getCustomRepository } from '../helper';
import { RepositoryType } from '../types';

type SubscriberEvent<E extends ObjectLiteral> =
    | InsertEvent<E>
    | UpdateEvent<E>
    | SoftRemoveEvent<E>
    | RemoveEvent<E>
    | RecoverEvent<E>
    | TransactionStartEvent
    | TransactionCommitEvent
    | TransactionRollbackEvent;

export abstract class BaseSubscriber<E extends ObjectLiteral>
    implements EntitySubscriberInterface<E>
{
    protected abstract entity: ObjectType<E>;

    constructor(protected dataSource: DataSource) {
        this.dataSource.subscribers.push(this);
    }

    listenTo() {
        return this.entity;
    }

    async afterLoad(entity: any) {
        if ('parent' in entity && isNil(entity.depth)) entity.depth = 0;
    }

    protected getDataSource(event: SubscriberEvent<E>) {
        return event.connection;
    }

    protected getManage(event: SubscriberEvent<E>) {
        return event.manager;
    }

    protected getRepository<
        C extends ClassType<T>,
        T extends RepositoryType<E>,
        A extends EntityTarget<ObjectLiteral>,
    >(event: SubscriberEvent<E>, repository?: C, entity?: A) {
        return isNil(repository)
            ? this.getDataSource(event).getRepository(entity ?? this.entity)
            : getCustomRepository<T, E>(this.getDataSource(event), repository);
    }

    protected isUpdated(column: keyof E, event: UpdateEvent<E>) {
        return !!event.updatedColumns.find((item) => item.propertyName === column);
    }
}
