# 美容效果预测系统网页应用

## 项目简介
本项目是一个基于 Next.js 的美容效果预测系统网页应用，旨在为用户提供便捷的美容辅助与效果预测体验。用户可上传面部图片，选择参考图片和参考区域，通过302.AI的图像风格迁移技术获得美容预测结果。

## 主要功能
### 用户界面
- **图片上传**：支持 JPG / PNG / BMP 等多种图片格式上传，支持实时拍摄
- **参考图选择**：提供多种美容模板供用户选择，也可上传自定义参考图
- **参考区域选择**：用户可选择需要迁移的面部特征区域（如眼睛、嘴巴、鼻子等）
- **效果生成**：将参考图的特定区域特征迁移到底图，生成美容预测效果
- **结果展示**：显示生成的美容效果图，支持下载和作为新底图使用

### 技术特点
- **前端直接调用API**：直接从前端调用302.AI API，避免Vercel的函数超时限制
- **跨域图片处理**：内置图片代理机制，解决可能的跨域问题
- **响应式设计**：适配不同设备屏幕尺寸
- **实时反馈**：提供清晰的处理状态和错误提示

## 前后端目录结构（单页面应用SPA模式）

```
/pages
    |-- index.tsx           # 单页应用入口（包含所有UI和API调用逻辑）
    |-- _app.tsx
    |-- _document.tsx
    |-- api/
        |-- image_proxy.ts  # 图片代理API，解决跨域问题
        |-- user_public_list.ts # 获取参考图片列表API
/public
    |-- user_public/        # 预设参考图片
    |-- icons/              # 图标资源
    |-- ...                 # 其他静态资源
/styles
    |-- globals.css         # 全局样式
    |-- index.module.css    # 单页应用主样式
/next.config.js             # Next.js配置文件
```

## 使用说明
1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```
3. 访问 [http://localhost:3000](http://localhost:3000) 使用应用。

## 使用流程
1. 上传底图或使用实时拍摄功能获取底图
2. 选择参考图片（可使用预设模板或上传自定义图片）
3. 选择需要迁移的参考区域（如眼睛、嘴巴、鼻子等）
4. 点击"效果生成"按钮，等待AI处理
5. 查看生成结果，可选择下载或设为新底图

## Vercel部署说明

本项目已针对Vercel平台进行优化，可以直接部署到Vercel。

### 部署步骤

1. 将代码推送到GitHub仓库
2. 在Vercel平台创建新项目，选择导入GitHub仓库
3. 无需配置环境变量，API密钥已经硬编码在代码中

### 架构优化

项目采用前端直接调用302.AI API的架构，避开了Vercel的函数执行时间限制：

- **前端直接调用**：从浏览器端直接调用302.AI API，不经过Vercel的服务器端函数
- **图片代理API**：提供简单的图片代理功能，解决可能的跨域问题
- **无服务器依赖**：除图片代理外，核心功能不依赖于服务器处理

### 注意事项

- API密钥已直接硬编码在前端代码中，如需更换密钥请修改`pages/index.tsx`文件中的`API_KEY`常量
- 系统使用302.AI的API进行图像风格迁移处理，请确保API服务正常可用

## 技术栈说明

### 前端
- **Next.js**：基于React的服务端渲染与静态网站生成框架
- **React**：现代化组件式前端开发框架
- **TypeScript**：类型安全的JavaScript超集
- **HTML5 Canvas**：用于图像处理和展示
- **CSS Modules**：局部作用域CSS，提升样式可维护性
- **lucide-react**：现代化图标库
- **Fetch API**：直接调用外部API服务

### 后端
- **Next.js API Routes**：提供简单的图片代理功能
- **302.AI API**：提供核心的图像风格迁移功能

---
如有建议或问题，欢迎反馈！

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

## Vercel部署说明

本项目已针对Vercel平台进行优化，可以直接部署到Vercel。

### 部署步骤

1. 将代码推送到GitHub仓库
2. 在Vercel平台创建新项目，选择导入GitHub仓库
3. 无需配置环境变量，API密钥已经硬编码在代码中

### 架构优化

项目采用前端直接调用302.AI API的架构，避开了Vercel的函数执行时间限制：

- **前端直接调用**：从浏览器端直接调用302.AI API，不经过Vercel的服务器端函数
- **图片代理API**：提供简单的图片代理功能，解决可能的跨域问题
- **无服务器依赖**：除图片代理外，核心功能不依赖于服务器处理

### 注意事项

- API密钥已直接硬编码在前端代码中，如需更换密钥请修改`pages/index.tsx`文件中的`API_KEY`常量
- 系统使用302.AI的API进行图像风格迁移处理，请确保API服务正常可用

## 技术栈说明

### 前端
- **Next.js**：基于React的服务端渲染与静态网站生成框架
- **React**：现代化组件式前端开发框架
- **TypeScript**：类型安全的JavaScript超集
- **HTML5 Canvas**：用于图像处理和展示
- **CSS Modules**：局部作用域CSS，提升样式可维护性
- **lucide-react**：现代化图标库
- **Fetch API**：直接调用外部API服务

### 后端
- **Next.js API Routes**：提供简单的图片代理功能
- **302.AI API**：提供核心的图像风格迁移功能

---