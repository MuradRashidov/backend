import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { CommentService } from './comment.service';
import { CommentType } from './comment.type';
import { Request } from 'express';

@UseGuards(GraphqlAuthGuard)
@Resolver()
export class CommentResolver {
    constructor(private readonly commentService:CommentService){}

    @Query(()=>[CommentType])
   async getCommentsByPostId(
        @Args("postId") postId:number
    ){
        return await this.commentService.getCommentsByPostId(postId)
    }

    @Mutation((returns)=>CommentType)
    async createComment(
        @Args("text") text:string,
        @Args("postId") postId:number,
        @Context() context:{req:Request}
    ){
        return await this.commentService.createComment({text,postId,userId:context.req.user.sub})
    }

    @Mutation(() => CommentType)
    async deleteComment(
        @Args("id") id:number,
        @Context() context:{req:Request}

    ){
        return await this.commentService.deleteComment(id,context.req.user.sub);
    }
}
