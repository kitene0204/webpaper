import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Printer, 
  Camera, 
  AlertCircle 
} from 'lucide-react';
import { Student, RollingTheme, RollingSettings } from '../types';

interface ImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  currentTheme: RollingTheme;
  settings: RollingSettings;
}

export const ImageExportModal: React.FC<ImageExportModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  currentTheme,
  settings,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentName = currentStudent?.name || '친구';
  const defaultFilename = `${settings.schoolClass || '우리반'}_${studentName}_롤링페이퍼.png`;
  const [filename, setFilename] = useState(defaultFilename);

  useEffect(() => {
    if (isOpen) {
      setFilename(`${settings.schoolClass || '우리반'}_${studentName}_롤링페이퍼.png`);
      generateImage();
    } else {
      setDataUrl(null);
      setError(null);
    }
  }, [isOpen, currentStudent]);

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    try {
      const element = document.getElementById('rolling-paper-capture-target');
      if (!element) {
        throw new Error('롤링페이퍼 보드 요소를 찾을 수 없습니다.');
      }

      // Small delay to allow fonts and icons to settle
      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(element, {
        scale: 2, // 2x high resolution for crisp print and text
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const url = canvas.toDataURL('image/png');
      setDataUrl(url);
    } catch (err: any) {
      console.error('Image capture error', err);
      setError(err.message || '이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyToClipboard = async () => {
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('클립보드 복사를 지원하지 않는 브라우저입니다. 다운로드 버튼을 이용해주세요.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#DE7272] via-[#FFCA88] to-[#FFF6A9] text-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#DE7272] flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-jua">
                롤링페이퍼 이미지 다운로드
              </h2>
              <p className="text-xs text-slate-800/80 font-medium">
                {studentName}의 롤링페이퍼가 고화질 PNG 이미지로 완성되었습니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {loading && (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-800 font-jua">
                롤링페이퍼를 고화질 이미지로 변환 중입니다...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                폰트와 스티커를 정성껏 렌더링하고 있어요!
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && dataUrl && (
            <div className="space-y-4">
              {/* File name input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  저장할 파일명
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-mono"
                />
              </div>

              {/* Image Preview Box */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-inner max-h-[380px] overflow-y-auto p-2">
                <img
                  src={dataUrl}
                  alt="롤링페이퍼 완성 이미지"
                  className="w-full h-auto rounded-xl shadow-xs"
                />
              </div>

              {/* Helpful tips */}
              <div className="p-3 bg-[#FFFDE8] rounded-xl border border-[#FFCA88] text-[#6d4411] text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#DE7272] shrink-0 mt-0.5" />
                <div>
                  <strong>활용 팁:</strong> 이미지로 저장한 뒤 학교 학급 밴드, 카카오톡, 또는 A4 크기로 인쇄하여 예쁜 액자에 담아 선물하면 평생 잊지 못할 선물이 됩니다!
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
          >
            취소
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || !dataUrl}
              onClick={handleCopyToClipboard}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨!' : '클립보드 복사'}</span>
            </button>

            <button
              type="button"
              disabled={loading || !dataUrl}
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#c95d5d] hover:to-[#f0b56e] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FFF6A9]" />
              <span>PNG 파일 다운로드</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
