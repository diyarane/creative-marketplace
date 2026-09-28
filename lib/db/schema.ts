import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ---------- helpers ----------
const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
};

// ---------- enums (as string unions, enforced in app + zod) ----------
export const ROLES = ["CLIENT", "CREATOR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const PROJECT_STATUSES = [
  "DRAFT",
  "OPEN",
  "PROPOSALS_RECEIVED",
  "FREELANCER_SELECTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "REVISION_REQUESTED",
  "APPROVED",
  "PAYMENT_PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROPOSAL_STATUSES = ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const REVISION_STATUSES = ["OPEN", "RESOLVED"] as const;
export type RevisionStatus = (typeof REVISION_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "SUCCEEDED", "FAILED", "CANCELLED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = ["ACTIVE", "EXPIRED", "CANCELLED"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// ---------- User ----------
export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ROLES }).notNull().default("CLIENT"),
  avatar: text("avatar").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  creatorProfile: one(creatorProfiles, {
    fields: [users.id],
    references: [creatorProfiles.userId],
  }),
  projectsAsClient: many(projects, { relationName: "clientProjects" }),
  proposals: many(proposals),
  notifications: many(notifications),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  subscriptions: many(subscriptions),
  reviewsGiven: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewed" }),
}));

// ---------- CreatorProfile ----------
export const creatorProfiles = sqliteTable("creator_profiles", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  headline: text("headline").notNull(),
  bio: text("bio").notNull(),
  specialization: text("specialization").notNull(),
  location: text("location").notNull(),
  experience: integer("experience").notNull().default(0),
  hourlyRate: real("hourly_rate").notNull().default(0),
  rating: real("rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  availability: text("availability", { enum: ["AVAILABLE", "BUSY", "UNAVAILABLE"] }).notNull().default("AVAILABLE"),
  coverGradient: text("cover_gradient").notNull().default("gradient-1"),
  ...timestamps,
}, (t) => ({
  userIdx: uniqueIndex("creator_profiles_user_idx").on(t.userId),
  specIdx: index("creator_profiles_spec_idx").on(t.specialization),
}));

export const creatorProfilesRelations = relations(creatorProfiles, ({ one, many }) => ({
  user: one(users, { fields: [creatorProfiles.userId], references: [users.id] }),
  portfolioItems: many(portfolioItems),
  services: many(services),
  projects: many(projects, { relationName: "creatorProjects" }),
}));

// ---------- PortfolioItem ----------
export const portfolioItems = sqliteTable("portfolio_items", {
  id: id(),
  creatorId: text("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  mediaType: text("media_type", { enum: ["IMAGE", "VIDEO"] }).notNull().default("IMAGE"),
  mediaUrl: text("media_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  gradient: text("gradient").notNull().default("gradient-1"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  creatorIdx: index("portfolio_creator_idx").on(t.creatorId),
}));

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  creator: one(creatorProfiles, { fields: [portfolioItems.creatorId], references: [creatorProfiles.id] }),
}));

// ---------- Service ----------
export const services = sqliteTable("services", {
  id: id(),
  creatorId: text("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  deliveryDays: integer("delivery_days").notNull(),
  revisionsIncluded: integer("revisions_included").notNull().default(2),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (t) => ({
  creatorIdx: index("services_creator_idx").on(t.creatorId),
  categoryIdx: index("services_category_idx").on(t.category),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  creator: one(creatorProfiles, { fields: [services.creatorId], references: [creatorProfiles.id] }),
}));

// ---------- SubscriptionPlan ----------
export const subscriptionPlans = sqliteTable("subscription_plans", {
  id: id(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  duration: integer("duration").notNull(), // days
  description: text("description").notNull(),
  features: text("features").notNull(), // JSON string array
  highlighted: integer("highlighted", { mode: "boolean" }).notNull().default(false),
});

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

// ---------- Subscription ----------
export const subscriptions = sqliteTable("subscriptions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status", { enum: SUBSCRIPTION_STATUSES }).notNull().default("ACTIVE"),
  startDate: integer("start_date", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  endDate: integer("end_date", { mode: "timestamp_ms" }).notNull(),
}, (t) => ({
  userIdx: index("subscriptions_user_idx").on(t.userId),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] }),
}));

// ---------- Project ----------
export const projects = sqliteTable("projects", {
  id: id(),
  clientId: text("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  creatorId: text("creator_id").references(() => creatorProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull().default(""),
  category: text("category").notNull(),
  budgetMin: real("budget_min").notNull(),
  budgetMax: real("budget_max").notNull(),
  deadline: integer("deadline", { mode: "timestamp_ms" }).notNull(),
  status: text("status", { enum: PROJECT_STATUSES }).notNull().default("DRAFT"),
  agreedPrice: real("agreed_price"),
  agreedRevisions: integer("agreed_revisions"),
  ...timestamps,
}, (t) => ({
  clientIdx: index("projects_client_idx").on(t.clientId),
  creatorIdx: index("projects_creator_idx").on(t.creatorId),
  statusIdx: index("projects_status_idx").on(t.status),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, { fields: [projects.clientId], references: [users.id], relationName: "clientProjects" }),
  creator: one(creatorProfiles, { fields: [projects.creatorId], references: [creatorProfiles.id], relationName: "creatorProjects" }),
  proposals: many(proposals),
  files: many(projectFiles),
  revisions: many(revisions),
  payments: many(payments),
  reviews: many(reviews),
  messages: many(messages),
}));

