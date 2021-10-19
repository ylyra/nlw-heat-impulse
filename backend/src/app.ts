import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";

import { router } from "./routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/github", async (req: Request, res: Response) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
  );
});

app.get("/signin/callback", async (req: Request, res: Response) => {
  const { code } = req.query;

  return res.json({
    code,
  });
});

app.use(router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({
      error: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

const serverHttp = http.createServer(app);
const io = new Server(serverHttp, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`user connected on socket ${socket.id}`);
});

export { serverHttp, io };
