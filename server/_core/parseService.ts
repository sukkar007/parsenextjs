// @ts-ignore - parse/node doesn't have type definitions
import Parse from "parse/node";
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
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Register a new user with Parse
 */
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

    const savedUser = await user.save();

    return {
      id: savedUser.id,
      username: savedUser.get("username"),
      email: savedUser.get("email"),
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  } catch (error) {
    console.error("[Parse] Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to register user: ${errorMessage}`);
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

    return {
      id: user.id,
      username: user.get("username"),
      email: user.get("email"),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("[Parse] Login error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to login: ${errorMessage}`);
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

    return {
      id: user.id,
      username: user.get("username"),
      email: user.get("email"),
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
    throw new Error(`Failed to logout: ${errorMessage}`);
  }
}

/**
 * Query all users (requires master key)
 */
export async function getAllUsers(): Promise<ParseUser[]> {
  try {
    const query = new Parse.Query(Parse.User);
    const users = await query.find({ useMasterKey: true });

    return users.map((user: any) => ({
      id: user.id,
      username: user.get("username"),
      email: user.get("email"),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  } catch (error) {
    console.error("[Parse] Get all users error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch users: ${errorMessage}`);
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
    throw new Error(`Failed to delete user: ${errorMessage}`);
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

    return {
      id: updatedUser.id,
      username: updatedUser.get("username"),
      email: updatedUser.get("email"),
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    console.error("[Parse] Update user error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update user: ${errorMessage}`);
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
    const results = await query.find();

    return results.map((obj: any) => ({
      id: obj.id,
      ...obj.toJSON(),
    }));
  } catch (error) {
    console.error(`[Parse] Query class ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to query ${className}: ${errorMessage}`);
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

    const savedObj = await obj.save();

    return {
      id: savedObj.id,
      ...savedObj.toJSON(),
    };
  } catch (error) {
    console.error(`[Parse] Create object in ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create object: ${errorMessage}`);
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
    const obj = await query.get(objectId);

    Object.keys(data).forEach((key) => {
      obj.set(key, data[key]);
    });

    const updatedObj = await obj.save();

    return {
      id: updatedObj.id,
      ...updatedObj.toJSON(),
    };
  } catch (error) {
    console.error(`[Parse] Update object in ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update object: ${errorMessage}`);
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
    const obj = await query.get(objectId);
    await obj.destroy();
  } catch (error) {
    console.error(`[Parse] Delete object in ${className} error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete object: ${errorMessage}`);
  }
}
