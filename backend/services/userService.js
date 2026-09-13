import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "cs618-dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function issueToken(user) {
  return jwt.sign({ sub: String(user._id) }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function toPublicUser(user) {
  return {
    _id: String(user._id),
    username: user.username,
    email: user.email,
  };
}

export async function registerUser({ username, email, password }) {
  if (!username || !username.trim()) throw new Error("Username is required");
  if (!email || !email.trim()) throw new Error("Email is required");
  if (!password || password.length < 6)
    throw new Error("Password must be at least 6 characters");

  const existing = await User.findOne({
    $or: [{ username }, { email: String(email).toLowerCase() }],
  });
  if (existing) {
    const field =
      existing.email.toLowerCase() === String(email).toLowerCase()
        ? "email"
        : "username";
    throw Object.assign(new Error(`${field} already registered`), {
      statusCode: 409,
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash });
  return { user: toPublicUser(user), token: issueToken(user) };
}

export async function loginUser({ identifier, password }) {
  if (!identifier || !password) throw new Error("Identifier and password are required");
  const user = await User.findOne({
    $or: [{ username: identifier }, { email: String(identifier).toLowerCase() }],
  });
  if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  return { user: toPublicUser(user), token: issueToken(user) };
}

export async function getUserById(id) {
  return User.findById(id).select("-passwordHash");
}
