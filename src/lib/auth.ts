import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "./db";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secure-secret-key-here";

export interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
}

export interface AuthSession {
  user: User;
  token: string;
}

// Get current authenticated user from cookies
export async function getAuth(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const user = await getUserFromToken(token);
    if (!user) return null;

    return { user, token };
  } catch {
    return null;
  }
}

// Sign in function
export async function signIn(
  email: string,
  password: string
): Promise<AuthSession | null> {
  try {
    const userRecord = await db.user.findUnique({
      where: { email: email.trim() },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        password: true,
      },
    });

    if (!userRecord) return null;

    const isValidPassword = await bcrypt.compare(
      password.trim(),
      userRecord.password
    );
    if (!isValidPassword) return null;

    const token = jwt.sign(
      { userId: userRecord.id, email: userRecord.email },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const user: User = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      createdAt: userRecord.createdAt,
    };

    return { user, token };
  } catch (error) {
    console.error("Sign in error:", error);
    return null;
  }
}

// Verify JWT token
export function verifyToken(
  token: string
): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

// Get user from token
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return user;
  } catch {
    return null;
  }
}

// Change password
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) return false;

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) return false;

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return true;
  } catch (error) {
    console.error("Password change error:", error);
    return false;
  }
}
