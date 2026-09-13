import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cs618-dev-secret";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(Object.assign(new Error("Authentication required"), { statusCode: 401 }));
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch {
    return next(Object.assign(new Error("Invalid or expired token"), { statusCode: 401 }));
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) {
    try {
      req.userId = jwt.verify(token, JWT_SECRET).sub;
    } catch {
      // treat as anonymous
    }
  }
  return next();
}
