import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { isSubscriptionActive } from "../db";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// ============================================================================
// MIDDLEWARE: Require User
// ============================================================================

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// ============================================================================
// MIDDLEWARE: Require Company Admin
// ============================================================================

const requireCompanyAdmin = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (ctx.user.role !== 'company_admin' && ctx.user.role !== 'super_admin') {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Only company admins can perform this action" 
    });
  }

  if (!ctx.user.companyId && ctx.user.role !== 'super_admin') {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Company context required" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const companyAdminProcedure = t.procedure.use(requireCompanyAdmin);

// ============================================================================
// MIDDLEWARE: Require Super Admin
// ============================================================================

const requireSuperAdmin = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user || ctx.user.role !== 'super_admin') {
    throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const superAdminProcedure = t.procedure.use(requireSuperAdmin);

// ============================================================================
// MIDDLEWARE: Require Active Subscription (for company features)
// ============================================================================

const requireActiveSubscription = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // Super admins bypass subscription check
  if (ctx.user.role === 'super_admin') {
    return next({ ctx });
  }

  // Company users must have active subscription
  if (!ctx.user.companyId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Company context required" 
    });
  }

  const subscriptionActive = await isSubscriptionActive(ctx.user.companyId);
  if (!subscriptionActive) {
    throw new TRPCError({ 
      code: "PAYMENT_REQUIRED", 
      message: "Your subscription has expired. Please renew to continue." 
    });
  }

  return next({ ctx });
});

export const protectedWithSubscriptionProcedure = t.procedure
  .use(requireUser)
  .use(requireActiveSubscription);

// ============================================================================
// MIDDLEWARE: Legacy Admin Check (for backward compatibility)
// ============================================================================

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'company_admin' && ctx.user.role !== 'super_admin')) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
