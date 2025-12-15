import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  getAllUsers,
  deleteUser,
  updateUser,
  queryClass,
  createObject,
  updateObject,
  deleteObject,
} from "./_core/parseService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  parse: router({
    login: publicProcedure
      .input(
        z.object({
          username: z.string(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await loginUser(input.username, input.password);
      }),

    register: publicProcedure
      .input(
        z.object({
          username: z.string(),
          password: z.string(),
          email: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        return await registerUser(input.username, input.password, input.email);
      }),

    getCurrentUser: publicProcedure.query(async () => {
      return await getCurrentUser();
    }),

    logout: publicProcedure.mutation(async () => {
      await logoutUser();
      return { success: true };
    }),

    getAllUsers: publicProcedure.query(async () => {
      return await getAllUsers();
    }),

    deleteUser: publicProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input }) => {
        await deleteUser(input.userId);
        return { success: true };
      }),

    updateUser: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input }) => {
        return await updateUser(input.userId, input.data);
      }),

    queryClass: publicProcedure
      .input(
        z.object({
          className: z.string(),
          limit: z.number().default(100),
          skip: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await queryClass(input.className, input.limit, input.skip);
      }),

    createObject: publicProcedure
      .input(
        z.object({
          className: z.string(),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input }) => {
        return await createObject(input.className, input.data);
      }),

    updateObject: publicProcedure
      .input(
        z.object({
          className: z.string(),
          objectId: z.string(),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input }) => {
        return await updateObject(input.className, input.objectId, input.data);
      }),

    deleteObject: publicProcedure
      .input(
        z.object({
          className: z.string(),
          objectId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await deleteObject(input.className, input.objectId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
