import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  datetime,
  float
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * TIMORA Multi-Tenant SaaS Schema
 * Every table includes company_id for strict tenant isolation
 */

// ============================================================================
// COMPANIES & SUBSCRIPTIONS
// ============================================================================

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  industry: varchar("industry", { length: 100 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "inactive", "trial", "suspended"]).default("trial").notNull(),
  plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise"]).default("free").notNull(),
  trialEndsAt: timestamp("trialEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise"]).notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "cancelled", "past_due"]).default("active").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  renewalDate: timestamp("renewalDate"),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // stripe, paystack
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  paystackAuthorizationCode: varchar("paystackAuthorizationCode", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// USERS (Extended from template)
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  companyId: int("companyId"), // NULL for super admin
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "company_admin", "staff"]).default("staff").notNull(),
  locationId: int("locationId"), // Assigned location for staff
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// LOCATIONS
// ============================================================================

export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  latitude: float("latitude"),
  longitude: float("longitude"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// DEPARTMENTS
// ============================================================================

export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// ATTENDANCE
// ============================================================================

export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  locationId: int("locationId"),
  clockInTime: timestamp("clockInTime").notNull(),
  clockOutTime: timestamp("clockOutTime"),
  clockInGpsLat: float("clockInGpsLat"),
  clockInGpsLng: float("clockInGpsLng"),
  clockOutGpsLat: float("clockOutGpsLat"),
  clockOutGpsLng: float("clockOutGpsLng"),
  totalHours: decimal("totalHours", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["active", "completed", "incomplete"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// REPORTS
// ============================================================================

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["daily", "weekly", "monthly", "custom"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  status: mysqlEnum("status", ["draft", "submitted", "reviewed", "approved"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  reviewedBy: int("reviewedBy"), // User ID of admin who reviewed
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  reportDate: datetime("reportDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// RELATIONS (for type inference)
// ============================================================================

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  locations: many(locations),
  departments: many(departments),
  attendance: many(attendance),
  reports: many(reports),
  subscriptions: many(subscriptions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [users.locationId],
    references: [locations.id],
  }),
  attendance: many(attendance),
  reports: many(reports),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  company: one(companies, {
    fields: [locations.companyId],
    references: [companies.id],
  }),
  users: many(users),
  attendance: many(attendance),
}));

export const departmentsRelations = relations(departments, ({ one }) => ({
  company: one(companies, {
    fields: [departments.companyId],
    references: [companies.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  company: one(companies, {
    fields: [attendance.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [attendance.locationId],
    references: [locations.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  company: one(companies, {
    fields: [reports.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  company: one(companies, {
    fields: [subscriptions.companyId],
    references: [companies.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
