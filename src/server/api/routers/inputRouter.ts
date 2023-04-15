//Create me TRPC end point for taking in user input as a string and save it to the database and return messgae to the user.

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";


export const postRouter = createTRPCRouter({
    getUsersLatestInput: protectedProcedure.input(z.object({ userId: z.string() }))
        .query(async ({ input, ctx }) => {
            const { userId } = input;
            console.log('userId', userId)
            try {
                const latestMessage = await ctx.prisma.userPost.findFirst({
                    where: {
                        userId: userId,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                });
                console.log('latestMessage', latestMessage);
                return {
                    responseMessage: "Users latest input fetched",
                    latestMessage: latestMessage
                };
            } catch (error) {
                console.log(error);
            }

        }),

    getAllUsersPosts: protectedProcedure
    .query(async ({ ctx }) => {
        try {
          const UsersAllMessages = await ctx.prisma.userPost.findMany({
            orderBy: { votes: { _count: 'desc' } }, // Order by votes count
            include: {
              _count: {
                select: { votes: true },
              },
            },
          });
          return {
            responseMessage: "All user inputs fetched",
            usersAllMessage: UsersAllMessages
          };
        } catch (error) {
          console.log(error);
        }
      }),
    createUserInput: protectedProcedure
        .input(z.object({ content: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { content } = input;
            const userId = '5678'

            console.log('userId', userId, input)

            try {
                const userInput = await ctx.prisma.userPost.create({
                    data: {
                        content: content,
                        userId: userId,
                    },
                });
                return {
                    message: "User input created",
                    userInput
                };
            }
            catch (error) {
                console.log(error);
            }
        }),
    //Create and endpoint to vote for a user input and return the updated vote count

    voteForUserPost: protectedProcedure
        .input(z.object({ userInputId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { userInputId } = input;
            const userId = ctx.session.user.id;
            console.log('userId', userId)

            try {
                const userInput = await ctx.prisma.userPost.update({
                    where: {
                        id: userInputId,
                    },
                    data: {
                        votes: {
                            create: {
                                userId: userId,
                            },
                        },
                    },
                });
                console.log('userInput', userInput);
                return {
                    message: "User input voted for",
                    userInput
                };
            }
            catch (error) {
                console.log(error);
            }
        }),

});