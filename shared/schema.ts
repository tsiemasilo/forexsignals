import { pgTable, serial, varchar, text, boolean, timestamp, integer, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in days
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, trial, expired, cancelled
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Forex signals table
export const forexSignals = pgTable("forex_signals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  tradeAction: varchar("trade_action", { length: 10 }).notNull(), // Buy, Sell, Hold
  imageUrl: text("image_url"),
  imageUrls: text("image_urls"), // JSON string of image URLs
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  signals: many(forexSignals),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] }),
}));

export const forexSignalsRelations = relations(forexSignals, ({ one }) => ({
  creator: one(users, { fields: [forexSignals.createdBy], references: [users.id] }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type ForexSignal = typeof forexSignals.$inferSelect;
export type InsertForexSignal = typeof forexSignals.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans, {
  name: z.string().min(1),
  price: z.string().min(1),
  duration: z.number().min(1),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions, {
  userId: z.number().min(1),
  planId: z.number().min(1),
  status: z.enum(["active", "trial", "expired", "cancelled"]),
});

export const insertForexSignalSchema = createInsertSchema(forexSignals, {
  title: z.string().min(1),
  content: z.string().min(1),
  tradeAction: z.enum(["Buy", "Sell", "Hold"]),
  createdBy: z.number().min(1),
});

export type InsertUserType = z.infer<typeof insertUserSchema>;
export type InsertSubscriptionPlanType = z.infer<typeof insertSubscriptionPlanSchema>;
export type InsertSubscriptionType = z.infer<typeof insertSubscriptionSchema>;
export type InsertForexSignalType = z.infer<typeof insertForexSignalSchema>;