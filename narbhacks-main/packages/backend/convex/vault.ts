import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Auth } from "convex/server";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all documents for a user (including shared ones)
export const getDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Get user's own documents
    const ownDocuments = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Get documents shared with user
    const sharedAccess = await ctx.db
      .query("documentAccess")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const sharedDocumentIds = sharedAccess.map(access => access.documentId);
    const sharedDocuments = await Promise.all(
      sharedDocumentIds.map(id => ctx.db.get(id))
    );

    return {
      own: ownDocuments,
      shared: sharedDocuments.filter(doc => doc !== null),
    };
  },
});

// Get a specific document
export const getDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, { documentId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const document = await ctx.db.get(documentId);
    if (!document) return null;

    // Check if user has access
    if (document.userId === userId) return document;

    const access = await ctx.db
      .query("documentAccess")
      .filter((q) => 
        q.and(
          q.eq(q.field("documentId"), documentId),
          q.eq(q.field("userId"), userId)
        )
      )
      .first();

    if (access) return document;
    return null;
  },
});

// Generate upload URL for file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

// Create document record after file upload
export const createDocument = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    storageId: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const documentId = await ctx.db.insert("documents", {
      ...args,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    // Create access record for owner
    await ctx.db.insert("documentAccess", {
      documentId,
      userId,
      permission: "owner",
      grantedAt: now,
    });

    return documentId;
  },
});

// Share document with another user
export const shareDocument = mutation({
  args: {
    documentId: v.id("documents"),
    sharedWith: v.string(), // email or user ID
    permission: v.union(v.literal("view"), v.literal("edit")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== userId) {
      throw new Error("Document not found or access denied");
    }

    const now = Date.now();
    
    // Create share record
    await ctx.db.insert("documentShares", {
      documentId: args.documentId,
      sharedBy: userId,
      sharedWith: args.sharedWith,
      permission: args.permission,
      expiresAt: args.expiresAt,
      createdAt: now,
    });

    // Create access record (if user exists)
    await ctx.db.insert("documentAccess", {
      documentId: args.documentId,
      userId: args.sharedWith,
      permission: args.permission,
      grantedAt: now,
    });

    // Send email notification to the recipient
    await ctx.scheduler.runAfter(0, internal.email.sendShareNotification, {
      recipientEmail: args.sharedWith,
      documentTitle: document.title,
      sharedBy: userId,
      permission: args.permission,
      expiresAt: args.expiresAt,
    });
  },
});

// Get document download URL
export const getDocumentUrl = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, { documentId }) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      console.log("No user ID found for document URL request");
      return null;
    }

    const document = await ctx.db.get(documentId);
    if (!document) {
      console.log("Document not found:", documentId);
      return null;
    }

    console.log("Document found:", {
      id: documentId,
      title: document.title,
      storageId: document.storageId,
      ownerId: document.userId,
      requestingUserId: userId
    });

    // Check access
    if (document.userId === userId) {
      console.log("User is owner, generating URL");
      const url = await ctx.storage.getUrl(document.storageId);
      console.log("Generated URL:", url);
      return url;
    }

    const access = await ctx.db
      .query("documentAccess")
      .filter((q) => 
        q.and(
          q.eq(q.field("documentId"), documentId),
          q.eq(q.field("userId"), userId)
        )
      )
      .first();

    if (access) {
      console.log("User has shared access, generating URL");
      const url = await ctx.storage.getUrl(document.storageId);
      console.log("Generated URL:", url);
      return url;
    }

    console.log("User has no access to document");
    return null;
  },
});

// Delete document
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, { documentId }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const document = await ctx.db.get(documentId);
    if (!document || document.userId !== userId) {
      throw new Error("Document not found or access denied");
    }

    // Delete file from storage
    await ctx.storage.delete(document.storageId);

    // Delete access records
    const accessRecords = await ctx.db
      .query("documentAccess")
      .filter((q) => q.eq(q.field("documentId"), documentId))
      .collect();

    for (const record of accessRecords) {
      await ctx.db.delete(record._id);
    }

    // Delete share records
    const shareRecords = await ctx.db
      .query("documentShares")
      .filter((q) => q.eq(q.field("documentId"), documentId))
      .collect();

    for (const record of shareRecords) {
      await ctx.db.delete(record._id);
    }

    // Delete document
    await ctx.db.delete(documentId);
  },
});

// Update document metadata
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== userId) {
      throw new Error("Document not found or access denied");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.documentId, updates);
  },
});

// Get shared documents (documents shared by user)
export const getSharedDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const shares = await ctx.db
      .query("documentShares")
      .filter((q) => q.eq(q.field("sharedBy"), userId))
      .collect();

    const documents = await Promise.all(
      shares.map(share => ctx.db.get(share.documentId))
    );

    return documents.filter(doc => doc !== null);
  },
});

// Revoke document access
export const revokeAccess = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== currentUserId) {
      throw new Error("Document not found or access denied");
    }

    // Delete access record
    const accessRecord = await ctx.db
      .query("documentAccess")
      .filter((q) => 
        q.and(
          q.eq(q.field("documentId"), args.documentId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (accessRecord) {
      await ctx.db.delete(accessRecord._id);
    }

    // Delete share record
    const shareRecord = await ctx.db
      .query("documentShares")
      .filter((q) => 
        q.and(
          q.eq(q.field("documentId"), args.documentId),
          q.eq(q.field("sharedWith"), args.userId)
        )
      )
      .first();

    if (shareRecord) {
      await ctx.db.delete(shareRecord._id);
      
      // Send email notification about access being revoked
      await ctx.scheduler.runAfter(0, internal.email.sendRevokeNotification, {
        recipientEmail: args.userId,
        documentTitle: document.title,
        revokedBy: currentUserId,
      });
    }
  },
}); 