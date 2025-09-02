import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import * as dotenv from 'dotenv';

// .env ファイルを読み込む
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(express.json()); // JSON形式のリクエストボディを解析する
app.use(cors());         // CORSを許可する

/**
 * GET /scores
 * データベースからスコアの上位5件を取得する。
 */
app.get("/scores", async (req: Request, res: Response): Promise<void> => {
    try {
        const scores = await prisma.score.findMany({
            orderBy: {
                score: 'desc' // スコアを降順で並び替え
            },
            take: 5, // 上位5件を取得
        });
        res.status(200).json(scores);
    } catch (error) {
        console.error("GET /scores Error:", error);
        res.status(500).json({ message: "Failed to retrieve scores." });
    }
});

/**
 * POST /scores
 * 新しいスコアをデータベースに保存する。
 */
app.post("/scores", async (req: Request, res: Response): Promise<void> => {
    const { score } = req.body;

    // 入力値の検証: scoreが数値でなければエラー
    if (typeof score !== 'number' || !isFinite(score)) {
        res.status(400).json({ message: "Invalid input: 'score' must be a number." });
        return;
    }

    try {
        const result = await prisma.score.create({
            data: { 
                score: Math.floor(score) // 整数に丸める
            },
        });
        res.status(201).json(result);
    } catch (error) {
        console.error("POST /scores Error:", error);
        res.status(500).json({ message: "Failed to save the score." });
    }
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


