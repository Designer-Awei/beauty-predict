import styles from "@/styles/index.module.css";
import { useState } from "react";

const referenceBtns = [
  "鼻子", "眼睛", "嘴巴", "头发",
  "背景", "脸颊", "颈部", "衣服"
];

const referenceImages = [
  { src: "/user_public/1-彭于晏.jpg", label: "参考1" },
  { src: "/user_public/2-蔡徐坤.jpg", label: "参考2" },
  { src: "/user_public/3-尊龙.jpg", label: "参考3" }
];

export default function Home() {
  const [selectedRef, setSelectedRef] = useState(referenceImages[0].src);
  const [customRef, setCustomRef] = useState<string | null>(null);
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);

  // 处理自定义图片选择
  const handleCustomRef = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomRef(url);
      setSelectedRef(url);
    }
  };

  return (
    <div className={styles.container}>
      {/* 左侧面板 */}
      <div className={styles.leftPanel}>
        {/* 底图上传区域 */}
        <div className={styles.uploadArea}>
          <div className={styles.dashedBox}>
            底图上传区域
          </div>
        </div>
        {/* 参考上传区域 */}
        <div className={styles.referenceArea}>
          {/* 左侧参考模板列表 */}
          <div className={styles.referenceList}>
            {referenceImages.map((img, idx) => (
              <div
                key={img.src}
                style={{ border: selectedRef === img.src ? '2px solid #1976d2' : '2px solid transparent', borderRadius: 6, cursor: 'pointer', overflow: 'hidden', background: '#eee' }}
                onClick={() => { setSelectedRef(img.src); setCustomRef(null); }}
              >
                <img src={img.src} alt={img.label} style={{ width: '100%', height: 60, objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          {/* 分割线 */}
          <div className={styles.referenceDivider}></div>
          {/* 右侧参考预览及路径选择 */}
          <div className={styles.referencePreview}>
            <div className={styles.referenceSelector}>
              <input
                type="file"
                accept="image/*"
                id="customRefInput"
                style={{ display: 'none' }}
                onChange={handleCustomRef}
              />
              <input
                type="text"
                value={customRef ? "自定义图片" : "从本地上传参考图"}
                readOnly
                style={{ width: 120, fontSize: 12, padding: 2, border: '1px solid #ccc', borderRadius: 4 }}
              />
              <label htmlFor="customRefInput" style={{ cursor: 'pointer', marginLeft: 4 }} title="上传图片">
                <span style={{ fontSize: 18, color: '#1976d2' }}>↑</span>
              </label>
            </div>
            <div className={styles.referenceImageBox}>
              {selectedRef ? (
                <img src={selectedRef} alt="参考预览" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#888' }}>参考预览区域</span>
              )}
            </div>
          </div>
        </div>
        {/* 选择参考区域 */}
        <div className={styles.selectArea}>
          <div className={styles.selectBtns}>
            {referenceBtns.map((btn, idx) => (
              <button
                key={btn + idx}
                className={styles.selectBtn + (selectedBtn === idx ? ' ' + styles.selected : '')}
                onClick={() => setSelectedBtn(idx)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* 右侧面板 */}
      <div className={styles.rightPanel}>
        {/* 工具栏 */}
        <div className={styles.canvasHeader}>
          <div className={styles.tools}>
            <button title="画笔"><span style={{ fontSize: 20 }}>✏️</span></button>
            <button title="橡皮擦"><span style={{ fontSize: 20 }}>🧽</span></button>
            <span style={{ marginLeft: 8 }}>大小</span>
            <input type="number" min={1} max={20} defaultValue={4} style={{ width: 48, margin: '0 8px' }} />
            <span>颜色</span>
            <input type="color" defaultValue="#FFFFFF" style={{ marginLeft: 8 }} />
          </div>
          <button title="导出" style={{ fontSize: 18, border: '1px solid #ccc', borderRadius: 6, padding: '4px 12px', background: '#fff', cursor: 'pointer' }}>导出 ⬇️</button>
        </div>
        {/* 画布与结果区 */}
        <div className={styles.canvasArea}>
          <span style={{ color: '#666', fontSize: 24 }}>画布与结果呈现区</span>
        </div>
        {/* 操作按钮区 */}
        <div className={styles.canvasFooter}>
          <button className={styles.actionBtn}>实时拍摄</button>
          <button className={styles.actionBtn}>效果生成</button>
          <button className={styles.actionBtn}>作为底图</button>
        </div>
      </div>
    </div>
  );
}
