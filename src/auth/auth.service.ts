import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService:JwtService,
        private readonly prisma:PrismaService,
        private readonly configService:ConfigService
    ){}

     refreshToken = async (req:Request,res:Response):Promise<String> => {
        const refreshToken = req.cookies["refresh_token"];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found')
        }
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken,{
                secret:this.configService.get<string>("REFRESH_TOKEN_SECRET")
            })
        } catch (error) {
            throw new UnauthorizedException("Inwalid or expired token")
        }

        const userExist = await this.prisma.user.findUnique({where:{id:payload.sub}});
        if (!userExist) {
            throw new BadRequestException("User no longer exists")
        }
        const expiresIn = 150;
        const expiration = Math.floor(Date.now()/1000) + expiresIn;

        const accessToken = this.jwtService.sign(
            {...payload,exp:expiration},
            {secret:this.configService.get<string>("ACCESS_TOKEN_SECRET")}
        )
            res.cookie("access_token",accessToken,{httpOnly:true});
            return accessToken
    }
    private async issueTokens(user:User,res:Response){
        const payload = {username:user.fullname,sub:user.id}
        const access_token = this.jwtService.sign(
            {...payload},
            {
                secret:this.configService.get<string>("ACCESS_TOKEN_SECRET"),
                expiresIn:"15s"
            });
        const refreshToken = this.jwtService.sign(payload,{
            secret:this.configService.get<string>("REFRESH_TOKEN_SECRET"),
            expiresIn:"7d"
        })

        res.cookie("access_token",access_token,{httpOnly:true});
        res.cookie("refresh_token",refreshToken,{httpOnly:true});
        return {user};
    }

    async validateUser(loginDto:LoginDto){
        const user = await this.prisma.user.findUnique({where:{email:loginDto.email}});
        if (user && await bcrypt.compare(loginDto.password,user.password)) {
            return user;
        }
        return null;
    }

    async register(registerDto:RegisterDto,res:Response){
        console.log(11111);
        
        const existingUser = await this.prisma.user.findUnique({where:{email:registerDto.email}});
        if (existingUser) {
            throw new BadRequestException({email:"Email already in use"});
        }
       console.log("exu",registerDto);
       
        const hashedPassword = await bcrypt.hash(registerDto.password,10);
        try {
            const user = await this.prisma.user.create({
                data:{
                    email:registerDto.email,
                    password:hashedPassword,
                    fullname:registerDto.fullname 
                }
            }); 
            console.log(user);
            return this.issueTokens(user,res)
        } catch (error) {
            console.log(error);
            
        }
       
    }
    
    async login(loginDto:LoginDto,res:Response){
        const user = await this.validateUser(loginDto);
        if (!user) {
            throw new BadRequestException({invalidCredentials:"Check your credentials again"});
        }

        return this.issueTokens(user,res);
    }
    async logout(res:Response) {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return "User logout successfully";
    }
    
}
