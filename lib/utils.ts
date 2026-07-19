import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



const JWT_SECRET = process.env.JWT_SECRET!; // keep secret in env
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function comparePasswords(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function generateAccessToken(id: string) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30m" });
}

export function generateRefreshToken(id: string) {
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      // Handle specifically for expired tokens (e.g., trigger refresh flow)
      return { expired: true };
    }
    // Handle invalid signature or malformed tokens
    return { invalid: true };
  }
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
