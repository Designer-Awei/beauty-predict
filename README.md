# 美容效果预测系统网页应用

## 项目简介
本项目是一个基于 Next.js 的美容效果预测系统网页应用，旨在为用户提供便捷的美容辅助与效果预测体验。用户可上传面部图片，标记美容辅助线，选择美容模板，并通过深度学习模型获得美容预测结果。

## 主要功能
### 用户界面
- **主页**：应用简介、使用指南及入口按钮
- **图片上传**：支持 JPG / PNG / BMP 等多种图片格式上传
- **辅助线绘制**：提供画笔工具用于标记面部美容辅助线
- **模板选择**：展示多种美容模板供用户选择
- **结果展示**：显示原始图、标记图及美容预测图，支持下载

### 后台处理
- **面部特征检测**：使用 YOLO 配合 rCNN 对上传图片进行面部特征定位
- **辅助线处理**：将用户手绘的辅助线转换为结构化数据
- **美容效果生成**：调用 GAN 模型根据面部特征和辅助线生成美容预测图像

## 前后端目录结构（单页面应用SPA模式）

```
/pages
    |-- index.tsx           # 单页应用入口（包含主页、上传、绘制、模板选择、结果展示等所有UI）
    |-- _app.tsx
    |-- _document.tsx
    |-- api/
        |-- detect/         # 面部特征检测API（YOLO + rCNN，后续接入）
        |-- style-transfer/ # 美容效果生成API（StyleGAN，后续接入）
        |-- lines/          # 辅助线数据处理API
/components
    |-- UploadForm.tsx      # 图片上传组件
    |-- DrawHelper.tsx      # 辅助线绘制组件
    |-- TemplateList.tsx    # 模板选择组件
    |-- ResultViewer.tsx    # 结果展示组件
    |-- GuideModal.tsx      # 使用指南弹窗组件
    |-- ...                 # 其他可复用组件
/public
    |-- images/             # 用户上传图片、生成结果等静态资源
    |-- icons/              # 图标资源
    |-- ...                 # 其他静态资源
/styles
    |-- globals.css         # 全局样式
    |-- index.module.css    # 单页应用主样式
    |-- ...                 # 其他样式
/utils
    |-- imageUtils.ts       # 图片处理相关工具函数
    |-- apiUtils.ts         # API请求封装
    |-- ...                 # 其他工具函数
/types
    |-- index.d.ts          # 全局类型定义
    |-- api.d.ts            # API相关类型
    |-- ...                 # 其他类型定义
```

- 所有前端页面内容集中在 `pages/index.tsx`，通过组件和状态管理实现多视图切换，提升SPA体验。
- 后端API结构不变，便于后续模型集成。
- 组件、工具函数、类型定义等建议独立目录，便于维护和复用。

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

## 项目推进计划
1. 搭建基础前端页面结构与交互逻辑
2. 实现图片上传与辅助线绘制功能
3. 设计美容模板选择与结果展示界面
4. 完善后端API目录结构，预留模型接口
5. 集成并调试 YOLO + rCNN 面部特征检测模型
6. 集成并调试 StyleGAN 美容效果生成模型
7. 前后端联调，完善用户体验
8. 项目测试与优化，准备上线

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

## 技术栈说明

### 前端
- **Next.js**：基于React的服务端渲染与静态网站生成框架
- **React**：现代化组件式前端开发框架
- **TypeScript**：类型安全的JavaScript超集
- **HTML5 & CSS3**：页面结构与样式基础
- **CSS Modules**：局部作用域CSS，提升样式可维护性
- **shadcn/ui**：现代化UI组件库（部分交互与风格）
- **lucide-react**：现代化图标库

### 后端
- **Node.js**：JavaScript运行环境
- **Next.js API Routes**：后端接口实现（如图片列表、模型调用等）
- **fs/path**：Node内置文件系统与路径模块（用于API读取本地图片）

---

## 效果生成功能方案

### 功能流程
1. **参数准备**
   - 用户在前端选择底图、参考图、参考区域（如眉毛、嘴巴等）。
   - 前端根据用户选择的参考区域，自动构造提示词（Prompt），如："将参考图的【眉毛、嘴巴】特征迁移至底图，并保持底图其他区域不变"。
2. **调用大模型API**
   - 将底图、参考图、参考区域（及构造的提示词）作为参数，调用大模型的风格迁移API。
   - 当前API方案参考OpenAI的API文档，后续如有变动再做调整。
3. **结果渲染**
   - 接收大模型返回的生成图片，将其渲染至前端画布区域，作为最终美容效果输出。
   - 用户可对结果进行下载、保存或进一步操作。

### 技术要点
- 前端需支持图片上传、区域选择、动态提示词生成。
- 后端API需支持图片和参数的多模态输入，并与大模型API对接。
- 结果图片需无缝渲染到前端画布，保证用户体验。

---
