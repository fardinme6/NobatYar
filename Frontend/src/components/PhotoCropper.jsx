import { useEffect, useRef, useState } from "react";
import { Check, X, ZoomIn } from "lucide-react";

export default function PhotoCropper({ file, t, onClose, onSave }) {
  const [url, setUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const drag = useRef(null);
  const box = useRef(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  const startDrag = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };
  const moveDrag = (e) => {
    if (!drag.current) return;
    const rect = box.current.getBoundingClientRect();
    const baseScale = Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const w = image.naturalWidth * baseScale * zoom;
    const h = image.naturalHeight * baseScale * zoom;
    const maxX = Math.max(0, (w - rect.width) / 2);
    const maxY = Math.max(0, (h - rect.height) / 2);
    setPosition({ x: Math.max(-maxX, Math.min(maxX, e.clientX - drag.current.x)), y: Math.max(-maxY, Math.min(maxY, e.clientY - drag.current.y)) });
  };
  const save = async () => {
    if (!image) return;
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext("2d");
      const baseScale = Math.max(512 / image.naturalWidth, 512 / image.naturalHeight);
      const w = image.naturalWidth * baseScale * zoom;
      const h = image.naturalHeight * baseScale * zoom;
      const factor = 512 / box.current.getBoundingClientRect().width;
      ctx.drawImage(image, (512-w)/2 + position.x*factor, (512-h)/2 + position.y*factor, w, h);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));
      if (!blob) throw new Error("Image could not be processed");
      await onSave(blob);
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t.cropTitle}>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3"><h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.cropTitle}</h2><button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-300 cursor-pointer"><X/></button></div>
        <p className="text-sm text-gray-500 dark:text-gray-300 mb-5">{t.cropHelp}</p>
        <div ref={box} className="relative w-64 h-64 mx-auto overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-teal-500 cursor-grab active:cursor-grabbing touch-none select-none" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
          {url && <img src={url} onLoad={(e)=>setImage(e.currentTarget)} draggable={false} alt="Crop preview" className="absolute left-1/2 top-1/2 max-w-none pointer-events-none" style={image ? { width: `${image.naturalWidth*Math.max(256/image.naturalWidth,256/image.naturalHeight)*zoom}px`, height: `${image.naturalHeight*Math.max(256/image.naturalWidth,256/image.naturalHeight)*zoom}px`, transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))` } : { width:"100%", height:"100%", objectFit:"cover" }}/>}
        </div>
        <div className="flex items-center gap-3 mt-7"><ZoomIn size={20} className="text-teal-600"/><input aria-label={t.cropZoom} type="range" min="1" max="3" step="0.05" value={zoom} onChange={(e)=>{setZoom(Number(e.target.value));setPosition({x:0,y:0});}} className="w-full accent-teal-600"/><span className="text-sm dark:text-white">{zoom.toFixed(1)}×</span></div>
        <div className="flex gap-3 mt-7"><button type="button" onClick={onClose} className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded-xl py-3 cursor-pointer">{t.profileCancel}</button><button type="button" onClick={save} disabled={!image||saving} className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white rounded-xl py-3 cursor-pointer disabled:opacity-60"><Check size={18}/>{t.cropSave}</button></div>
      </div>
    </div>
  );
}
