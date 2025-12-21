// server/_core/parseService.ts
// @ts-ignore - parse/node doesn't have type definitions
import Parse from "parse/node.js";
import { initializeParse } from "./parseConfig";

// Initialize Parse on module load
initializeParse();

/**
 * Parse Service - Handle all Parse-related operations
 */

export interface ParseUser {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Helper: Get user role from various possible fields
 */
function getUserRole(user: any): string {
  // تحقق من حقول role المختلفة
  const role = user.get("role") || 
               user.get("userRole") || 
               user.get("permission") || 
               user.get("userType") || 
               user.get("roleType") || 
               "user";
  
  return role.toString().toLowerCase();
}

/**
 * Check if user is admin
 */
function isUserAdmin(role: string): boolean {
  const normalizedRole = role.toLowerCase().trim();
  
  return normalizedRole === 'admin' || 
         normalizedRole === 'administrator' || 
         normalizedRole === 'مدير' ||
         normalizedRole === 'مسؤول' ||
         normalizedRole === 'إداري' ||
         normalizedRole.includes('admin');
}

/**
 * Register a new user with Parse
 */
 // في parseService.ts، أضف هذه الدوال:

/**
 * Create object with file upload
 */
export async function createObjectWithFile(
  className: string,
  data: Record<string, any>,
  fileData?: {
    base64: string;
    fileName: string;
    mimeType: string;
    fieldName: string;
  }
): Promise<any> {
  try {
    const ParseObject = Parse.Object.extend(className);
    const obj = new ParseObject();

    // Handle file upload if provided
    if (fileData) {
      const cleanBase64 = fileData.base64.replace(/^data:[^;]+;base64,/, '');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const safeFileName = fileData.fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const uniqueFileName = `${className.toLowerCase()}_${timestamp}_${randomStr}_${safeFileName}`;
      
      const parseFile = new Parse.File(uniqueFileName, { 
        base64: cleanBase64 
      }, fileData.mimeType);
      
      await parseFile.save({ useMasterKey: true });
      obj.set(fileData.fieldName, parseFile);
    }

    // Set other data
    Object.keys(data).forEach((key) => {
      obj.set(key, data[key]);
    });

    const savedObj = await obj.save(null, { useMasterKey: true });

    return {
      id: savedObj.id,
      ...savedObj.toJSON(),
    };
  } catch (error) {
    console.error(`[Parse] Create object with file in ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل إنشاء العنصر: ${errorMessage}`);
  }
}

/**
 * Create announcement with optional image
 */
export async function createAnnouncement(
  title: string,
  content: string,
  type: string,
  imageData?: {
    base64: string;
    fileName: string;
    mimeType: string;
  }
): Promise<any> {
  const data: Record<string, any> = {
    title,
    content,
    type,
    isActive: true,
    priority: 1
  };

  return createObjectWithFile("Announcement", data, imageData ? {
    ...imageData,
    fieldName: "image"
  } : undefined);
}

/**
 * Create ad with image
 */
export async function createAd(
  title: string,
  adType: string,
  url: string,
  imageData: {
    base64: string;
    fileName: string;
    mimeType: string;
  }
): Promise<any> {
  const data: Record<string, any> = {
    title,
    adType,
    url,
    clicks: 0,
    isActive: true
  };

  return createObjectWithFile("Ad", data, {
    ...imageData,
    fieldName: "image"
  });
}

/**
 * Create category
 */
export async function createCategory(
  name: string,
  description: string,
  order: number = 0
): Promise<any> {
  return createObject("Category", {
    name,
    description,
    order,
    isActive: true
  });
}
export async function registerUser(
  username: string,
  password: string,
  email: string
): Promise<ParseUser> {
  try {
    const user = new Parse.User();
    user.set("username", username);
    user.set("password", password);
    user.set("email", email);
    user.set("role", "admin"); // ✅ جعل المستخدم admin مباشرة عند التسجيل

    const savedUser = await user.save();

    return {
      id: savedUser.id,
      username: savedUser.get("username"),
      email: savedUser.get("email"),
      role: savedUser.get("role") || "admin",
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  } catch (error) {
    console.error("[Parse] Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل إنشاء الحساب: ${errorMessage}`);
  }
}

/**
 * Login user with Parse
 */
export async function loginUser(
  username: string,
  password: string
): Promise<ParseUser> {
  try {
    const user = await Parse.User.logIn(username, password);
    
    // ✅ جلب role من المستخدم
    const userRole = getUserRole(user);

    console.log("[Parse] Login successful:", {
      username: user.get("username"),
      role: userRole,
      isAdmin: isUserAdmin(userRole)
    });

   return {
  id: user.id,
  username: user.get("username"),
  email: user.get("email"),
  role: userRole,
  isAdmin: isUserAdmin(userRole), // ✅ هذا هو الصح
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

  } catch (error) {
    console.error("[Parse] Login error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل تسجيل الدخول: ${errorMessage}`);
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<ParseUser | null> {
  try {
    const user = Parse.User.current();

    if (!user) {
      return null;
    }

    const userRole = getUserRole(user);

    return {
      id: user.id,
      username: user.get("username"),
      email: user.get("email"),
      role: userRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("[Parse] Get current user error:", error);
    return null;
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  try {
    await Parse.User.logOut();
  } catch (error) {
    console.error("[Parse] Logout error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل تسجيل الخروج: ${errorMessage}`);
  }
}

/**
 * Query all users (requires master key)
 */
export async function getAllUsers(): Promise<ParseUser[]> {
  try {
    const query = new Parse.Query(Parse.User);
    const users = await query.find({ useMasterKey: true });

    return users.map((user: any) => {
      const userRole = getUserRole(user);
      
      return {
        id: user.id,
        username: user.get("username"),
        email: user.get("email"),
        role: userRole,
        isAdmin: isUserAdmin(userRole),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
  } catch (error) {
    console.error("[Parse] Get all users error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل جلب المستخدمين: ${errorMessage}`);
  }
}

/**
 * Delete user by ID (requires master key)
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const query = new Parse.Query(Parse.User);
    const user = await query.get(userId, { useMasterKey: true });
    await user.destroy({ useMasterKey: true });
  } catch (error) {
    console.error("[Parse] Delete user error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل حذف المستخدم: ${errorMessage}`);
  }
}

/**
 * Update user data
 */
export async function updateUser(
  userId: string,
  data: Record<string, any>
): Promise<ParseUser> {
  try {
    const query = new Parse.Query(Parse.User);
    const user = await query.get(userId, { useMasterKey: true });

    Object.keys(data).forEach((key) => {
      user.set(key, data[key]);
    });

    const updatedUser = await user.save(null, { useMasterKey: true });
    const userRole = getUserRole(updatedUser);

    return {
      id: updatedUser.id,
      username: updatedUser.get("username"),
      email: updatedUser.get("email"),
      role: userRole,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    console.error("[Parse] Update user error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل تحديث المستخدم: ${errorMessage}`);
  }
}

/**
 * Query Parse objects from a specific class
 */
export async function queryClass(
  className: string,
  limit: number = 100,
  skip: number = 0
): Promise<any[]> {
  try {
    const query = new Parse.Query(className);
    query.limit(limit);
    query.skip(skip);
    const results = await query.find({ useMasterKey: true });

    return results.map((obj: any) => {
      const jsonData = obj.toJSON();
      
      // إصلاح هيكل الملفات إذا كان موجوداً
      if (jsonData.file && typeof jsonData.file === 'object') {
        const file = jsonData.file;
        
        if (file.url && !file.__type) {
          jsonData.file = {
            __type: "File",
            name: file.name || file.url.split('/').pop() || "frame.png",
            url: file.url
          };
        }
        else if (file._url || (file.url && file.__type === "File")) {
          jsonData.file = {
            __type: "File",
            name: file.name || file._name || file.url?.split('/').pop() || "frame.png",
            url: file._url || file.url
          };
        }
      }
      
      if (jsonData.preview && typeof jsonData.preview === 'object') {
        const preview = jsonData.preview;
        
        if (preview.url && !preview.__type) {
          jsonData.preview = {
            __type: "File",
            name: preview.name || preview.url.split('/').pop() || "preview.png",
            url: preview.url
          };
        }
      }
      
      return {
        id: obj.id,
        ...jsonData,
      };
    });
  } catch (error) {
    console.error(`[Parse] Query class ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل جلب البيانات من ${className}: ${errorMessage}`);
  }
}

/**
 * Create a new Parse object
 */
export async function createObject(
  className: string,
  data: Record<string, any>
): Promise<any> {
  try {
    const ParseObject = Parse.Object.extend(className);
    const obj = new ParseObject();

    Object.keys(data).forEach((key) => {
      obj.set(key, data[key]);
    });

    const savedObj = await obj.save(null, { useMasterKey: true });

    return {
      id: savedObj.id,
      ...savedObj.toJSON(),
    };
  } catch (error) {
    console.error(`[Parse] Create object in ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل إنشاء العنصر: ${errorMessage}`);
  }
}

/**
 * Update a Parse object
 */
export async function updateObject(
  className: string,
  objectId: string,
  data: Record<string, any>
): Promise<any> {
  try {
    const query = new Parse.Query(className);
    const obj = await query.get(objectId, { useMasterKey: true });

    Object.keys(data).forEach((key) => {
      obj.set(key, data[key]);
    });

    const updatedObj = await obj.save(null, { useMasterKey: true });

    return {
      id: updatedObj.id,
      ...updatedObj.toJSON(),
    };
  } catch (error) {
    console.error(`[Parse] Update object in ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل تحديث العنصر: ${errorMessage}`);
  }
}

/**
 * Delete a Parse object
 */
export async function deleteObject(
  className: string,
  objectId: string
): Promise<void> {
  try {
    const query = new Parse.Query(className);
    const obj = await query.get(objectId, { useMasterKey: true });
    await obj.destroy({ useMasterKey: true });
  } catch (error) {
    console.error(`[Parse] Delete object in ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل حذف العنصر: ${errorMessage}`);
  }
}

/**
 * Check if file is animated (GIF, APNG, etc.)
 */
function isAnimatedImage(mimeType: string, fileName: string): boolean {
  const animatedTypes = ['image/gif', 'image/apng', 'image/webp'];
  const animatedExtensions = ['.gif', '.apng', '.webp', '.svga'];
  
  return animatedTypes.includes(mimeType.toLowerCase()) || 
         animatedExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

/**
 * Check if file is SVGA format
 */
function isSVGAFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.svga');
}

/**
 * Calculate file size from base64 string (in KB)
 */
function calculateBase64Size(base64Data: string): number {
  try {
    const cleanBase64 = base64Data.replace(/^data:[\w\/\-\.]+;base64,/, '');
    const sizeInBytes = (cleanBase64.length * 3) / 4;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    
    return sizeInKB;
  } catch (error) {
    console.error("[Parse] Error calculating base64 size:", error);
    return 0;
  }
}

/**
 * Upload file with support for all image types
 */
export async function uploadAnimatedFile(
  base64Data: string, 
  fileName: string,
  mimeType: string
): Promise<{ 
  fileUrl: string; 
  thumbnailUrl?: string; 
  isAnimated: boolean;
  isSVGA: boolean;
}> {
  try {
    const isAnimated = isAnimatedImage(mimeType, fileName);
    const isSVGA = isSVGAFile(fileName);
    const fileSizeKB = calculateBase64Size(base64Data);
    
    console.log("[Parse] Uploading file:", { 
      fileName, 
      mimeType, 
      size: fileSizeKB + "KB",
      isAnimated,
      isSVGA
    });
    
    let cleanBase64 = base64Data;
    if (base64Data.startsWith('data:')) {
      const match = base64Data.match(/^data:([\w\/\-\.]+);base64,/);
      if (match) {
        cleanBase64 = base64Data.replace(/^data:[\w\/\-\.]+;base64,/, '');
      }
    }
    
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const uniqueFileName = `frame_${timestamp}_${randomStr}_${safeFileName}`;
    
    console.log("[Parse] Creating Parse.File:", uniqueFileName);
    
    const parseFile = new Parse.File(uniqueFileName, { 
      base64: cleanBase64 
    }, mimeType);
    
    console.log("[Parse] Saving file to Parse Server...");
    await parseFile.save({ useMasterKey: true });
    
    const fileUrl = parseFile.url();
    
    console.log("[Parse] File uploaded successfully:", {
      name: parseFile.name(),
      url: fileUrl,
      size: fileSizeKB + "KB"
    });
    
    let thumbnailUrl: string | undefined;
    if (!isSVGA && mimeType.startsWith('image/')) {
      thumbnailUrl = fileUrl;
    }
    
    return {
      fileUrl,
      thumbnailUrl,
      isAnimated,
      isSVGA
    };
    
  } catch (error) {
    console.error("[Parse] Upload animated file error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل رفع الملف: ${errorMessage}`);
  }
}

/**
 * Create avatar frame with support for all file types
 */
export async function createAvatarFrameWithFiles(
  name: string,
  credits: number,
  period: number,
  files: {
    mainFile: {
      base64: string;
      fileName: string;
      mimeType: string;
    };
    previewFile?: {
      base64: string;
      fileName: string;
      mimeType: string;
    };
  }
): Promise<any> {
  try {
    console.log("[Parse] Starting to create avatar frame with files...");
    console.log("[Parse] Main file:", files.mainFile.fileName, files.mainFile.mimeType);
    
    const mainFileSizeKB = calculateBase64Size(files.mainFile.base64);
    let previewFileSizeKB = 0;
    
    if (files.previewFile) {
      console.log("[Parse] Preview file:", files.previewFile.fileName, files.previewFile.mimeType);
      previewFileSizeKB = calculateBase64Size(files.previewFile.base64);
    }
    
    console.log("[Parse] Uploading main file...");
    const mainFileResult = await uploadAnimatedFile(
      files.mainFile.base64,
      files.mainFile.fileName,
      files.mainFile.mimeType
    );
    
    console.log("[Parse] Main file uploaded:", {
      url: mainFileResult.fileUrl,
      isAnimated: mainFileResult.isAnimated,
      isSVGA: mainFileResult.isSVGA,
      size: mainFileSizeKB + "KB"
    });
    
    let previewFile: Parse.File | null = null;
    let previewFileResult = null;
    
    if (files.previewFile) {
      console.log("[Parse] Uploading preview file...");
      previewFileResult = await uploadAnimatedFile(
        files.previewFile.base64,
        files.previewFile.fileName,
        files.previewFile.mimeType
      );
      
      const cleanBase64 = files.previewFile.base64.replace(/^data:[\w\/\-\.]+;base64,/, '');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const safeFileName = files.previewFile.fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const uniquePreviewName = `preview_${timestamp}_${randomStr}_${safeFileName}`;
      
      previewFile = new Parse.File(uniquePreviewName, { 
        base64: cleanBase64 
      }, files.previewFile.mimeType);
      
      console.log("[Parse] Preview file uploaded:", {
        url: previewFileResult.fileUrl,
        size: previewFileSizeKB + "KB"
      });
    }
    
    const mainCleanBase64 = files.mainFile.base64.replace(/^data:[\w\/\-\.]+;base64,/, '');
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const safeFileName = files.mainFile.fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const uniqueFileName = `frame_${timestamp}_${randomStr}_${safeFileName}`;
    
    const parseFile = new Parse.File(uniqueFileName, { 
      base64: mainCleanBase64 
    }, files.mainFile.mimeType);
    
    const ParseObject = Parse.Object.extend("Gifts");
    const frame = new ParseObject();
    
    frame.set("name", name);
    frame.set("categories", "avatar_frame");
    frame.set("coins", credits);
    frame.set("period", period || 15);
    frame.set("file", parseFile);
    
    if (previewFile) {
      frame.set("preview", previewFile);
    }
    
    frame.set("isAnimated", mainFileResult.isAnimated);
    frame.set("isSVGA", mainFileResult.isSVGA);
    frame.set("fileType", files.mainFile.mimeType);
    frame.set("fileSize", mainFileSizeKB);
    
    console.log("[Parse] Saving frame to database...");
    const savedFrame = await frame.save(null, { useMasterKey: true });
    
    console.log("[Parse] Frame created successfully, ID:", savedFrame.id);
    
    const result = {
      id: savedFrame.id,
      name: savedFrame.get("name"),
      categories: savedFrame.get("categories"),
      coins: savedFrame.get("coins"),
      period: savedFrame.get("period"),
      isAnimated: savedFrame.get("isAnimated"),
      isSVGA: savedFrame.get("isSVGA"),
      fileType: savedFrame.get("fileType"),
      fileSize: savedFrame.get("fileSize"),
      file: {
        __type: "File",
        name: parseFile.name(),
        url: mainFileResult.fileUrl
      },
      preview: previewFile ? {
        __type: "File",
        name: previewFile.name(),
        url: previewFileResult?.fileUrl
      } : undefined,
      createdAt: savedFrame.createdAt,
      updatedAt: savedFrame.updatedAt
    };
    
    console.log("[Parse] Returning result:", result);
    return result;
    
  } catch (error) {
    console.error("[Parse] Create avatar frame error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل إنشاء إطار الصورة: ${errorMessage}`);
  }
}

/**
 * Simple file upload (backward compatibility)
 */
export async function uploadFile(base64Data: string, fileName: string): Promise<string> {
  const result = await uploadAnimatedFile(base64Data, fileName, "image/png");
  return result.fileUrl;
}

/**
 * Create avatar frame with file upload (backward compatibility)
 */
export async function createAvatarFrameWithFile(
  name: string,
  credits: number,
  period: number,
  fileData: {
    base64: string;
    fileName: string;
    mimeType: string;
  }
): Promise<any> {
  return createAvatarFrameWithFiles(name, credits, period, {
    mainFile: fileData
  });
}

/**
 * Get statistics for dashboard
 */
export async function getStats(): Promise<any> {
  try {
    const today = new Date();
    today.setHours(today.getHours() - 24);
    
    const userQuery = new Parse.Query(Parse.User);
    userQuery.greaterThanOrEqualTo("createdAt", today);
    const registeredToday = await userQuery.count({ useMasterKey: true });

    const totalUsersQuery = new Parse.Query(Parse.User);
    const totalUsers = await totalUsersQuery.count({ useMasterKey: true });

    const messageQuery = new Parse.Query("Message");
    const messages = await messageQuery.count({ useMasterKey: true });

    const videoQuery = new Parse.Query("Video");
    const videos = await videoQuery.count({ useMasterKey: true });

    const streamingQuery = new Parse.Query("Streaming");
    const streamings = await streamingQuery.count({ useMasterKey: true });

    const challengeQuery = new Parse.Query("Challenge");
    const challenges = await challengeQuery.count({ useMasterKey: true });

    const categoryQuery = new Parse.Query("Category");
    const categories = await categoryQuery.count({ useMasterKey: true });

    const storiesQuery = new Parse.Query("Stories");
    const stories = await storiesQuery.count({ useMasterKey: true });

    return {
      UserToday: registeredToday,
      _User: totalUsers,
      Message: messages,
      Video: videos,
      Streaming: streamings,
      Challenge: challenges,
      Category: categories,
      Stories: stories,
    };
  } catch (error) {
    console.error("[Parse] Get stats error:", error);
    return {
      UserToday: 0,
      _User: 0,
      Message: 0,
      Video: 0,
      Streaming: 0,
      Challenge: 0,
      Category: 0,
      Stories: 0,
    };
  }
}

/**
 * Direct file upload to Parse (for testing)
 */
export async function directFileUpload(
  base64Data: string,
  fileName: string
): Promise<{ success: boolean; fileUrl: string; name: string }> {
  try {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const timestamp = Date.now();
    const uniqueFileName = `test_${timestamp}_${fileName}`;
    
    const parseFile = new Parse.File(uniqueFileName, { base64: cleanBase64 });
    await parseFile.save({ useMasterKey: true });
    
    return {
      success: true,
      fileUrl: parseFile.url(),
      name: parseFile.name()
    };
  } catch (error) {
    console.error("[Parse] Direct file upload error:", error);
    throw error;
  }
}
// في نهاية ملف parseService.ts، بعد دالة directFileUpload، أضف:

/**
 * Create a new gift with files
 */// server/_core/parseService.ts - الجزء الخاص بالهدايا

/**
 * Create a new gift with files
 */
 // في parseService.ts، أضف هذه الدوال:

/**
 * Get message statistics
 */
export async function getMessageStats(): Promise<any> {
  try {
    const query = new Parse.Query("Message");
    const totalMessages = await query.count({ useMasterKey: true });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQuery = new Parse.Query("Message");
    todayQuery.greaterThanOrEqualTo("createdAt", today);
    const messagesToday = await todayQuery.count({ useMasterKey: true });
    
    const unreadQuery = new Parse.Query("Message");
    unreadQuery.equalTo("read", false);
    const unreadMessages = await unreadQuery.count({ useMasterKey: true });
    
    const imageQuery = new Parse.Query("Message");
    imageQuery.equalTo("messageType", "picture");
    const imageMessages = await imageQuery.count({ useMasterKey: true });
    
    return {
      total: totalMessages,
      today: messagesToday,
      unread: unreadMessages,
      withImages: imageMessages,
      withoutImages: totalMessages - imageMessages
    };
  } catch (error) {
    console.error("[Parse] Get message stats error:", error);
    return {
      total: 0,
      today: 0,
      unread: 0,
      withImages: 0,
      withoutImages: 0
    };
  }
}

/**
 * Delete multiple messages
 */
export async function deleteMultipleMessages(messageIds: string[]): Promise<{ success: boolean; deletedCount: number }> {
  try {
    const query = new Parse.Query("Message");
    query.containedIn("objectId", messageIds);
    const messages = await query.find({ useMasterKey: true });
    
    await Promise.all(messages.map(msg => msg.destroy({ useMasterKey: true })));
    
    return {
      success: true,
      deletedCount: messages.length
    };
  } catch (error) {
    console.error("[Parse] Delete multiple messages error:", error);
    throw new Error(`فشل حذف الرسائل: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<{ success: boolean; messageId: string }> {
  try {
    const query = new Parse.Query("Message");
    const message = await query.get(messageId, { useMasterKey: true });
    
    message.set("read", true);
    await message.save(null, { useMasterKey: true });
    
    return {
      success: true,
      messageId
    };
  } catch (error) {
    console.error("[Parse] Mark as read error:", error);
    throw new Error(`فشل تحديث حالة الرسالة: ${error instanceof Error ? error.message : String(error)}`);
  }
}
export async function createGiftWithFiles(
  name: string,
  category: string,
  credits: number,
  files: {
    mainFile: {
      base64: string;
      fileName: string;
      mimeType: string;
    };
    previewFile: {
      base64: string;
      fileName: string;
      mimeType: string;
    };
  }
): Promise<any> {
  try {
    console.log("[Parse] Starting to create gift with files...", {
      name,
      category,
      credits,
      mainFile: files.mainFile.fileName,
      previewFile: files.previewFile.fileName
    });

    // تحويل base64 إلى Parse File
    const createParseFile = async (base64Data: string, fileName: string, mimeType: string): Promise<Parse.File> => {
      // تنظيف base64 من البادئة
      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
      
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const uniqueFileName = `gift_${timestamp}_${randomStr}_${safeFileName}`;
      
      console.log(`[Parse] Creating Parse.File: ${uniqueFileName}`, { size: cleanBase64.length });
      
      const parseFile = new Parse.File(uniqueFileName, { base64: cleanBase64 }, mimeType);
      return parseFile;
    };

    // إنشاء الملفات
    console.log("[Parse] Creating main file...");
    const mainParseFile = await createParseFile(
      files.mainFile.base64,
      files.mainFile.fileName,
      files.mainFile.mimeType
    );

    console.log("[Parse] Creating preview file...");
    const previewParseFile = await createParseFile(
      files.previewFile.base64,
      files.previewFile.fileName,
      files.previewFile.mimeType
    );

    // حفظ الملفات إلى Parse Server
    console.log("[Parse] Saving files to Parse Server...");
    await Promise.all([
      mainParseFile.save({ useMasterKey: true }),
      previewParseFile.save({ useMasterKey: true })
    ]);

    console.log("[Parse] Files saved successfully:", {
      mainFileUrl: mainParseFile.url(),
      previewFileUrl: previewParseFile.url()
    });

    // إنشاء كائن الهدية
    console.log("[Parse] Creating gift object...");
    const Gift = Parse.Object.extend("Gifts");
    const gift = new Gift();

    gift.set("name", name);
    gift.set("categories", category);
    gift.set("coins", credits);
    gift.set("file", mainParseFile);
    gift.set("preview", previewParseFile);
    
    // معلومات إضافية
    gift.set("fileSize", Math.round(files.mainFile.base64.length * 0.75 / 1024)); // تقدير الحجم بالكيلوبايت
    gift.set("fileType", files.mainFile.mimeType);
    gift.set("previewType", files.previewFile.mimeType);

    console.log("[Parse] Saving gift to database...");
    const savedGift = await gift.save(null, { useMasterKey: true });

    console.log("[Parse] Gift created successfully, ID:", savedGift.id);

    // إرجاع النتيجة
    const result = {
      id: savedGift.id,
      name: savedGift.get("name"),
      categories: savedGift.get("categories"),
      coins: savedGift.get("coins"),
      file: {
        __type: "File",
        name: mainParseFile.name(),
        url: mainParseFile.url()
      },
      preview: {
        __type: "File",
        name: previewParseFile.name(),
        url: previewParseFile.url()
      },
      fileSize: savedGift.get("fileSize"),
      fileType: savedGift.get("fileType"),
      previewType: savedGift.get("previewType"),
      createdAt: savedGift.createdAt,
      updatedAt: savedGift.updatedAt
    };

    console.log("[Parse] Returning result:", { 
      id: result.id, 
      name: result.name,
      fileUrl: result.file.url.substring(0, 100) + '...'
    });

    return result;

  } catch (error) {
    console.error("[Parse] Create gift error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل إنشاء الهدية: ${errorMessage}`);
  }
}

/**
 * Get all gifts (excluding avatar frames and themes)
 */
 // في parseService.ts، أضف هذه الدالة:

/**
 * Get all messages with filters
 */
export async function getAllMessages(
  limit: number = 1000,
  skip: number = 0,
  filters?: {
    withCall?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    searchQuery?: string;
  }
): Promise<any[]> {
  try {
    const query = new Parse.Query("Message");
    
    if (filters?.withCall === false) {
      query.doesNotExist("call");
    }
    
    if (filters?.dateFrom) {
      query.greaterThanOrEqualTo("createdAt", filters.dateFrom);
    }
    
    if (filters?.dateTo) {
      query.lessThanOrEqualTo("createdAt", filters.dateTo);
    }
    
    if (filters?.searchQuery) {
      query.contains("text", filters.searchQuery);
    }
    
    query.descending("createdAt");
    query.limit(limit);
    query.skip(skip);
    query.include(["Author", "Receiver"]);
    
    const messages = await query.find({ useMasterKey: true });
    
    return messages.map((msg: any) => {
      const msgData = msg.toJSON();
      
      // إصلاح هيكل البيانات
      const result: any = {
        id: msgData.objectId,
        text: msgData.text,
        messageType: msgData.messageType || "text",
        call: msgData.call,
        read: msgData.read || false,
        createdAt: msgData.createdAt,
        updatedAt: msgData.updatedAt
      };
      
      // معالجة بيانات المرسل
      if (msgData.Author) {
        if (msgData.Author.__type === "Object" && msgData.Author.className === "_User") {
          result.Author = {
            objectId: msgData.Author.objectId,
            name: msgData.Author.name,
            username: msgData.Author.username,
            email: msgData.Author.email,
            role: msgData.Author.role,
            avatar: msgData.Author.avatar
          };
        } else if (msgData.Author.__type === "Pointer" && msgData.Author.className === "_User") {
          result.Author = {
            objectId: msgData.Author.objectId,
            __type: "Pointer",
            className: "_User"
          };
        }
      }
      
      // معالجة بيانات المستقبل
      if (msgData.Receiver) {
        if (msgData.Receiver.__type === "Object" && msgData.Receiver.className === "_User") {
          result.Receiver = {
            objectId: msgData.Receiver.objectId,
            name: msgData.Receiver.name,
            username: msgData.Receiver.username,
            email: msgData.Receiver.email,
            role: msgData.Receiver.role,
            avatar: msgData.Receiver.avatar
          };
        } else if (msgData.Receiver.__type === "Pointer" && msgData.Receiver.className === "_User") {
          result.Receiver = {
            objectId: msgData.Receiver.objectId,
            __type: "Pointer",
            className: "_User"
          };
        }
      }
      
      // معالجة الصورة
      if (msgData.pictureMessage && msgData.pictureMessage.__type === "File") {
        result.pictureMessage = {
          __type: "File",
          name: msgData.pictureMessage.name,
          url: msgData.pictureMessage.url || msgData.pictureMessage._url
        };
      }
      
      return result;
    });
  } catch (error) {
    console.error("[Parse] Get all messages error:", error);
    throw error;
  }
}
export async function getAllGifts(): Promise<any[]> {
  try {
    console.log("[Parse] Getting all gifts...");
    
    const query = new Parse.Query("Gifts");
    
    // استبعاد أنواع معينة إذا أردت
    // const excludedCategories = ["avatar_frame", "party_theme", "entrance_effect", "promotional_image"];
    // query.notContainedIn("categories", excludedCategories);
    
    // تحديد ترتيب العرض
    query.descending("createdAt");
    
    // تحديد الحد الأقصى
    query.limit(1000);
    
    console.log("[Parse] Executing gifts query...");
    const gifts = await query.find({ useMasterKey: true });
    
    console.log(`[Parse] Found ${gifts.length} gifts`);
    
    const processedGifts = gifts.map((gift: any) => {
      const jsonData = gift.toJSON();
      const giftId = gift.id;
      
      console.log(`[Parse] Processing gift: ${giftId}`, { 
        name: jsonData.name,
        hasFile: !!jsonData.file,
        hasPreview: !!jsonData.preview
      });
      
      // إصلاح هيكل الملفات
      const fixFileObject = (fileObj: any, type: string) => {
        if (!fileObj) return null;
        
        // إذا كان الملف موجوداً ككائن Parse File
        if (fileObj.__type === "File") {
          return {
            __type: "File",
            name: fileObj.name || `gift_${type}.${type === 'file' ? 'svga' : 'png'}`,
            url: fileObj.url || fileObj._url
          };
        }
        
        // إذا كان الملف موجوداً كرابط مباشر
        if (fileObj.url && !fileObj.__type) {
          return {
            __type: "File",
            name: fileObj.name || `gift_${type}.${type === 'file' ? 'svga' : 'png'}`,
            url: fileObj.url
          };
        }
        
        // إذا كان الملف موجوداً في بنية Parse القديمة
        if (fileObj._url) {
          return {
            __type: "File",
            name: fileObj._name || `gift_${type}.${type === 'file' ? 'svga' : 'png'}`,
            url: fileObj._url
          };
        }
        
        return null;
      };
      
      const fixedFile = fixFileObject(jsonData.file, 'file');
      const fixedPreview = fixFileObject(jsonData.preview, 'preview');
      
      // إصلاح الروابط إذا لزم الأمر
      const fixUrl = (url: string | undefined): string => {
        if (!url) return '';
        
        // إصلاح الروابط النسبية
        if (url.startsWith('/files/') && !url.includes('parse-server-example-o1ht.onrender.com')) {
          return `https://parse-server-example-o1ht.onrender.com/parse${url}`;
        }
        
        // إصلاح الروابط المكسورة
        if (url.includes('/files/myAppId/') && !url.includes('/parse/files/myAppId/')) {
          return url.replace('/files/myAppId/', '/parse/files/myAppId/');
        }
        
        return url;
      };
      
      const result = {
        id: giftId,
        name: jsonData.name || "Unnamed Gift",
        categories: jsonData.categories || "uncategorized",
        coins: jsonData.coins || 0,
        file: fixedFile ? {
          ...fixedFile,
          url: fixUrl(fixedFile.url)
        } : null,
        preview: fixedPreview ? {
          ...fixedPreview,
          url: fixUrl(fixedPreview.url)
        } : null,
        fileSize: jsonData.fileSize,
        fileType: jsonData.fileType,
        previewType: jsonData.previewType,
        isAnimated: jsonData.isAnimated || false,
        isSVGA: jsonData.isSVGA || false,
        period: jsonData.period || 0,
        createdAt: jsonData.createdAt,
        updatedAt: jsonData.updatedAt
      };
      
      return result;
    });
    
    console.log(`[Parse] Successfully processed ${processedGifts.length} gifts`);
    return processedGifts;
    
  } catch (error) {
    console.error("[Parse] Get all gifts error:", error);
    
    // إرجاع بيانات تجريبية في حالة الخطأ (للتنمية فقط)
    if (process.env.NODE_ENV === 'development') {
      console.log("[Parse] Returning sample data for development");
      return [
        {
          id: 'gift_1',
          name: 'Sample Heart Gift',
          categories: 'love',
          coins: 100,
          file: {
            __type: "File",
            name: "heart.svga",
            url: "https://example.com/heart.svga"
          },
          preview: {
            __type: "File",
            name: "heart_preview.png",
            url: "https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=Heart"
          },
          fileSize: 256,
          fileType: "application/svga",
          previewType: "image/png",
          isAnimated: true,
          isSVGA: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'gift_2',
          name: 'Star Gift',
          categories: 'vip',
          coins: 500,
          file: {
            __type: "File",
            name: "star.gif",
            url: "https://example.com/star.gif"
          },
          preview: {
            __type: "File",
            name: "star_preview.png",
            url: "https://via.placeholder.com/150x150/FFD93D/000000?text=Star"
          },
          fileSize: 512,
          fileType: "image/gif",
          previewType: "image/png",
          isAnimated: true,
          isSVGA: false,
          createdAt: new Date(Date.now() - 86400000), // يوم مضى
          updatedAt: new Date()
        }
      ];
    }
    
    throw error;
  }
}

/**
 * Delete gift by ID
 */
export async function deleteGift(giftId: string): Promise<void> {
  try {
    console.log(`[Parse] Deleting gift: ${giftId}`);
    
    const query = new Parse.Query("Gifts");
    const gift = await query.get(giftId, { useMasterKey: true });
    
    // الحصول على معلومات الملفات قبل الحذف
    const fileData = gift.get("file");
    const previewData = gift.get("preview");
    
    console.log(`[Parse] Deleting gift object...`);
    await gift.destroy({ useMasterKey: true });
    
    console.log(`[Parse] Gift deleted successfully`);
    
    // محاولة حذف الملفات من التخزين (اختياري)
    try {
      if (fileData && fileData.destroy) {
        await fileData.destroy({ useMasterKey: true });
        console.log(`[Parse] Main file deleted`);
      }
      if (previewData && previewData.destroy) {
        await previewData.destroy({ useMasterKey: true });
        console.log(`[Parse] Preview file deleted`);
      }
    } catch (fileError) {
      console.warn(`[Parse] Could not delete files:`, fileError);
      // لا نرمي خطأ لأن الحذف الأساسي تم بنجاح
    }
    
  } catch (error) {
    console.error("[Parse] Delete gift error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل حذف الهدية: ${errorMessage}`);
  }
}

/**
 * Update gift
 */
export async function updateGift(
  giftId: string,
  data: Record<string, any>
): Promise<any> {
  try {
    console.log(`[Parse] Updating gift: ${giftId}`, data);
    
    const query = new Parse.Query("Gifts");
    const gift = await query.get(giftId, { useMasterKey: true });

    Object.keys(data).forEach((key) => {
      if (key !== 'id') {
        gift.set(key, data[key]);
      }
    });

    const updatedGift = await gift.save(null, { useMasterKey: true });
    
    console.log(`[Parse] Gift updated successfully`);
    
    return {
      id: updatedGift.id,
      name: updatedGift.get("name"),
      categories: updatedGift.get("categories"),
      coins: updatedGift.get("coins"),
      createdAt: updatedGift.createdAt,
      updatedAt: updatedGift.updatedAt
    };
  } catch (error) {
    console.error("[Parse] Update gift error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`فشل تحديث الهدية: ${errorMessage}`);
  }
}