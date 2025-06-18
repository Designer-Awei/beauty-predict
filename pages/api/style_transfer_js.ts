import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import type { Fields, Files, File } from 'formidable';

// API配置
const API_BASE_URL = "https://api.302.ai/v1";
const DEFAULT_MODEL = "gpt-image-1";
const DEFAULT_QUALITY = "medium"; // 使用medium质量以节省开支
// 直接硬编码API密钥
const API_KEY = "sk-hsH4IwR4zUQHwsGCtQ0R7grXxnJsQ6czIBGwxkrcjqdIsETl";

export const config = {
  api: {
    bodyParser: false, // 关闭内置body解析，使用formidable处理multipart
  },
};

/**
 * 处理风格迁移API，直接调用302.AI API
 * 该API接收底图、参考图和提示词，然后调用302.AI API处理
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('开始处理请求...');
    
    // 解析表单数据
    const form = new IncomingForm({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });
    
    const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    
    console.log('请求解析完成，开始处理参数');
    
    // 处理 prompt 字段
    let prompt: string | undefined;
    if (Array.isArray(fields.prompt)) {
      prompt = fields.prompt[0];
    } else if (typeof fields.prompt === 'string') {
      prompt = fields.prompt;
    }
    
    // 处理 images 字段
    let images: File[] = [];
    if (Array.isArray(files.image)) {
      images = files.image as File[];
    } else if (files.image) {
      images = [files.image as File];
    }
    
    // 验证参数
    if (!prompt) {
      console.error('缺少prompt参数');
      res.status(400).json({ error: '缺少prompt参数' });
      return;
    }
    if (images.length < 2) {
      console.error('至少需要两张图片（底图和参考图）');
      res.status(400).json({ error: '至少需要两张图片（底图和参考图）' });
      return;
    }
    
    console.log(`收到 ${images.length} 张图片和prompt: "${prompt}"`);
    
    // 获取API密钥
    const apiKey = API_KEY;
    if (!apiKey) {
      console.error('API密钥无效');
      res.status(500).json({ error: '服务器API密钥配置错误' });
      return;
    }
    
    // 准备调用302.AI API
    const endpoint = "/images/edits";
    const apiUrl = `${API_BASE_URL}${endpoint}`;
    
    // 构造请求头
    const headers = {
      'Authorization': `Bearer ${apiKey}`
    };
    
    // 构造请求参数
    const requestData = new FormData();
    requestData.append('prompt', prompt);
    requestData.append('n', '1');
    requestData.append('size', '1024x1024');
    requestData.append('response_format', 'url');
    requestData.append('model', DEFAULT_MODEL);
    requestData.append('quality', DEFAULT_QUALITY);
    
    // 添加图片
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.filepath || !fs.existsSync(img.filepath)) {
        console.error(`图片 ${i+1} 文件路径无效: ${img.filepath}`);
        res.status(400).json({ error: `图片 ${i+1} 文件路径无效` });
        return;
      }
      
      const imageBuffer = fs.readFileSync(img.filepath);
      requestData.append('image', imageBuffer, {
        filename: `image_${i}.png`,
        contentType: 'image/png'
      });
      
      console.log(`添加图片 ${i+1}: ${img.originalFilename || `image_${i}.png`}`);
    }
    
    console.log('开始调用302.AI API...');
    
    // 设置重试逻辑
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0) {
          console.log(`第 ${retryCount} 次重试...`);
          // 等待一段时间再重试
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }
        
        // 发送请求
        const response = await axios.post(apiUrl, requestData, {
          headers: {
            ...headers,
            ...requestData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 0
        });
        
        console.log(`API响应状态: ${response.status}`);
        
        // 处理响应
        const data = response.data;
        if (data && data.data && Array.isArray(data.data)) {
          if (data.data.length > 0) {
            const item = data.data[0];
            if (item && item.url) {
              console.log(`生成的图片URL: ${item.url}`);
              res.status(200).json({ image: item.url });
              return;
            }
          }
        }
        
        console.error('API响应格式不符合预期');
        res.status(500).json({ error: 'API响应格式不符合预期', detail: data });
        return;
        
      } catch (error) {
        console.error(`API调用出错 (尝试 ${retryCount+1}/${maxRetries+1}):`, error);
        lastError = error;
        
        // 检查是否应该重试
        if (axios.isAxiosError(error) && error.response) {
          const statusCode = error.response.status;
          // 只对特定状态码重试
          if ([429, 500, 502, 503, 504].includes(statusCode) && retryCount < maxRetries) {
            retryCount++;
            continue;
          }
          
          // 返回API错误
          console.error(`API返回错误状态码: ${statusCode}`);
          res.status(statusCode).json({
            error: `API返回错误: ${statusCode}`,
            detail: error.response.data
          });
          return;
        }
        
        // 网络错误也可以重试
        if (retryCount < maxRetries) {
          retryCount++;
          continue;
        }
        
        // 达到最大重试次数，返回错误
        res.status(500).json({
          error: '调用API失败',
          detail: error instanceof Error ? error.message : String(error)
        });
        return;
      }
    }
    
  } catch (e) {
    console.error(`处理请求失败:`, e);
    res.status(500).json({ error: '处理请求失败', detail: e instanceof Error ? e.message : String(e) });
  }
} 