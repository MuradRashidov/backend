// user.resolver.ts
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { RegisterDto, LoginDto } from '../auth/dto';
import { Response, Request } from 'express';
import { LoginResponse, RegisterResponse } from 'src/auth/types';
import { UserService } from './user.service';
import { GraphQLErrorFilter } from 'src/filters/custom-exceptions';
import { User } from './user.model';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import * as GraphQLUpload  from 'graphql-upload/GraphQLUpload.js';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { createWriteStream } from 'fs';

@UseFilters(GraphQLErrorFilter)
@Resolver('User')
export class UserResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({
        confirmPassword: 'Password and confirm password are not the same.',
      });
    }
    
      const { user } = await this.authService.register(
        registerDto,
        context.res,
      );
      console.log('user!', user);
      return { user };
    
  }

  @Mutation(() => LoginResponse) // Adjust this return type as needed
  async login(
    @Args('loginInput') loginDto: LoginDto,
    @Context() context: { res: Response },
  ) {
    return this.authService.login(loginDto, context.res);
  }

  @Mutation(() => String)
  async logout(@Context() context: { res: Response }) {
    return this.authService.logout(context.res);
  }

  @Query(() => String)
  getProtectedData() {
    return 'This is protected data';
  }

  @Mutation(() => String)
  async refreshToken(@Context() context: { req: Request; res: Response }) {
    try {
      return this.authService.refreshToken(context.req, context.res);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
 
@Query(()=>[User])
getUsers(){
 return this.userService.getUsers()
}

@UseGuards(GraphqlAuthGuard)
@Mutation(() => User)
async updateUser(
  @Context() context:{req:Request},
  @Args('image',{type:() => GraphQLUpload,nullable:true}) image?:GraphQLUpload,
  @Args('bio',{type:() => String,nullable:true}) bio?:string,
  @Args('fullname',{type:() => String,nullable:true}) fullname?:string,
) :Promise<User>{
  const userId = context.req.user.sub;
  let imageUrl;
  if(image) imageUrl =  await this.storeImageAndGetUrl(image)
  console.log(image);
  
  return await this.userService.updateUser(userId,fullname,bio,imageUrl as string)
}

private async storeImageAndGetUrl(file:GraphQLUpload):Promise<String>{
   const {createReadStream,filename} = await file;
   const uniqueFileName = `${uuidv4()}_${filename}`;
   const imagePath = join(process.cwd(),'public',uniqueFileName);
   const imgUrl = `${process.env.APP_URL}/public/${uniqueFileName}`;
   const readStream = createReadStream();
   readStream.pipe(createWriteStream(imagePath));
   return imgUrl;
}
}