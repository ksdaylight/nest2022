import { ClassToPlain } from 'typings/global';

import { PostEntity } from './entities';

export type SearchType = 'like' | 'against' | 'elastic';
export type PostSearchBody = Pick<ClassToPlain<PostEntity>, 'title' | 'body' | 'summary'> & {
    categories: string;
};
export interface ContentConfig {
    searchType: SearchType;
}
