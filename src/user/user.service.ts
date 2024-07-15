import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma:PrismaService){}
    getUsers(){
        return this.prisma.user.findMany({include:{posts:true}})
    }
    async updateUser(id:number,fullname?:string,bio?:string,imageUrl?:string){
        console.log(imageUrl)
        return await this.prisma.user.update({where:{id},data:{fullname,bio,image:imageUrl}})
    }
}
