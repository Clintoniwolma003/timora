import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { staffRouter } from "./routers/staffRouter";
import { attendanceRouter } from "./routers/attendanceRouter";
import { reportsRouter } from "./routers/reportsRouter";
import { locationsRouter } from "./routers/locationsRouter";
import { dashboardRouter } from "./routers/dashboardRouter";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  // Feature routers
  staff: staffRouter,
  attendance: attendanceRouter,
  reports: reportsRouter,
  locations: locationsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
