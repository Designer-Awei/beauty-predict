/**
 * 获取public/user_public目录下所有图片文件名的API
 * @param req
 * @param res
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dir = path.join(process.cwd(), 'public', 'user_public');
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|bmp|gif)$/i.test(f))
      .map(f => `/user_public/${f}`);
  } catch (e) {
    files = [];
  }
  res.status(200).json({ files });
} 