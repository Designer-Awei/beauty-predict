import styles from "@/styles/index.module.css";
import { useState, useRef, useEffect } from "react";
import { Upload, Download, Pencil, Eraser, Trash2 } from "lucide-react";

const referenceBtns = [
  "鼻子", "眼睛", "嘴巴", "头发",
  "背景", "脸颊", "颈部", "衣服"
];

export default function Home() {
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [customRef, setCustomRef] = useState<string | null>(null);
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [mainImgScale, setMainImgScale] = useState(1);
  const [mainImgOffset, setMainImgOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [imgStartOffset, setImgStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mainUploadInputRef = useRef<HTMLInputElement>(null);
  const dashedBoxRef = useRef<HTMLDivElement>(null);
  const [referenceImages, setReferenceImages] = useState<{ src: string; label: string }[]>([]);

  useEffect(() => {
    fetch('/api/user_public_list')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.files)) {
          setReferenceImages(data.files.map((src: string, idx: number) => ({ src, label: `参考${idx + 1}` })));
        }
      });
  }, []);

  // 处理底图上传
  const handleMainUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setMainImage(url);
      setMainImgScale(1);
      setMainImgOffset({ x: 0, y: 0 });
    }
  };
  // 删除底图
  const handleDeleteMainImage = () => {
    setMainImage(null);
    setMainImgScale(1);
    setMainImgOffset({ x: 0, y: 0 });
    if (mainUploadInputRef.current) mainUploadInputRef.current.value = "";
  };

  // 缩放和拖动事件
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (mainImage) {
      e.preventDefault();
      let newScale = mainImgScale - e.deltaY * 0.0015;
      newScale = Math.max(0.2, Math.min(5, newScale));
      setMainImgScale(newScale);
    }
  };
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mainImage && e.button === 0 && e.nativeEvent.buttons === 1) {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setImgStartOffset({ ...mainImgOffset });
    }
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setMainImgOffset({ x: imgStartOffset.x + dx, y: imgStartOffset.y + dy });
    }
  };
  const handleMouseUp = () => {
    setDragging(false);
    setDragStart(null);
  };

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
          <div
            className={styles.dashedUploadBox}
            style={{ position: 'relative', overflow: 'hidden' }}
            ref={dashedBoxRef}
            onWheel={handleWheel}
            onMouseDown={handleDragStart}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {mainImage ? (
              <>
                <img
                  src={mainImage}
                  alt="底图"
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    transform: `scale(${mainImgScale}) translate(${mainImgOffset.x / mainImgScale}px, ${mainImgOffset.y / mainImgScale}px)`
                  }}
                  draggable={false}
                />
                <button
                  onClick={handleDeleteMainImage}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    background: 'rgba(255,255,255,0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                  }}
                  title="删除图片"
                >
                  <Trash2 size={18} color="#e53935" />
                </button>
              </>
            ) : (
              <label htmlFor="mainUploadInput" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <input
                  id="mainUploadInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleMainUpload}
                  ref={mainUploadInputRef}
                />
                <span className={styles.uploadLabelContent}>
                  <Upload size={22} />
                  底图上传区域
                </span>
              </label>
            )}
          </div>
        </div>
        {/* 参考上传区域 */}
        <div className={styles.referenceArea}>
          {/* 左侧参考模板列表 */}
          <div className={styles.referenceList}>
            {referenceImages.map((img, idx) => (
              <div className={styles.referenceThumbBox} key={img.src}>
                <div
                  style={{
                    border: selectedRef === img.src ? '2px solid #1976d2' : 'none',
                    borderRadius: 0,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: '#eee',
                    height: 80,
                    width: '100%',
                    boxSizing: 'border-box',
                    margin: 0
                  }}
                  onClick={() => { setSelectedRef(img.src); setCustomRef(null); }}
                >
                  <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            ))}
          </div>
          {/* 右侧参考预览及路径选择 */}
          <div className={styles.referencePreview}>
            <div style={{ width: 210, display: 'flex', alignItems: 'center', marginTop: 10 }}>
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
                style={{ width: 170, fontSize: 12, padding: 4, border: '1px solid #ccc', borderRadius: 0, height: 28, boxSizing: 'border-box' }}
              />
              <label htmlFor="customRefInput" style={{ cursor: 'pointer', width: 40, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 0, borderLeft: 'none', background: '#fafafa' }} title="上传图片">
                <Upload size={18} style={{ color: '#1976d2' }} />
              </label>
            </div>
            <div className={styles.referenceImageBox}>
              {selectedRef ? (
                <img src={selectedRef} alt="参考预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#888' }}>参考预览区域</span>
              )}
            </div>
          </div>
        </div>
        {/* 选择参考区域 */}
        <div className={styles.selectArea}>
          <div style={{ width: '90%', textAlign: 'left', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
            选择参考区域
          </div>
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
            <button className={styles.toolBtn} title="画笔">
              <Pencil size={22} color="#1976d2" />
            </button>
            <button className={styles.toolBtn} title="橡皮擦">
              <Eraser size={22} color="#1976d2" />
            </button>
            <span className={styles.sizeLabel}>大小</span>
            <input type="number" min={1} max={20} defaultValue={4} className={styles.sizeInput} />
            <span className={styles.sizeUnit}>px</span>
            <span className={styles.colorLabel}>颜色</span>
            <div className={styles.colorInputWrap}>
              <input type="text" defaultValue="#FFFFFF" className={styles.colorInput} />
              <input type="color" defaultValue="#FFFFFF" className={styles.colorPicker} />
            </div>
          </div>
          <button className={styles.exportBtn} title="导出">
            <Download size={20} color="#1976d2" /> 导出
          </button>
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
