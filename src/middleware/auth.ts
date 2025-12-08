import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(400).json({ message: "Please Signin First." });
      }

      const decodeToken = jwt.verify(
        token as string,
        config.jwt_secret as string
      ) as JwtPayload;

      if (roles.length && !roles.includes(decodeToken.role)) {
        res.status(403).json({ error: "You do not have permission!" });
      }

      req.user = decodeToken;

      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized Token!", success: false });
    }
  };
};

export default auth;
