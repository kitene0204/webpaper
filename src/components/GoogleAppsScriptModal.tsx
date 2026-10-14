import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  FileCode,
  RefreshCw
} from 'lucide-react';
import { GasService, DEFAULT_GAS_URL } from '../services/gasService';
import { CODE_GS_RAW } from '../constants/codeGsContent';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionUpdated: () => void;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
  onConnectionUpdated,
}) => {
  const [url, setUrl] = useState(GasService.getGasUrl());
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    loading: boolean;
    success: boolean;
    message: string;
    sheetName?: string;
  }>({
    tested: false,
    loading: false,
    success: false,
    message: '',
  });
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'code' | 'sheetsInfo'>('setup');

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(CODE_GS_RAW);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadCodeGs = () => {
    const blob = new Blob([CODE_GS_RAW], { type: 'text/javascript;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Code.gs';
    link.click();
  };

  const handleRestoreDefault = () => {
    setUrl(DEFAULT_GAS_URL);
    setTestStatus({ tested: false, loading: false, success: false, message: '' });
  };

  const handleTestConnection = async () => {
    setTestStatus({ tested: false, loading: true, success: false, message: '연결 중...' });
    const res = await GasService.testConnection(url);
    setTestStatus({
      tested: true,
      loading: false,
      success: res.success,
      message: res.message,
      sheetName: res.sheetName,
    });
  };

  const handleSaveUrl = () => {
    GasService.setGasUrl(url);
    setSavedNotice(true);
    setTimeout(() => {
      onConnectionUpdated();
      onClose();
    }, 400);
  };

  const handleDisconnect = () => {
    GasService.setGasUrl('');
    setUrl('');
    setTestStatus({ tested: false, loading: false, success: false, message: '' });
    onConnectionUpdated();
  };

  const isDefaultUrl = url.trim() === DEFAULT_GAS_URL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 font-jua">
                  구글 앱스스크립트(GAS) & 시트 연동
                </h2>
                {GasService.isConnected() ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    연결 유지 중
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    로컬 모드 (미연동)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                학생마다 구글 시트 탭이 생성되고 모든 메시지가 영구 보관됩니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'setup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. 웹 앱 URL 연동 및 설정
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'code'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Code.gs 코드 보기 & 복사
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sheetsInfo')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'sheetsInfo'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            3. 학생별 시트 구조 안내
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {activeTab === 'setup' && (
            <div className="space-y-4">
              
              {/* Permanent Maintenance Guarantee Banner */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>구글 시트 연동 주소 영구 유지 보장</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-200 text-emerald-900 font-semibold">설정 유지됨</span>
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    선생님께서 등록해 두신 구글 앱스 스크립트 주소는 설정에서 직접 수정하거나 연동 해제를 누르기 전까지 <strong>모든 기기(아이들 스마트폰, 태블릿, PC) 및 새로고침 후에도 영구히 유지</strong>됩니다.
                  </p>
                </div>
              </div>

              {/* URL Input Form */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    배포된 Google Apps Script 웹 앱 URL (exec 주소)
                  </label>
                  {!isDefaultUrl && (
                    <button
                      type="button"
                      onClick={handleRestoreDefault}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                    >
                      기본 연동 주소로 채우기
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus.loading || !url.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${testStatus.loading ? 'animate-spin' : ''}`} />
                    <span>연결 테스트</span>
                  </button>
                </div>

                {isDefaultUrl && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>선생님의 공식 구글 앱스 스크립트 배포 주소가 등록되어 있습니다.</span>
                  </p>
                )}

                {/* Test status banner */}
                {testStatus.tested && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      testStatus.success
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {testStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <div>
                      <span>{testStatus.message}</span>
                      {testStatus.sheetName && (
                        <div className="text-[11px] font-normal text-emerald-700">
                          연동된 시트: {testStatus.sheetName}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 5-Step Instructions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  간편 5단계 설정 가이드
                </h3>
                
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">새 구글 스프레드시트 생성</p>
                      <p className="text-slate-500">Google Drive에서 새 스프레드시트를 만들고 이름을 "우리반 롤링페이퍼"로 지정합니다.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">Apps Script 편집기 열기</p>
                      <p className="text-slate-500">스프레드시트 상단 메뉴 [확장 프로그램] → [Apps Script]를 클릭합니다.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">Code.gs 붙여넣기 및 저장</p>
                      <p className="text-slate-500">상단 탭 [2. Code.gs 코드 보기 & 복사]에서 코드를 복사하여 Apps Script에 덮어쓴 뒤 저장(Ctrl+S)합니다.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">웹 앱으로 배포하기 (핵심!)</p>
                      <p className="text-slate-500">
                        우측 상단 [배포] → [새 배포] → 유형: [웹 앱] 선택
                        <br />• 실행 권한: <strong>'나'</strong>
                        <br />• 액세스 권한: <strong>'모든 사용자(Anyone)'</strong> (학생들이 로그인 없이 쓸 수 있도록 반드시 설정)
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      5
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">URL 입력 후 연동 저장</p>
                      <p className="text-slate-500">생성된 웹 앱 URL(exec로 끝남)을 위의 입력창에 붙여넣고 [연결 저장]을 누르면 즉시 동기화됩니다!</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Code.gs 전체 소스코드</h3>
                  <p className="text-[11px] text-slate-500">Google Apps Script 편집기에 그대로 붙여넣으세요</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCodeGs}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Code.gs 다운로드</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사 완료!' : '전체 복사'}</span>
                  </button>
                </div>
              </div>

              {/* Code viewer */}
              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 border border-slate-800 select-all">
                  {CODE_GS_RAW}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'sheetsInfo' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-emerald-900 text-xs">
                <h4 className="font-bold text-sm mb-1 font-jua">
                  📑 학생별 구글 시트 탭(Sheet) 자동 생성 구조
                </h4>
                <p className="leading-relaxed">
                  학생을 추가하거나 메시지를 등록할 때, 구글 스프레드시트 내에 해당 학생 이름으로 시트 탭이 자동 생성됩니다.
                  각 시트에는 아래와 같은 정돈된 헤더와 데이터가 차곡차곡 쌓입니다.
                </p>
              </div>

              {/* Table preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-sky-100 text-sky-900 font-bold border-b border-sky-200">
                    <tr>
                      <th className="p-2.5">A. 작성일시</th>
                      <th className="p-2.5">B. 작성자</th>
                      <th className="p-2.5">C. 메시지 내용</th>
                      <th className="p-2.5">D. 스티커</th>
                      <th className="p-2.5">E. 메모지 색</th>
                      <th className="p-2.5">F. 글꼴</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="p-2.5 text-slate-500">2026-10-13 14:20</td>
                      <td className="p-2.5 font-bold text-slate-800">짝꿍 도현이</td>
                      <td className="p-2.5 text-slate-700">민준아! 생일 진심으로 축하해 🎂</td>
                      <td className="p-2.5 text-lg">🎂</td>
                      <td className="p-2.5 text-slate-500">yellow</td>
                      <td className="p-2.5 text-slate-500">gaegu</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-500">2026-10-13 14:35</td>
                      <td className="p-2.5 font-bold text-slate-800">서연이가</td>
                      <td className="p-2.5 text-slate-700">항상 수학 문제 친절히 알려줘서 고마워 🎉</td>
                      <td className="p-2.5 text-lg">🎉</td>
                      <td className="p-2.5 text-slate-500">pink</td>
                      <td className="p-2.5 text-slate-500">jua</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>• 선생님이나 관리자가 구글 시트에서 직접 오타를 수정하거나 내용을 관리할 수 있습니다.</p>
                <p>• 학년말에 구글 시트 파일 하나로 전 학급 학생들의 롤링페이퍼 데이터를 영구 보관할 수 있습니다.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {GasService.isConnected() && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold"
              >
                연동 해제하고 로컬 모드로 전환
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSaveUrl}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              {savedNotice ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savedNotice ? '저장 완료!' : '연결 저장하기'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
