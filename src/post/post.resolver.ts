import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { PostService } from './post.service';

import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { PostDetails, PostType } from './post.type';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { GraphQLErrorFilter } from 'src/filters/custom-exceptions';

@UseFilters(GraphQLErrorFilter)
@UseGuards(GraphqlAuthGuard)
@Resolver()
export class PostResolver {
    constructor(private readonly postService:PostService){}
    @Mutation((returns) => PostType)
    async createPost(
    @Context() context: { req: Request },
    @Args({ name: 'video', type: () => GraphQLUpload }) video: any,
    @Args('text') text: string,
  ) {
    console.log("Resolver:");

    const userId = context.req.user.sub;
    console.log(userId);
    
    const videoPath = await this.postService.saveVideo(video);
    type NewPostCreateInput = Pick<Prisma.PostCreateInput, "text" | "video"> & { userId: number };
    console.log(videoPath);
    
    const postData: NewPostCreateInput = {
        text,
        video:videoPath,
        userId
    }
    return await this.postService.createPost(postData)
  }
  @Query((returns) => PostDetails)
  async getPostById(@Args('id') id: number) {
    return await this.postService.getPostById(id);
  }

  @Query((returns)=>[PostType])
  async getPosts(
    @Args('skip',{type:()=>Int,defaultValue:0}) skip: number,
    @Args('take',{type:()=>Int,defaultValue:0}) take: number
  ):Promise<PostType[]>{
        console.log('skip: ',skip);
        console.log('take: ',take);
        return await this.postService.getPosts(skip,take);
  }
  @Mutation((returns)=>PostType)
  async deletPost(@Args("id") id:number){
        return await this.postService.deletePost(id)
  }

  @Query((returns) => [PostType])
  async getPostsByUserId(@Args('userId') userId: number) {
    return await this.postService.getPostsByUserId(userId);
  }
}
