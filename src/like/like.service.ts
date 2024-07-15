import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateLikeDto } from './create-like.dto';
import { LikeType } from './like.model';

@Injectable()
export class LikeService {
    constructor(private readonly prisma:PrismaService){}

    async likePost(data:CreateLikeDto):Promise<LikeType>{
        console.log(data);
        
        return await this.prisma.like.create({data})
    }

    async unLikePost(data:CreateLikeDto):Promise<LikeType>{
        const {userId,postId} = data;
         return await this.prisma.like.delete({where:{userId_postId:{userId,postId}}})
    }
}
