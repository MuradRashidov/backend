import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateCommentDto {
    @Field()
    text:string;

    @Field(()=>Int)
    userId:number;

    @Field(()=>Int)
    postId:number
}