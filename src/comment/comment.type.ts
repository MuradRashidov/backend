import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PostType } from "src/post/post.type";
import { User } from "src/user/user.model";

@ObjectType()
export class CommentType {
   @Field((type) => Int)
   id:number;

   @Field((type)=>User)
   user:User;

   @Field((type)=>PostType)
   post:PostType;

   @Field()
   text:string;

   @Field()
   createAt:Date;

   @Field()
   updateAt:Date;
}