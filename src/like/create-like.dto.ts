import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateLikeDto {
    @Field(() => Int)
    userId:number;

    @Field(() => Int)
    postId:number;
}