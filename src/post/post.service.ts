import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@prisma/client';
import { createWriteStream } from 'fs';
import { extname } from 'path';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto } from './createPost.dto';
import { PostDetails, PostType } from './post.type';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}
  async saveVideo(video: {
    createReadStream: () => any;
    filename: string;
    mimetype: string;
  }):Promise<string> {
    //console.log(video.filename,video.mimetype,video);
    
    if (!video || !['video/mp4'].includes(video.mimetype)) {
      throw new BadRequestException(
        'Invalid video file format. Only mp4 is allowed.',
      );
    }
    const videoName = `${Date.now()}${extname(video.filename)}`;
    const videoPath = `/files/${videoName}`;
    const stream = video.createReadStream();
    const outputPath = `public${videoPath}`;
    const writeStream = createWriteStream(outputPath);
    stream.pipe(writeStream);
    await new Promise((resolve,reject)=>{
        stream.on('error',reject),
        stream.on('end',resolve)
    })
    return videoPath;
  }
  async createPost(data:CreatePostDto):Promise<Post>{
        return this.prisma.post.create({data})
  }

  async getPostById(id: number): Promise<PostDetails> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id },
        include: { user: true, likes: true, comments: true },
      });
      if(!post) throw new NotFoundException("Post doesn't esist!")
      // get all other post ids of the user with the post above
      const postIds = await this.prisma.post.findMany({
        where: { userId: post.userId },
        select: { id: true },
      });

      return { ...post, otherPostIds: postIds.map((post) => post.id) };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  async getPosts(skip: number, take: number): Promise<PostType[]> {
    const posts =  await this.prisma.post.findMany({
      skip,
      take,
      include: { user: true, likes: true, comments: true },
      orderBy: { createdAt: 'desc' },
    });
    //console.log(posts);
    
    return posts
  }
async getPostsByUserId(userId:number):Promise<PostType[]>{
  return await this.prisma.post.findMany({where:{userId},include:{user:true}})
}
async deletePost(id: number): Promise<void> {
    const post = await this.getPostById(id);
    try {
        const fs = await import("fs");
        fs.unlinkSync(post.video);
        await this.prisma.post.delete({where:{id}})
    } catch (error) {
        throw new NotFoundException(error.message)
    }
}
}
