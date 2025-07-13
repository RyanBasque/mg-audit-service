import jwt from "jsonwebtoken";

export class JwtService {
  private static readonly SECRET = process.env.JWT_SECRET || "fallback-secret";

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  static extractUserFromToken(authHeader?: string): { userId?: string } {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {};
    }

    try {
      const token = authHeader.substring(7);
      const decoded = this.verifyToken(token);
      return { userId: decoded.userId };
    } catch (error) {
      return {};
    }
  }
}
