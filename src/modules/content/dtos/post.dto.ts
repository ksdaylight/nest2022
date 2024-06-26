import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsDefined,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

import { isNil, toNumber } from 'lodash';

import { DtoValidation } from '@/modules/core/decorators';
import { toBoolean } from '@/modules/core/helpers';
import { IsDataExist } from '@/modules/database/constraints';
import { ListWithTrashedQueryDto } from '@/modules/restful/dtos';

import { UserEntity } from '@/modules/user/entities';

import { PostBodyType, PostOrderType } from '../constants';
import { CategoryEntity, PostEntity } from '../entities';

@DtoValidation({ type: 'query' })
export class QueryPostDto extends ListWithTrashedQueryDto {
    @ApiPropertyOptional({
        description: '搜索关键字:文章全文搜索字符串',
        maxLength: 100,
    })
    @MaxLength(100, {
        always: true,
        message: '搜索字符串长度不得超过$constraint1',
    })
    @IsOptional({ always: true })
    search?: string;

    @ApiPropertyOptional({
        description: '分类ID:过滤一个分类及其子孙分类下的文章',
    })
    @IsDataExist(CategoryEntity, {
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { message: '分类ID格式错误' })
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({
        description: '用户ID:根据文章作者过滤文章',
    })
    @IsDataExist(UserEntity, {
        message: '指定的用户不存在',
    })
    @IsUUID(undefined, { message: '用户ID格式错误' })
    @IsOptional()
    author?: string;

    @ApiPropertyOptional({
        description: '发布状态:根据是否发布过滤文章状态',
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({
        description: '排序规则:可指定文章列表的排序规则,默认为综合排序',
        enum: PostOrderType,
    })
    @IsEnum(PostOrderType, {
        message: `排序规则必须是${Object.values(PostOrderType).join(',')}其中一项`,
    })
    @IsOptional()
    orderBy?: PostOrderType;
}

@DtoValidation({ groups: ['create'] })
export class ManageCreatePostDto {
    @ApiProperty({ description: '文章标题', maxLength: 255 })
    @MaxLength(255, {
        always: true,
        message: '文章标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '文章标题必须填写' })
    @IsOptional({ groups: ['update'] })
    title: string;

    @ApiProperty({ description: '文章内容' })
    @IsNotEmpty({ groups: ['create'], message: '文章内容必须填写' })
    @IsOptional({ groups: ['update'] })
    body: string;

    @ApiPropertyOptional({
        description: '文章内容类型: 默认为markdown',
        enum: PostBodyType,
        default: 'markdown',
    })
    @IsEnum(PostBodyType, {
        message: `内容类型必须是${Object.values(PostBodyType).join(',')}其中一项`,
    })
    @IsOptional()
    type?: PostBodyType;

    @ApiPropertyOptional({ description: '文章描述', maxLength: 500 })
    @MaxLength(500, {
        always: true,
        message: '文章描述长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    summary?: string;

    @ApiPropertyOptional({
        description: '发布时间:通过设置文章的发布时间来发布文章',
        type: Date,
    })
    @IsDateString({ strict: true }, { always: true })
    @IsOptional({ always: true })
    @ValidateIf((value) => !isNil(value.publishedAt))
    @Transform(({ value }) => (value === 'null' ? null : value))
    publishedAt?: Date;

    @ApiPropertyOptional({
        description: '关键字:用于SEO',
        type: [String],
        maxLength: 20,
    })
    @MaxLength(20, {
        each: true,
        always: true,
        message: '每个关键字长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    keywords?: string[];

    @ApiPropertyOptional({
        description: '关联分类ID列表:一篇文章可以关联多个分类',
        type: [String],
    })
    @IsDataExist(CategoryEntity, {
        each: true,
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: '分类ID格式不正确',
    })
    @IsOptional({ always: true })
    categories?: string[];

    @ApiPropertyOptional({
        description:
            '文章作者ID:可用于在管理员发布文章时分配给其它用户,如果不设置,则作者为当前管理员',
        type: String,
    })
    @IsDataExist(UserEntity, {
        always: true,
        message: '用户不存在',
    })
    @IsUUID(undefined, {
        always: true,
        message: '用户ID格式不正确',
    })
    @IsOptional({ always: true })
    author?: string;

    @ApiPropertyOptional({
        description: '自定义排序',
        type: Number,
        minimum: 0,
        default: 0,
    })
    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;
}

@DtoValidation({ groups: ['update'] })
export class ManageUpdatePostDto extends PartialType(ManageCreatePostDto) {
    @ApiProperty({
        description: '待更新的文章ID',
    })
    @IsDataExist(PostEntity, {
        groups: ['update'],
        message: '指定的文章不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
    @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
    id!: string;
}

@DtoValidation({ groups: ['create'] })
export class CreatePostDto extends OmitType(ManageCreatePostDto, ['author', 'customOrder']) {
    @ApiPropertyOptional({
        description: '用户侧排序:文章在用户的文章管理而非后台中,列表的排序规则',
        type: Number,
        minimum: 0,
        default: 0,
    })
    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    userOrder = 0;
}

@DtoValidation({ groups: ['update'] })
export class UpdatePostDto extends OmitType(ManageUpdatePostDto, ['author', 'customOrder']) {
    @ApiPropertyOptional({
        description: '用户侧排序:文章在用户的文章管理而非后台中,列表的排序规则',
        type: Number,
        minimum: 0,
        default: 0,
    })
    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    userOrder = 0;
}
