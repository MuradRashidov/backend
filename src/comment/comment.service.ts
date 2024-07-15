import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateCommentDto } from './create-comment.dto';

@Injectable()
export class CommentService {
    constructor(private prisma:PrismaService){}

    async getCommentsByPostId(postId:number){
       return await this.prisma.comment.findMany({where:{postId},include:{post:true,user:true}});
    }

    async createComment(data:CreateCommentDto) :Promise<Comment>{
        return await this.prisma.comment.create({
            data,
            include:{
                post:true,
                user:true
            }
        })
    }

    async deleteComment(id:number,userId:number){
        const deletedComment = await this.prisma.comment.findUnique({where:{id}});
        if(!deletedComment) throw new NotFoundException();
        if (deletedComment.userId !== userId) throw new UnauthorizedException("Only publisher can delete this post")
        return await this.prisma.comment.delete({where:{id}})
    }
}
