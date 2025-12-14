// src/lib/db/schema.ts
import { pgTable, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table - CHANGED: id from uuid to text
export const users = pgTable("user", {
  id: text("id").primaryKey(), // ← Changed from uuid
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  name: text("name").notNull(),
  image: text("image"),
  department: text("department"),
  position: text("position"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Better Auth tables - CHANGED: all uuid to text
// Better Auth tables
export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(), // ← Add this
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // ← Add this
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(), // ← Changed
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(), // ← Changed
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Deferrals table - CHANGED: all uuid to text
export const deferrals = pgTable("deferrals", {
  id: text("id").primaryKey(), // ← Changed
  deferralCode: text("deferral_code").notNull().unique(),

  initiatorId: text("initiator_id")
    .notNull()
    .references(() => users.id),
  initiatorName: text("initiator_name").notNull(),
  jobTitle: text("job_title").notNull(),
  department: text("department").notNull(),

  workOrderNumbers: text("work_order_numbers").array(),
  equipmentFullCodes: text("equipment_full_codes").array(),
  equipmentDescription: text("equipment_description").notNull(),
  equipmentSafetyCriticality: text("equipment_safety_criticality"),
  taskCriticality: text("task_criticality"),

  deferralRequestDate: timestamp("deferral_request_date").notNull(),
  currentLAFD: timestamp("current_lafd"),
  deferredToNewLAFD: timestamp("deferred_to_new_lafd").notNull(),

  description: text("description").notNull(),
  justification: text("justification").notNull(),
  consequence: text("consequence").notNull(),

  riskAssessment: jsonb("risk_assessment"),
  mitigations: jsonb("mitigations"),

  status: text("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewComments: text("review_comments"),

  requiredSignatures: text("required_signatures").array(),
  signatures: jsonb("signatures"),
  comments: jsonb("comments"),

  implementedBy: text("implemented_by"),
  implementedDate: timestamp("implemented_date"),
  approvedBy: text("approved_by"),
  approvalDate: timestamp("approval_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Attachments table - CHANGED: all uuid to text
export const attachments = pgTable("attachments", {
  id: text("id").primaryKey(), // ← Changed
  deferralId: text("deferral_id")
    .notNull()
    .references(() => deferrals.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: text("file_size"),
  filePath: text("file_path").notNull(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Notifications table - CHANGED: all uuid to text
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(), // ← Changed
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  deferralId: text("deferral_id").references(() => deferrals.id),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit log table - CHANGED: all uuid to text
export const auditLogs = pgTable("audit_log", {
  id: text("id").primaryKey(), // ← Changed
  deferralId: text("deferral_id").references(() => deferrals.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Relations (unchanged)
export const usersRelations = relations(users, ({ many }) => ({
  deferralsInitiated: many(deferrals),
  attachments: many(attachments),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}));

export const deferralsRelations = relations(deferrals, ({ one, many }) => ({
  initiator: one(users, {
    fields: [deferrals.initiatorId],
    references: [users.id],
  }),
  attachments: many(attachments),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}));





export const attachmentsRelations = relations(attachments, ({ one }) => ({
  deferral: one(deferrals, {
    fields: [attachments.deferralId],
    references: [deferrals.id],
  }),
  user: one(users, {
    fields: [attachments.uploadedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  deferral: one(deferrals, {
    fields: [notifications.deferralId],
    references: [deferrals.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  deferral: one(deferrals, {
    fields: [auditLogs.deferralId],
    references: [deferrals.id],
  }),
}));
