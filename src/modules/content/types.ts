import { PostBodyType } from './constants';
import { PostEntity } from './entities';

export type SearchType = 'like' | 'against' | 'elastic';
export type PostSearchBody = Pick<ClassToPlain<PostEntity>, 'title' | 'body' | 'summary'> & {
    categories: string;
};
export interface ContentConfig {
    searchType: SearchType;
    postType: PostTypeOption;
}

export type PostTypeOption = `${PostBodyType}` | 'all';