// ---------- Proposal ----------
export const proposals = sqliteTable("proposals", {
  id: id(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  creatorId: text("creator_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  price: real("price").notNull(),
  deliveryDays: integer("delivery_days").notNull(),
  message: text("message").notNull(),
  revisionsIncluded: integer("revisions_included").notNull().default(2),
  status: text("status", { enum: PROPOSAL_STATUSES }).notNull().default("PENDING"),
  ...timestamps,
}, (t) => ({
  projectIdx: index("proposals_project_idx").on(t.projectId),
  creatorIdx: index("proposals_creator_idx").on(t.creatorId),
  uniqueProjectCreator: uniqueIndex("proposals_project_creator_idx").on(t.projectId, t.creatorId),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  project: one(projects, { fields: [proposals.projectId], references: [projects.id] }),
  creator: one(creatorProfiles, { fields: [proposals.creatorId], references: [creatorProfiles.id] }),
}));

// ---------- ProjectFile ----------
export const projectFiles = sqliteTable("project_files", {
  id: id(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull().default(0),
  kind: text("kind", { enum: ["REFERENCE", "SUBMISSION"] }).notNull().default("REFERENCE"),
  note: text("note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  projectIdx: index("project_files_project_idx").on(t.projectId),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, { fields: [projectFiles.projectId], references: [projects.id] }),
  uploader: one(users, { fields: [projectFiles.uploadedBy], references: [users.id] }),
}));

// ---------- Revision ----------
export const revisions = sqliteTable("revisions", {
  id: id(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  requestedBy: text("requested_by").notNull().references(() => users.id),
  description: text("description").notNull(),
  status: text("status", { enum: REVISION_STATUSES }).notNull().default("OPEN"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
}, (t) => ({
  projectIdx: index("revisions_project_idx").on(t.projectId),
}));

export const revisionsRelations = relations(revisions, ({ one }) => ({
  project: one(projects, { fields: [revisions.projectId], references: [projects.id] }),
  requester: one(users, { fields: [revisions.requestedBy], references: [users.id] }),
}));

// ---------- Payment ----------
export const payments = sqliteTable("payments", {
  id: id(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => users.id),
  creatorId: text("creator_id").notNull().references(() => creatorProfiles.id),
  amount: real("amount").notNull(),
  platformFee: real("platform_fee").notNull().default(0),
  status: text("status", { enum: PAYMENT_STATUSES }).notNull().default("PENDING"),
  method: text("method", { enum: ["CARD", "PAYPAL", "BANK_TRANSFER"] }).notNull().default("CARD"),
  transactionId: text("transaction_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  projectIdx: index("payments_project_idx").on(t.projectId),
  txnIdx: uniqueIndex("payments_txn_idx").on(t.transactionId),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  project: one(projects, { fields: [payments.projectId], references: [projects.id] }),
  client: one(users, { fields: [payments.clientId], references: [users.id] }),
  creator: one(creatorProfiles, { fields: [payments.creatorId], references: [creatorProfiles.id] }),
}));

// ---------- Review ----------
export const reviews = sqliteTable("reviews", {
  id: id(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id").notNull().references(() => users.id),
  reviewedUserId: text("reviewed_user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  projectIdx: index("reviews_project_idx").on(t.projectId),
  uniqueReview: uniqueIndex("reviews_project_reviewer_idx").on(t.projectId, t.reviewerId),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  project: one(projects, { fields: [reviews.projectId], references: [projects.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "reviewer" }),
  reviewedUser: one(users, { fields: [reviews.reviewedUserId], references: [users.id], relationName: "reviewed" }),
}));

// ---------- Notification ----------
export const notifications = sqliteTable("notifications", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  userIdx: index("notifications_user_idx").on(t.userId),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// ---------- Message ----------
export const messages = sqliteTable("messages", {
  id: id(),
  senderId: text("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  senderIdx: index("messages_sender_idx").on(t.senderId),
  receiverIdx: index("messages_receiver_idx").on(t.receiverId),
  projectIdx: index("messages_project_idx").on(t.projectId),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sentMessages" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receivedMessages" }),
  project: one(projects, { fields: [messages.projectId], references: [projects.id] }),
}));

// ---------- PlatformSetting ----------
export const platformSettings = sqliteTable("platform_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
