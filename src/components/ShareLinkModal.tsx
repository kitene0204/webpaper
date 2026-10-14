import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Smartphone, 
  Link as LinkIcon, 
  AlertCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Student } from '../types';
import { GasService } from '../services/gasService';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
}) => {
  const [copiedType, setCopiedType] = useState<'student' | 'all' | null>(null);

  if (!isOpen) return null;

  const studentName = currentStudent?.name || '';
  const isConnected = GasService.isConnected();
  const gasUrl = GasService.getGasUrl();

  // Links
  const studentShareUrl = GasService.getShareUrl(studentName);
  const allShareUrl = GasService.getShareUrl();

  const handleCopy = async (text: string, type: 'student' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#DE7272]/15 via-[#FFCA88]/25 to-[#FFF6A9]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DE7272] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-title font-semibold">
                학생들에게 롤링페이퍼 링크 공유하기
              </h2>
              <p className="text-xs text-slate-500">
                아이들이 접속했을 때 더미데이터 대신 시트와 실시간 연동되게 합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Explanation Alert */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>구글 시트 연동 주소가 영구 등록되었습니다!</span>
            </div>
            <p className="text-emerald-800">
              선생님의 구글 시트 연동 주소가 고정 등록되어, 이제 아이들이 기본 주소나 공유 링크 중 어디로 접속해도 <strong>더미데이터(김민준) 대신 실제 구글 시트 데이터가 바로 열립니다.</strong>
            </p>
            <p className="font-bold text-emerald-950 pt-0.5">
              👇 아래의 **[{studentName || '학생'} 바로가기 링크]**를 복사해서 공유하면, 아이들이 들어오자마자 해당 학생의 칠판이 바로 열려 가장 편리합니다!
            </p>
          </div>

          {/* Option 1: Current Student Direct Link (Recommended!) */}
          {studentName && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-title">
                  <Smartphone className="w-4 h-4 text-[#DE7272]" />
                  <span>1. {studentName} 롤링페이퍼 바로가기 링크 (강력 추천 ⭐)</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFF6A9] text-[#6d4411] font-bold">
                  {studentName} 바로 열림
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                아이들이 링크를 누르자마자 <strong>'{studentName}'</strong> 롤링페이퍼가 뜨며 글을 바로 작성할 수 있습니다.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={studentShareUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl select-all text-slate-600 truncate"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(studentShareUrl, 'student')}
                  className="px-4 py-2 rounded-xl bg-[#DE7272] hover:bg-[#c95d5d] text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedType === 'student' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'student' ? '복사됨!' : '링크 복사'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Option 2: Whole Class Home Link */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-title">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <span>2. 우리 반 전체 롤링페이퍼 홈 링크</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                학생 목록 전체 표시
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              구글 시트와 자동 연동된 상태로 열리며, 아이들이 상단에서 원하는 친구를 골라서 롤링페이퍼를 볼 수 있습니다.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={allShareUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl select-all text-slate-600 truncate"
              />
              <button
                type="button"
                onClick={() => handleCopy(allShareUrl, 'all')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {copiedType === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'all' ? '복사됨!' : '링크 복사'}</span>
              </button>
            </div>
          </div>

          {/* Vercel Environment Variable Permanent Setup */}
          <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <span>💡 팁: 깔끔한 기본 주소(파라미터 없는 주소)로 공유하고 싶다면?</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vercel 대시보드 ➔ <strong>Settings ➔ Environment Variables</strong>에서 
              변수 이름으로 <code>VITE_GAS_URL</code>, 값으로 구글 웹 앱 URL을 넣고 저장 후 재배포(Redeploy)하시면,
              뒤에 긴 주소 없이 <code>https://webpaper-rosy.vercel.app/</code>만 보내도 모든 학생에게 구글 시트가 100% 자동 연동됩니다!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
