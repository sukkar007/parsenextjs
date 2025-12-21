// server/routers.ts - الإصدار المحدث
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  getAllUsers,
  getStats,
  queryClass,
  createObject,
  updateObject,
  deleteObject,
  updateUser,
  deleteUser,
  uploadFile,
  createAvatarFrameWithFile,
  createAvatarFrameWithFiles,
  uploadAnimatedFile,
  directFileUpload,
  createGiftWithFiles,
  getAllGifts,
} from "./_core/parseService";
import { createSystemLog } from "./_core/logger";

export const appRouter = router({
  // Auth router
  auth: router({
    me: publicProcedure.query(async () => {
      const user = await getCurrentUser();
      return user;
    }),

    logout: publicProcedure.mutation(async () => {
      await logoutUser();
      return { success: true };
    }),
  }),

  parse: router({
    // Authentication
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input }) => {
        const user = await loginUser(input.username, input.password);
        
        // السماح بالدخول للأدمن والمحررين والمشاهدين
        const allowedRoles = ['admin', 'administrator', 'editor', 'viewer', 'مدير', 'مسؤول'];
        const isAllowed = allowedRoles.some(r => user.role?.toLowerCase().includes(r)) || user.isAdmin;

        if (!isAllowed) {
          throw new Error("غير مصرح لك بالدخول. يرجى التواصل مع الإدارة.");
        }

        // تسجيل عملية الدخول
        await createSystemLog({
          adminId: user.id || "unknown",
          adminName: user.username || "unknown",
          action: "تسجيل دخول",
          details: { loginTime: new Date().toISOString() }
        });

        return user;
      }),

    register: publicProcedure
      .input(z.object({ 
        username: z.string(), 
        password: z.string(), 
        email: z.string().email() 
      }))
      .mutation(async ({ input }) => await registerUser(input.username, input.password, input.email)),

    getCurrentUser: publicProcedure.query(async () => await getCurrentUser()),

    logout: publicProcedure.mutation(async () => {
      await logoutUser();
      return { success: true };
    }),

    // Users Management
    getAllUsers: publicProcedure.query(async () => await getAllUsers()),

    updateUser: publicProcedure
      .input(z.object({
        userId: z.string(),
        data: z.record(z.any())
      }))
      .mutation(async ({ input }) => await updateUser(input.userId, input.data)),

    deleteUser: publicProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input }) => await deleteUser(input.userId)),

    // Stats
    getStats: publicProcedure.query(async () => await getStats()),

    getLatestUsers: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        const users = await getAllUsers();
        return users
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, input.limit || 10);
      }),

    // Categories
    getCategories: publicProcedure.query(async () => {
      const categories = await queryClass("Category", 1000);
      return categories.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Announcements
    getAnnouncements: publicProcedure.query(async () => {
      const announcements = await queryClass("Announcement", 1000);
      return announcements.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Ads
    getAds: publicProcedure.query(async () => {
      const ads = await queryClass("Ad", 1000);
      return ads.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Encounters
    getEncounters: publicProcedure.query(async () => {
      const encounters = await queryClass("Encounter", 1000);
      return encounters.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Challenges
    getChallenges: publicProcedure.query(async () => {
      const challenges = await queryClass("Challenge", 1000);
      return challenges.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Entrance Effects
    getEntranceEffects: publicProcedure.query(async () => {
      const effects = await queryClass("EntranceEffect", 1000);
      return effects.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Party Themes
    getPartyThemes: publicProcedure.query(async () => {
      const themes = await queryClass("PartyTheme", 1000);
      return themes.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Comments
    getComments: publicProcedure.query(async () => {
      const comments = await queryClass("Comment", 1000);
      return comments.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Calls
    getCalls: publicProcedure.query(async () => {
      const calls = await queryClass("Call", 1000);
      return calls.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Clicks
    getClicks: publicProcedure.query(async () => {
      const clicks = await queryClass("Click", 1000);
      return clicks.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Posts
    getPosts: publicProcedure.query(async () => {
      const posts = await queryClass("Post", 1000);
      return posts.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Streaming
    getStreamings: publicProcedure.query(async () => {
      const streamings = await queryClass("Streaming", 1000);
      return streamings.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Videos
    getVideos: publicProcedure.query(async () => {
      const videos = await queryClass("Video", 1000);
      return videos.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Withdrawals
    getWithdrawals: publicProcedure.query(async () => {
      const withdrawals = await queryClass("Withdrawal", 1000);
      return withdrawals.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }),

    // Messages Management
    getAllMessages: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        skip: z.number().optional(),
        withCall: z.boolean().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        searchQuery: z.string().optional()
      }))
      .query(async ({ input }) => {
        try {
          console.log("[TRPC] Getting all messages with filters:", input);
          
          // استخدام queryClass من parseService
          const messages = await queryClass("Message", input.limit || 1000, input.skip || 0);
          
          // تصفية الرسائل بناءً على معايير الاختيار
          let filteredMessages = messages;
          
          if (input.withCall === false) {
            filteredMessages = filteredMessages.filter((msg: any) => !msg.call);
          }
          
          if (input.dateFrom || input.dateTo) {
            filteredMessages = filteredMessages.filter((msg: any) => {
              const msgDate = new Date(msg.createdAt || msg.updatedAt);
              
              if (input.dateFrom && new Date(input.dateFrom) > msgDate) return false;
              if (input.dateTo && new Date(input.dateTo) < msgDate) return false;
              
              return true;
            });
          }
          
          // البحث بالنص إذا وجد
          if (input.searchQuery) {
            const searchLower = input.searchQuery.toLowerCase();
            filteredMessages = filteredMessages.filter((msg: any) => 
              msg.text?.toLowerCase().includes(searchLower)
            );
          }
          
          // ترتيب تنازلي حسب التاريخ
          filteredMessages.sort((a: any, b: any) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          
          console.log(`[TRPC] Found ${filteredMessages.length} messages`);
          
          return filteredMessages.map((msg: any) => {
            // استخراج بيانات المرسل
            let author = null;
            if (msg.Author) {
              if (typeof msg.Author === 'object') {
                author = {
                  id: msg.Author.objectId || msg.Author.id,
                  name: msg.Author.name || msg.Author.username,
                  username: msg.Author.username,
                  email: msg.Author.email,
                  role: msg.Author.role,
                  avatar: msg.Author.avatar?.url || msg.Author.avatar?._url
                };
              }
            }
            
            // استخراج بيانات المستقبل
            let receiver = null;
            if (msg.Receiver) {
              if (typeof msg.Receiver === 'object') {
                receiver = {
                  id: msg.Receiver.objectId || msg.Receiver.id,
                  name: msg.Receiver.name || msg.Receiver.username,
                  username: msg.Receiver.username,
                  email: msg.Receiver.email,
                  role: msg.Receiver.role,
                  avatar: msg.Receiver.avatar?.url || msg.Receiver.avatar?._url
                };
              }
            }
            
            // معالجة الصور إذا كانت الرسالة تحتوي على صورة
            let pictureUrl = null;
            if (msg.pictureMessage) {
              if (typeof msg.pictureMessage === 'object' && msg.pictureMessage.url) {
                pictureUrl = msg.pictureMessage.url;
              } else if (typeof msg.pictureMessage === 'object' && msg.pictureMessage._url) {
                pictureUrl = msg.pictureMessage._url;
              } else if (typeof msg.pictureMessage === 'string') {
                pictureUrl = msg.pictureMessage;
              }
            }
            
            return {
              id: msg.objectId || msg.id,
              text: msg.text,
              messageType: msg.messageType || "text",
              pictureUrl: pictureUrl,
              call: msg.call,
              read: msg.read || false,
              author: author,
              receiver: receiver,
              createdAt: msg.createdAt,
              updatedAt: msg.updatedAt
            };
          });
        } catch (error) {
          console.error("[TRPC] Get all messages error:", error);
          return [];
        }
      }),

    getMessageStats: publicProcedure.query(async () => {
      try {
        console.log("[TRPC] Getting message stats");
        
        // استخدام queryClass للحصول على جميع الرسائل
        const messages = await queryClass("Message", 10000, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayMessages = messages.filter((msg: any) => {
          const msgDate = new Date(msg.createdAt || msg.updatedAt);
          return msgDate >= today;
        });
        
        const unreadMessages = messages.filter((msg: any) => !msg.read);
        const imageMessages = messages.filter((msg: any) => 
          msg.messageType === 'picture' || msg.pictureMessage
        );
        
        const stats = {
          total: messages.length,
          today: todayMessages.length,
          unread: unreadMessages.length,
          withImages: imageMessages.length,
          withoutImages: messages.length - imageMessages.length
        };
        
        console.log("[TRPC] Message stats:", stats);
        return stats;
        
      } catch (error) {
        console.error("[TRPC] Get message stats error:", error);
        return {
          total: 0,
          today: 0,
          unread: 0,
          withImages: 0,
          withoutImages: 0
        };
      }
    }),

    deleteMessage: publicProcedure
      .input(z.object({ messageId: z.string() }))
      .mutation(async ({ input }) => {
        console.log("[TRPC] Deleting message:", input.messageId);
        return await deleteObject("Message", input.messageId);
      }),

    deleteMultipleMessages: publicProcedure
      .input(z.object({ messageIds: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        try {
          console.log("[TRPC] Deleting multiple messages:", input.messageIds.length);
          
          // حذف الرسائل واحدة تلو الأخرى
          const deletePromises = input.messageIds.map(messageId => 
            deleteObject("Message", messageId).catch(err => {
              console.error(`[TRPC] Failed to delete message ${messageId}:`, err);
              return { success: false, messageId, error: err.message };
            })
          );
          
          const results = await Promise.all(deletePromises);
          const successfulDeletes = results.filter(r => r !== null);
          
          return {
            success: true,
            deletedCount: successfulDeletes.length,
            totalRequested: input.messageIds.length
          };
        } catch (error) {
          console.error("[TRPC] Delete multiple messages error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            deletedCount: 0
          };
        }
      }),

    searchMessages: publicProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().optional(),
        skip: z.number().optional()
      }))
      .query(async ({ input }) => {
        try {
          console.log("[TRPC] Searching messages for:", input.query);
          
          // الحصول على جميع الرسائل أولاً
          const messages = await queryClass("Message", 1000, 0);
          
          // البحث في النص
          const searchResults = messages.filter((msg: any) => {
            const text = msg.text || '';
            return text.toLowerCase().includes(input.query.toLowerCase());
          });
          
          // ترتيب النتائج
          searchResults.sort((a: any, b: any) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          
          // تطبيق التقسيم للصفحات
          const start = input.skip || 0;
          const end = start + (input.limit || 50);
          const paginatedResults = searchResults.slice(start, end);
          
          // تنسيق النتائج
          return paginatedResults.map((msg: any) => {
            let authorName = "Unknown";
            if (msg.Author) {
              if (typeof msg.Author === 'object') {
                authorName = msg.Author.name || msg.Author.username || "Unknown";
              }
            }
            
            let receiverName = "Unknown";
            if (msg.Receiver) {
              if (typeof msg.Receiver === 'object') {
                receiverName = msg.Receiver.name || msg.Receiver.username || "Unknown";
              }
            }
            
            return {
              id: msg.objectId || msg.id,
              text: msg.text,
              messageType: msg.messageType || "text",
              createdAt: msg.createdAt,
              authorName: authorName,
              receiverName: receiverName
            };
          });
        } catch (error) {
          console.error("[TRPC] Search messages error:", error);
          return [];
        }
      }),

    markAsRead: publicProcedure
      .input(z.object({ messageId: z.string() }))
      .mutation(async ({ input }) => {
        try {
          console.log("[TRPC] Marking message as read:", input.messageId);
          
          // تحديث الكائن مباشرة
          const result = await updateObject("Message", input.messageId, {
            read: true
          });
          
          return {
            success: true,
            messageId: input.messageId,
            updatedAt: result.updatedAt
          };
        } catch (error) {
          console.error("[TRPC] Mark as read error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }),

    // Data Management
    queryClass: publicProcedure
      .input(z.object({
        className: z.string(),
        limit: z.number().optional(),
        skip: z.number().optional()
      }))
      .query(async ({ input }) => await queryClass(input.className, input.limit, input.skip)),

    createObject: publicProcedure
      .input(z.object({
        className: z.string(),
        data: z.record(z.any())
      }))
      .mutation(async ({ input }) => await createObject(input.className, input.data)),

    updateObject: publicProcedure
      .input(z.object({
        className: z.string(),
        objectId: z.string(),
        data: z.record(z.any())
      }))
      .mutation(async ({ input }) => await updateObject(input.className, input.objectId, input.data)),

    deleteObject: publicProcedure
      .input(z.object({
        className: z.string(),
        objectId: z.string()
      }))
      .mutation(async ({ input }) => await deleteObject(input.className, input.objectId)),

    // File Upload
    uploadFile: publicProcedure
      .input(z.object({
        base64: z.string(),
        fileName: z.string(),
        mimeType: z.string()
      }))
      .mutation(async ({ input }) => {
        const fileUrl = await uploadFile(input.base64, input.fileName);
        return {
          success: true,
          fileUrl,
          fileName: input.fileName
        };
      }),

    uploadAnimatedFile: publicProcedure
      .input(z.object({
        base64: z.string(),
        fileName: z.string(),
        mimeType: z.string()
      }))
      .mutation(async ({ input }) => {
        try {
          console.log("[TRPC] Uploading animated file:", input.fileName);
          const result = await uploadAnimatedFile(
            input.base64,
            input.fileName,
            input.mimeType
          );
          
          console.log("[TRPC] Animated file upload result:", result);
          
          return {
            success: true,
            ...result
          };
        } catch (error) {
          console.error("[TRPC] Animated file upload failed:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }),

    // Gift Management
    getAllGifts: publicProcedure.query(async () => {
      try {
        console.log("[TRPC] Getting all gifts...");
        const gifts = await getAllGifts();
        console.log(`[TRPC] Found ${gifts.length} gifts`);
        return gifts;
      } catch (error) {
        console.error("[TRPC] Get all gifts error:", error);
        return [];
      }
    }),

    createGift: publicProcedure
      .input(z.object({
        name: z.string(),
        categories: z.string(),
        coins: z.number(),
        fileData: z.object({
          base64: z.string(),
          fileName: z.string(),
          mimeType: z.string()
        }),
        previewData: z.object({
          base64: z.string(),
          fileName: z.string(),
          mimeType: z.string()
        })
      }))
      .mutation(async ({ input }) => {
        try {
          console.log("[TRPC] Creating gift:", input.name);
          
          const result = await createGiftWithFiles(
            input.name,
            input.categories,
            input.coins,
            {
              mainFile: input.fileData,
              previewFile: input.previewData
            }
          );
          
          console.log("[TRPC] Gift created successfully:", result.id);
          
          return {
            success: true,
            gift: result
          };
        } catch (error) {
          console.error("[TRPC] Create gift error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }),

    updateGift: publicProcedure
      .input(z.object({
        giftId: z.string(),
        data: z.record(z.any())
      }))
      .mutation(async ({ input }) => await updateObject("Gifts", input.giftId, input.data)),

    deleteGift: publicProcedure
      .input(z.object({ giftId: z.string() }))
      .mutation(async ({ input }) => await deleteObject("Gifts", input.giftId)),

    // Avatar Frames
    getAvatarFrames: publicProcedure.query(async () => {
      try {
        console.log("[TRPC] Fetching avatar frames...");
        const frames = await queryClass("Gifts", 100, 0);
        const avatarFrames = frames.filter((frame: any) => 
          frame.categories === "avatar_frame"
        );
        
        console.log(`[TRPC] Found ${avatarFrames.length} avatar frames`);
        
        const fixedFrames = avatarFrames.map((frame: any) => {
          const fixUrl = (url: string | undefined): string => {
            if (!url) return '';
            
            if (url.includes('/files/myAppId/') && !url.includes('/parse/files/myAppId/')) {
              return url.replace('/files/myAppId/', '/parse/files/myAppId/');
            }
            
            if (url.startsWith('/files/')) {
              return `https://parse-server-example-o1ht.onrender.com/parse${url}`;
            }
            
            if (!url.startsWith('http')) {
              return `https://parse-server-example-o1ht.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
            }
            
            return url;
          };
          
          const fixedFrame: any = { ...frame };
          
          if (frame.file?.url) {
            fixedFrame.file = {
              ...frame.file,
              url: fixUrl(frame.file.url)
            };
          }
          
          if (frame.preview?.url) {
            fixedFrame.preview = {
              ...frame.preview,
              url: fixUrl(frame.preview.url)
            };
          }
          
          return fixedFrame;
        });
        
        return fixedFrames;
      } catch (error) {
        console.error("[TRPC] Error fetching avatar frames:", error);
        throw error;
      }
    }),

    createAvatarFrame: publicProcedure
      .input(z.object({
        name: z.string(),
        credits: z.number(),
        period: z.number().optional(),
        fileData: z.object({
          base64: z.string(),
          fileName: z.string(),
          mimeType: z.string()
        })
      }))
      .mutation(async ({ input }) => {
        console.log("[TRPC] Creating avatar frame (legacy):", input.name);
        return await createAvatarFrameWithFile(
          input.name,
          input.credits,
          input.period || 15,
          input.fileData
        );
      }),

    createAvatarFrameAdvanced: publicProcedure
      .input(z.object({
        name: z.string(),
        credits: z.number(),
        period: z.number().optional(),
        files: z.object({
          mainFile: z.object({
            base64: z.string(),
            fileName: z.string(),
            mimeType: z.string()
          }),
          previewFile: z.object({
            base64: z.string(),
            fileName: z.string(),
            mimeType: z.string()
          }).optional()
        })
      }))
      .mutation(async ({ input }) => {
        console.log("[TRPC] Creating advanced avatar frame:", input.name);
        return await createAvatarFrameWithFiles(
          input.name,
          input.credits,
          input.period || 15,
          input.files
        );
      }),

    deleteAvatarFrame: publicProcedure
      .input(z.object({ frameId: z.string() }))
      .mutation(async ({ input }) => await deleteObject("Gifts", input.frameId)),

    // Search
    searchUsers: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        role: z.string().optional(),
        limit: z.number().optional(),
        skip: z.number().optional()
      }))
      .query(async ({ input }) => {
        const users = await getAllUsers();
        let filtered = users;

        if (input.query) {
          const searchQuery = input.query.toLowerCase();
          filtered = filtered.filter(user => 
            user.username?.toLowerCase().includes(searchQuery) ||
            user.email?.toLowerCase().includes(searchQuery) ||
            user.name?.toLowerCase().includes(searchQuery)
          );
        }

        if (input.role) {
          filtered = filtered.filter(user => user.role === input.role);
        }

        return filtered.slice(input.skip || 0, (input.skip || 0) + (input.limit || 100));
      }),

    // Test connection
    testConnection: publicProcedure.query(async () => {
      try {
        const user = await getCurrentUser();
        const stats = await getStats();
        
        return {
          success: true,
          parseConnected: true,
          currentUser: user ? user.username : 'Not logged in',
          userCount: stats?._User || 0,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          success: false,
          parseConnected: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;