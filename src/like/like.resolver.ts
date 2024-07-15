import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { LikeType } from './like.model';
import { Request } from 'express';
import { LikeService } from './like.service';

@UseGuards(GraphqlAuthGuard)
@Resolver()
export class LikeResolver {
    constructor(private readonly likeService:LikeService ){}
    @Mutation(()=>LikeType)
    async likePost(
        @Args("postId") postId:number,
        @Context() context:{req:Request}
    ):Promise<LikeType>{
            return await this.likeService.likePost({postId,userId:context.req.user.sub})  
    }

    @Mutation(()=>LikeType)
    async unLikePost(
        @Args("postId") postId:number,
        @Context() context:{req:Request}
    ):Promise<LikeType>{
        return await this.likeService.unLikePost({postId,userId:context.req.user.sub})  
    }
}

