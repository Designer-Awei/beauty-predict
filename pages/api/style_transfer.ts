import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import type { Fields, Files, File } from 'formidable';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * 处理风格迁移API，调用OpenAI /v1/images/edits，支持多图片和prompt
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export const config = {
  api: {
    bodyParser: false, // 关闭内置body解析，使用formidable处理multipart
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 用Promise封装form.parse，保证异步流程
  const parseForm = () =>
    new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      const form = new IncomingForm({ maxFileSize: 20 * 1024 * 1024 });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

  try {
    const { fields, files } = await parseForm();
    // 处理 prompt 字段，确保其为字符串类型
    let prompt: string | undefined;
    if (Array.isArray(fields.prompt)) {
      prompt = fields.prompt[0];
    } else if (typeof fields.prompt === 'string') {
      prompt = fields.prompt;
    }
    // 处理 images 字段，确保其为 File[] 类型且至少有一个文件
    let images: File[] = [];
    if (Array.isArray(files.image)) {
      images = files.image as File[];
    } else if (files.image) {
      images = [files.image as File];
    }
    if (!prompt || !images[0]) {
      res.status(400).json({ error: '参数缺失' });
      return;
    }
    // 构造formdata
    const formData = new (require('form-data'))();
    formData.append('model', 'gpt-image-1');
    (images as File[]).forEach((img) => {
      formData.append('image', fs.createReadStream(img.filepath), img.originalFilename);
    });
    formData.append('prompt', prompt);
    // 可选参数
    formData.append('quality', 'auto');
    formData.append('size', '1024x1024');
    formData.append('n', '1');
    // 如有mask，可加formData.append('mask', ...)
    // 打印formData所有字段，便于排查
    console.log('即将发送的formData参数:');
    formData._streams && formData._streams.forEach((s: any, i: any) => {
      if (typeof s === 'string') console.log(`  [${i}] ${s}`);
    });
    // 打印headers内容
    const headers = {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      ...formData.getHeaders(),
    };
    console.log('即将发送的headers:', headers);
    // 调用302.AI中转平台API
    const response = await fetch('https://api.302.ai/v1/images/edits?response_format=url', {
      method: 'POST',
      headers,
      body: formData as any,
    });

    let data;
    let rawText;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      rawText = await response.text();
      console.error('OpenAI raw response:', rawText);
    }

    if (data && data.data && data.data[0] && (data.data[0].url || data.data[0].b64_json)) {
      res.status(200).json({ image: data.data[0].url || data.data[0].b64_json });
    } else {
      console.error('OpenAI error:', data || rawText);
      res.status(500).json({ error: '生成失败', detail: data || rawText });
    }
  } catch (e) {
    console.error('API调用异常:', e);
    res.status(500).json({ error: '表单解析或API调用异常', detail: String(e) });
  }
} 