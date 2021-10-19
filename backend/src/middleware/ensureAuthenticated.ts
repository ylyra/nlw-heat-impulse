import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

type IPayload = {
  sub: string;
};

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({
      errorCode: "token.invalid",
    });
  }

  const [, token] = authToken.split(" ");

  try {
    const { sub } = verify(token, process.env.JWT_SECRET) as IPayload;

    req.user_id = sub;
    return next();
  } catch (err) {
    return res.status(404).json({ errorCode: "token.expired" });
  }
}
