import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

@InputType()
export class CreatePostDto{
    @Field(()=>Int)
    @IsInt()
    @IsNotEmpty()
    userId:number

    @Field()
    @IsString()
    @IsNotEmpty()
    text:string

    @Field({nullable:true})
    @IsString()
    video:string
}