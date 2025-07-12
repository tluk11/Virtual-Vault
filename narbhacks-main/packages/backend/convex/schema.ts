import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
  }),
  
  // Virtual Vault Tables
  documents: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    storageId: v.string(), // Reference to Convex file storage
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  documentShares: defineTable({
    documentId: v.id("documents"),
    sharedBy: v.string(), // User ID who shared
    sharedWith: v.string(), // User ID or email who can access
    permission: v.union(v.literal("view"), v.literal("edit")),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_document", ["documentId"]),
  
  documentAccess: defineTable({
    documentId: v.id("documents"),
    userId: v.string(),
    permission: v.union(v.literal("owner"), v.literal("view"), v.literal("edit")),
    grantedAt: v.number(),
  }).index("by_user", ["userId"]),
});
