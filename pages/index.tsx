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
  const [color, setColor] = useState("#000000");
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [canvasImgScale, setCanvasImgScale] = useState(1);
  const [canvasImgOffset, setCanvasImgOffset] = useState({ x: 0, y: 0 });
  const [canvasDragging, setCanvasDragging] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState<{ x: number; y: number } | null>(null);
  const [canvasImgStartOffset, setCanvasImgStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  // 工具栏状态
  const [tool, setTool] = useState<'pen' | 'eraser' | null>(null);
  // 画布属性
  const [penSize, setPenSize] = useState(4);
  const [penColor, setPenColor] = useState('rgb(0,0,0)');
  // 撤销栈
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // 缩放和拖动事件（wheel用原生事件监听，防止passive警告）
  useEffect(() => {
    const box = dashedBoxRef.current;
    if (!box) return;
    const wheelHandler = (e: WheelEvent) => {
      if (mainImage) {
        e.preventDefault();
        let newScale = mainImgScale - e.deltaY * 0.0015;
        newScale = Math.max(0.2, Math.min(5, newScale));
        setMainImgScale(newScale);
      }
    };
    box.addEventListener("wheel", wheelHandler, { passive: false });
    return () => {
      box.removeEventListener("wheel", wheelHandler);
    };
  }, [mainImage, mainImgScale]);
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

  // 颜色输入框同步色板，支持互操作
  const hexToRgb = (hex: string) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };
  const rgbToHex = (rgb: string) => {
    const arr = rgb.split(',').map(s => parseInt(s.trim(), 10));
    if (arr.length !== 3 || arr.some(isNaN)) return color;
    return (
      '#' +
      arr
        .map(x => {
          const v = Math.max(0, Math.min(255, x));
          return v.toString(16).padStart(2, '0');
        })
        .join('')
        .toUpperCase()
    );
  };
  const [colorInput, setColorInput] = useState(hexToRgb(color));
  // 互操作：色板变动时同步输入框
  useEffect(() => {
    setColorInput(hexToRgb(color));
  }, [color]);
  // 互操作：输入框变动时同步色板
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorInput(e.target.value);
    const hex = rgbToHex(e.target.value);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) setColor(hex);
  };

  // 载入画布
  const handleLoadToCanvas = () => {
    if (mainImage) {
      setCanvasImage(mainImage);
      setCanvasImgScale(1);
      setCanvasImgOffset({ x: 0, y: 0 });
    }
  };
  // 画布缩放
  useEffect(() => {
    const box = canvasBoxRef.current;
    if (!box) return;
    const wheelHandler = (e: WheelEvent) => {
      if (canvasImage) {
        e.preventDefault();
        let newScale = canvasImgScale - e.deltaY * 0.0015;
        newScale = Math.max(0.2, Math.min(5, newScale));
        setCanvasImgScale(newScale);
      }
    };
    box.addEventListener("wheel", wheelHandler, { passive: false });
    return () => {
      box.removeEventListener("wheel", wheelHandler);
    };
  }, [canvasImage, canvasImgScale]);
  // 画布拖动
  const handleCanvasDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (canvasImage && e.button === 0 && e.nativeEvent.buttons === 1) {
      setCanvasDragging(true);
      setCanvasDragStart({ x: e.clientX, y: e.clientY });
      setCanvasImgStartOffset({ ...canvasImgOffset });
    }
  };
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (canvasDragging && canvasDragStart) {
      const dx = e.clientX - canvasDragStart.x;
      const dy = e.clientY - canvasDragStart.y;
      setCanvasImgOffset({ x: canvasImgStartOffset.x + dx, y: canvasImgStartOffset.y + dy });
    }
  };
  const handleCanvasMouseUp = () => {
    setCanvasDragging(false);
    setCanvasDragStart(null);
  };

  // 清空画布
  const handleClearCanvas = () => {
    setCanvasImage(null);
    setCanvasImgScale(1);
    setCanvasImgOffset({ x: 0, y: 0 });
  };

  // 工具栏按钮选中逻辑
  const handleSelectTool = (t: 'pen' | 'eraser') => setTool(t);
  // 画笔属性同步
  useEffect(() => {
    setPenSize(Number((document.querySelector('.' + styles.sizeInput) as HTMLInputElement)?.value) || 4);
  }, [tool]);
  useEffect(() => {
    setPenColor(color ? `rgb(${hexToRgb(color)})` : 'rgb(0,0,0)');
  }, [color]);

  // 画布绘制逻辑
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let drawing = false;
    let lastX = 0, lastY = 0;
    let saved = false;
    // 鼠标事件
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // 画布中心点
      const cx = rect.left + 300;
      const cy = rect.top + 300;
      // 鼠标相对中心点的偏移
      const dx = e.clientX - cx - canvasImgOffset.x;
      const dy = e.clientY - cy - canvasImgOffset.y;
      // 反算到原始canvas坐标
      const x = 300 + dx / canvasImgScale;
      const y = 300 + dy / canvasImgScale;
      return { x, y };
    };
    const mousedown = (e: MouseEvent) => {
      if (!tool) return;
      drawing = true;
      const { x, y } = getPos(e);
      lastX = x; lastY = y;
      if (!saved) {
        setCanvasHistory(h => [...h, canvas.toDataURL()]);
        saved = true;
      }
    };
    const mousemove = (e: MouseEvent) => {
      if (!drawing || !tool) return;
      const { x, y } = getPos(e);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = penSize;
      if (tool === 'pen') {
        ctx.strokeStyle = penColor;
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.strokeStyle = 'rgba(0,0,0,1)'; // destination-out时颜色无影响
        ctx.globalCompositeOperation = 'destination-out';
      }
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x; lastY = y;
    };
    const mouseup = () => {
      drawing = false;
      saved = false;
      ctx.globalCompositeOperation = 'source-over';
    };
    canvas.addEventListener('mousedown', mousedown);
    canvas.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
    // 鼠标样式
    const setCursor = (e: MouseEvent) => {
      if (!tool) {
        canvas.style.cursor = '';
        return;
      }
      const size = penSize;
      const color = tool === 'pen' ? penColor : '#fff';
      const svg = encodeURIComponent(`<svg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'><circle cx='${size/2}' cy='${size/2}' r='${size/2-1}' fill='${color}' stroke='${tool==='pen'?'#333':'#aaa'}' stroke-width='1'/></svg>`);
      canvas.style.cursor = `url("data:image/svg+xml,${svg}") ${size/2} ${size/2}, crosshair`;
    };
    canvas.addEventListener('mousemove', setCursor);
    // Esc退出工具
    const escListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTool(null);
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        setCanvasHistory(h => {
          if (h.length === 0) return h;
          const prev = h[h.length - 1];
          const img = new window.Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = prev;
          return h.slice(0, -1);
        });
      }
    };
    window.addEventListener('keydown', escListener);
    return () => {
      canvas.removeEventListener('mousedown', mousedown);
      canvas.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
      canvas.removeEventListener('mousemove', setCursor);
      window.removeEventListener('keydown', escListener);
    };
  }, [tool, penSize, penColor, canvasImgScale, canvasImgOffset]);

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
            <button className={styles.toolBtn + (tool === 'pen' ? ' ' + styles.selected : '')} title="画笔" onClick={() => handleSelectTool('pen')}>
              <Pencil size={22} color="#1976d2" />
            </button>
            <button className={styles.toolBtn + (tool === 'eraser' ? ' ' + styles.selected : '')} title="橡皮擦" onClick={() => handleSelectTool('eraser')}>
              <Eraser size={22} color="#1976d2" />
            </button>
            <span className={styles.sizeLabel}>大小</span>
            <input type="number" min={1} max={20} defaultValue={4} className={styles.sizeInput} onChange={e => setPenSize(Number(e.target.value))} />
            <span className={styles.sizeUnit}>px</span>
            <span className={styles.colorLabel}>颜色</span>
            <div className={styles.colorInputWrap}>
              <input type="text" value={colorInput} onChange={handleColorInputChange} className={styles.colorInput} />
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className={styles.colorPicker} />
            </div>
          </div>
          <button className={styles.exportBtn} title="导出">
            <Download size={20} color="#1976d2" /> 导出
          </button>
        </div>
        {/* 画布与结果区 */}
        <div
          className={styles.canvasArea}
          ref={canvasBoxRef}
          style={{
            position: 'relative',
            background: '#e0e0e0',
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseDown={tool ? undefined : handleCanvasDragStart}
          onMouseMove={tool ? undefined : handleCanvasMouseMove}
          onMouseUp={tool ? undefined : handleCanvasMouseUp}
        >
          {/* 画布绘制层 */}
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 600,
              height: 600,
              zIndex: 2,
              pointerEvents: tool ? 'auto' : 'none',
              background: 'transparent',
              transform: `translate(-50%, -50%) scale(${canvasImgScale}) translate(${canvasImgOffset.x / canvasImgScale}px, ${canvasImgOffset.y / canvasImgScale}px)`
            }}
          />
          {canvasImage ? (
            <img
              src={canvasImage}
              alt="画布底图"
              style={{
                maxHeight: 600,
                maxWidth: 600,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 600,
                height: 600,
                transform: `translate(-50%, -50%) scale(${canvasImgScale}) translate(${canvasImgOffset.x / canvasImgScale}px, ${canvasImgOffset.y / canvasImgScale}px)`,
                zIndex: 1
              }}
              draggable={false}
            />
          ) : (
            <span style={{ color: '#666', fontSize: 24 }}>画布与结果呈现区</span>
          )}
        </div>
        {/* 操作按钮区 */}
        <div className={styles.canvasFooter}>
          <button className={styles.actionBtn} onClick={handleLoadToCanvas}>载入画布</button>
          <button className={styles.actionBtn} onClick={handleClearCanvas}>清空画布</button>
          <button className={styles.actionBtn}>实时拍摄</button>
          <button className={styles.actionBtn}>效果生成</button>
          <button className={styles.actionBtn}>作为底图</button>
        </div>
      </div>
    </div>
  );
}
