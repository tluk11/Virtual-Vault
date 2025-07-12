import { internalAction } from "./_generated/server";
import { v } from "convex/values";

// Simple email notification using a webhook service
export const sendShareNotification = internalAction({
  args: {
    recipientEmail: v.string(),
    documentTitle: v.string(),
    sharedBy: v.string(),
    permission: v.union(v.literal("view"), v.literal("edit")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { recipientEmail, documentTitle, sharedBy, permission, expiresAt }) => {
    try {
      // You can replace this with any email service like Resend, SendGrid, etc.
      // For now, I'll use a simple webhook approach that you can configure
      
      const emailData = {
        to: recipientEmail,
        subject: `Document Shared: ${documentTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Virtual Vault - Document Shared</h2>
            <p>Hello!</p>
            <p>Someone has shared a document with you in Virtual Vault.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Document Details</h3>
              <p><strong>Document:</strong> ${documentTitle}</p>
              <p><strong>Permission:</strong> ${permission === 'view' ? 'View only' : 'Can edit'}</p>
              ${expiresAt ? `<p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>` : ''}
            </div>
            
            <p>To access this document, you'll need to:</p>
            <ol>
              <li>Create a Virtual Vault account (if you don't have one)</li>
              <li>Sign in to your account</li>
              <li>Go to the "Shared with Me" section</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Access Virtual Vault
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from Virtual Vault. 
              If you have any questions, please contact the person who shared this document with you.
            </p>
          </div>
        `,
        text: `
          Virtual Vault - Document Shared
          
          Hello!
          
          Someone has shared a document with you in Virtual Vault.
          
          Document: ${documentTitle}
          Permission: ${permission === 'view' ? 'View only' : 'Can edit'}
          ${expiresAt ? `Expires: ${new Date(expiresAt).toLocaleDateString()}` : ''}
          
          To access this document:
          1. Create a Virtual Vault account (if you don't have one)
          2. Sign in to your account  
          3. Go to the "Shared with Me" section
          
          Access Virtual Vault: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
          
          This is an automated notification from Virtual Vault.
        `
      };

      // Option 1: Use a webhook service like webhook.site for testing
      const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });
      }

      // Option 2: Use Resend (uncomment and configure if you have a Resend account)
      /*
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "noreply@yourdomain.com",
            to: [recipientEmail],
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          }),
        });
        
        if (!resendResponse.ok) {
          throw new Error(`Resend API error: ${resendResponse.statusText}`);
        }
      }
      */

      console.log(`Email notification sent to ${recipientEmail} for document: ${documentTitle}`);
      
    } catch (error) {
      console.error("Failed to send email notification:", error);
      // Don't throw the error to avoid breaking the share operation
    }
  },
});

// Send notification when access is revoked
export const sendRevokeNotification = internalAction({
  args: {
    recipientEmail: v.string(),
    documentTitle: v.string(),
    revokedBy: v.string(),
  },
  handler: async (ctx, { recipientEmail, documentTitle, revokedBy }) => {
    try {
      const emailData = {
        to: recipientEmail,
        subject: `Access Revoked: ${documentTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Virtual Vault - Access Revoked</h2>
            <p>Hello!</p>
            <p>Your access to a document in Virtual Vault has been revoked.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">Document Details</h3>
              <p><strong>Document:</strong> ${documentTitle}</p>
              <p><strong>Status:</strong> Access revoked</p>
            </div>
            
            <p>You no longer have access to this document. If you believe this was done in error, please contact the document owner.</p>
            
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from Virtual Vault.
            </p>
          </div>
        `,
        text: `
          Virtual Vault - Access Revoked
          
          Hello!
          
          Your access to a document in Virtual Vault has been revoked.
          
          Document: ${documentTitle}
          Status: Access revoked
          
          You no longer have access to this document. If you believe this was done in error, please contact the document owner.
          
          This is an automated notification from Virtual Vault.
        `
      };

      const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });
      }

      console.log(`Revoke notification sent to ${recipientEmail} for document: ${documentTitle}`);
      
    } catch (error) {
      console.error("Failed to send revoke notification:", error);
    }
  },
}); 