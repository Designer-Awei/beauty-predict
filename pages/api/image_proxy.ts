import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * 图片代理API，用于解决跨域问题
 * 接收url参数，获取图片内容并返回
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid URL parameter' });
    return;
  }

  try {
    // 验证URL格式
    new URL(url);
    
    // 获取图片
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30秒超时
    });

    // 获取内容类型
    const contentType = response.headers['content-type'];
    
    // 设置缓存控制
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存24小时
    res.setHeader('Content-Type', contentType);
    
    // 返回图片数据
    res.status(200).send(response.data);
  } catch (error) {
    console.error('图片代理错误:', error);
    res.status(500).json({ error: '获取图片失败' });
  }
} 