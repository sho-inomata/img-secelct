import React, { useState } from 'react';

/* --------------------------------------------------------------------------
 * 型定義
 * --------------------------------------------------------------------------*/
export type Part = {
  title: string;
  required: number;
  count: number;
  note?: string;
};
export type Chapter = Record<string, Part[]>;
export type PeopleKey = '3人' | '4人' | '5人';
export type PeopleData = Record<PeopleKey, Chapter>;

/* --------------------------------------------------------------------------
 * 人数ごとのシナリオ構成データ
 * 必要枚数 (required) はユーザ指定の値をそのまま使用
 * --------------------------------------------------------------------------*/
const initialData: PeopleData = {
  '3人': {
    '更衣室編': [
      { title: '更衣室着替え', required: 5, count: 0 },
      { title: '更衣室でセクハラ', required: 8, count: 0 },
      { title: 'フェラ（更衣室）', required: 17, count: 0 },
    ],
    'ビーチ編': [
      { title: '海水着', required: 8, count: 0 },
      { title: 'おっぱい吸う（ビーチ）', required: 8, count: 0 },
      { title: 'フェラ（ビーチ）', required: 17, count: 0 },
      { title: '本番（ビーチ）', required: 34, count: 0, note: '1人33枚' },
      { title: '事後（ビーチ）', required: 25, count: 0 },
    ],
    'ベッド編': [
      { title: '全裸ベッド', required: 5, count: 0 },
      { title: '本番（ベッドルーム）', required: 17, count: 0 },
      { title: '事後（ベッドルーム）', required: 8, count: 0 },
      { title: 'ボテ腹SEX（ベッドルーム）', required: 15, count: 0 },
    ],
  },
  '4人': {
    '更衣室編': [
      { title: '更衣室着替え', required: 4, count: 0 },
      { title: '更衣室でセクハラ', required: 6, count: 0 },
      { title: 'フェラ（更衣室）', required: 12, count: 0 },
    ],
    'ビーチ編': [
      { title: '海水着', required: 6, count: 0 },
      { title: 'おっぱい吸う（ビーチ）', required: 6, count: 0 },
      { title: 'フェラ（ビーチ）', required: 12, count: 0 },
      { title: '本番（ビーチ）', required: 26, count: 0 },
      { title: '事後（ビーチ）', required: 19, count: 0 },
    ],
    'ベッド編': [
      { title: '全裸ベッド', required: 4, count: 0 },
      { title: '本番（ベッドルーム）', required: 13, count: 0 },
      { title: '事後（ベッドルーム）', required: 6, count: 0 },
      { title: 'ボテ腹SEX（ベッドルーム）', required: 11, count: 0 },
    ],
  },
  '5人': {
    '更衣室編': [
      { title: '更衣室着替え', required: 3, count: 0 },
      { title: '更衣室でセクハラ', required: 5, count: 0, note: '少ない' },
      { title: 'フェラ（更衣室）', required: 10, count: 0 },
    ],
    'ビーチ編': [
      { title: '海水着', required: 5, count: 0 },
      { title: 'おっぱい吸う（ビーチ）', required: 5, count: 0 },
      { title: 'フェラ（ビーチ）', required: 10, count: 0 },
      { title: '本番（ビーチ）', required: 20, count: 0, note: '少ない' },
      { title: '事後（ビーチ）', required: 15, count: 0 },
    ],
    'ベッド編': [
      { title: '全裸ベッド', required: 3, count: 0 },
      { title: '本番（ベッドルーム）', required: 10, count: 0 },
      { title: '事後（ベッドルーム）', required: 5, count: 0 },
      { title: 'ボテ腹SEX（ベッドルーム）', required: 9, count: 0 },
    ],
  },
};

/* --------------------------------------------------------------------------
 * UI コンポーネント
 * --------------------------------------------------------------------------*/
const ChapterSection: React.FC<{ chapter: string; parts: Part[]; onInc: (idx: number) => void }> = ({ chapter, parts, onInc }) => {
  const [open, setOpen] = useState(false);
  const total = parts.reduce((s, p) => s + p.count, 0);
  const totalReq = parts.reduce((s, p) => s + p.required, 0);
  const ratio = Math.round((total / totalReq) * 100);

  return (
    <div className="border rounded-md overflow-hidden">
      {/* header */}
      <button className="w-full flex justify-between items-center p-3 bg-gray-100" onClick={() => setOpen(!open)}>
        <span className="font-bold">{chapter}</span>
        <span className="text-sm text-gray-600">{total}/{totalReq}</span>
      </button>

      {/* parts list */}
      {open && (
        <div className="p-3 space-y-3 bg-white">
          {parts.map((part, idx) => {
            const reached = part.count >= part.required;
            const pratio = Math.round((part.count / part.required) * 100);
            return (
              <div
                key={idx}
                className={`border rounded p-3 cursor-pointer ${reached ? 'opacity-60 pointer-events-none' : 'hover:bg-gray-50'}`}
                onClick={() => onInc(idx)}
              >
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <span className="font-medium break-all">{part.title}</span>
                  {part.note && <span className="text-red-600 font-bold text-xs">{part.note}</span>}
                  <span className="text-sm whitespace-nowrap">{part.count}/{part.required}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded mt-2">
                  <div className="h-full bg-blue-500 rounded" style={{ width: `${pratio}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* chapter progress */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full bg-green-500" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
};

const SummaryPanel: React.FC<{ data: Chapter; label: PeopleKey }> = ({ data, label }) => {
  const totalRequired = Object.values(data).flat().reduce((s, p) => s + p.required, 0);
  return (
    <div className="space-y-2 text-sm">
      <h2 className="font-bold">▶︎{label}の場合</h2>
      <p className="text-green-700 font-semibold">✅ {totalRequired}枚構成（1人あたり）</p>
      {Object.entries(data).map(([chap, parts]) => (
        <div key={chap}>
          <p className="font-bold mt-2">〜{chap}〜</p>
          <ul className="list-disc list-inside space-y-0.5">
            {parts.map((p, idx) => (
              <li key={idx} className="flex items-center gap-1">
                <span>{p.title}（{p.required}枚）</span>
                {p.note && <span className="text-red-600 text-xs font-bold">{p.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/* --------------------------------------------------------------------------
 * メインコンポーネント
 * --------------------------------------------------------------------------*/
const CountTool: React.FC = () => {
  const [people, setPeople] = useState<PeopleKey>('3人');
  const [data, setData] = useState<PeopleData>(initialData);

  const handleIncrement = (chapter: string, idx: number) => {
    setData(prev => {
      const next = structuredClone(prev);
      const part = next[people][chapter][idx];
      if (part.count < part.required) part.count += 1;
      return next;
    });
  };

  const current = data[people];

  return (
    <div className="max-w-6xl mx-auto p-4 md:flex md:gap-8">
      {/* left counting UI */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-center gap-3">
          {(['3人', '4人', '5人'] as const).map(label => (
            <button
              key={label}
              onClick={() => setPeople(label)}
              className={`px-4 py-2 rounded font-semibold border transition-colors ${label === people ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 border-blue-500 hover:bg-blue-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {Object.entries(current).map(([chapter, parts]) => (
            <ChapterSection key={chapter} chapter={chapter} parts={parts} onInc={idx => handleIncrement(chapter, idx)} />
          ))}
        </div>
      </div>

      {/* right summary */}
      <div className="mt-8 md:mt-0 md:w-80 md:border-l md:pl-6">
        <SummaryPanel data={current} label={people} />
      </div>
    </div>
  );
};

export default CountTool;


/** データ型 */
export type Part = {
  title: string;
  count: number;
  required: number;
  note?: string;
};
export type Chapter = Record<string, Part[]>;
export type PeopleData = Record<'3人' | '4人' | '5人', Chapter>;

/** 初期データ（必要に応じて編集） */
// 人数ごとの構成データ
const initialData: PeopleData = {
  '3人': {
    '更衣室編': [
      { title: '更衣室着替え', count: 0, required: 5 },
      { title: '更衣室でセクハラ', count: 0, required: 8 },
      { title: 'フェラ（更衣室）', count: 0, required: 17 },
    ],
    'ビーチ編': [
      { title: '海水着', count: 0, required: 8 },
      { title: 'おっぱい吸う（ビーチ）', count: 0, required: 8 },
      { title: 'フェラ（ビーチ）', count: 0, required: 17 },
      { title: '本番（ビーチ）', count: 0, required: 34, note: '1人33枚' },
      { title: '事後（ビーチ）', count: 0, required: 25 },
    ],
    'ベッド編': [
      { title: '全裸ベッド', count: 0, required: 5 },
      { title: '本番（ベッドルーム）', count: 0, required: 17 },
      { title: '事後（ベッドルーム）', count: 0, required: 8 },
      { title: 'ボテ腹SEX（ベッドルーム）', count: 0, required: 15 },
    ],
  },
    '更衣室編': [
      { title: '更衣室着替え', count: 0, required: 2 },
      { title: '更衣室でセクハラ', count: 0, required: 3 },
      { title: 'フェラ（更衣室）', count: 0, required: 6 },
    ],
    'ビーチ編': [
      { title: '海水着', count: 0, required: 3 },
      { title: 'おっぱい吸う（ビーチ）', count: 0, required: 3 },
      { title: 'フェラ（ビーチ）', count: 0, required: 6 },
      { title: '本番（ビーチ）', count: 0, required: 12, note: '少ない' },
      { title: '事後（ビーチ）', count: 0, required: 9 },
    ],
    'ベッド編': [
      { title: '全裸ベッド', count: 0, required: 2 },
      { title: '本番（ベッドルーム）', count: 0, required: 6 },
      { title: '事後（ベッドルーム）', count: 0, required: 3 },
      { title: 'ボテ腹SEX（ベッドルーム）', count: 0, required: 5 },
    ],
  },
  '4人': {
    '更衣室編': [
      { title: '更衣室着替え', count: 0, required: 4 },
      { title: '更衣室でセクハラ', count: 0, required: 6 },
      { title: 'フェラ（更衣室）', count: 0, required: 12 },
    ],
    'ビーチ編': [
      { title: '海水着', count: 0, required: 6 },
      { title: 'おっぱい吸う（ビーチ）', count: 0, required: 6 },
      { title: 'フェラ（ビーチ）', count: 0, required: 12 },
      { title: '本番（ビーチ）', count: 0, required: 26 },
      { title: '事後（ビーチ）', count: 0, required: 19 },
    ],
    'ベッド編': [
      { title: '全裸ベッド', count: 0, required: 4 },
      { title: '本番（ベッドルーム）', count: 0, required: 13 },
      { title: '事後（ベッドルーム）', count: 0, required: 6 },
      { title: 'ボテ腹SEX（ベッドルーム）', count: 0, required: 11 },
    ],
  },
    '更衣室編': [
      { title: '更衣室着替え', count: 0, required: 3 },
      { title: '更衣室でセクハラ', count: 0, required: 4 },
      { title: 'フェラ（更衣室）', count: 0, required: 8 },
    ],
    'ビーチ編': [
      { title: '海水着', count: 0, required: 4 },
      { title: 'おっぱい吸う（ビーチ）', count: 0, required: 4 },
      { title: 'フェラ（ビーチ）', count: 0, required: 8 },
      { title: '本番（ビーチ）', count: 0, required: 16, note: '少ない' },
      { title: '事後（ビーチ）', count: 0, required: 12 },
    ],
    'ベッド編': [
      { title: '全裸ベッド', count: 0, required: 3 },
      { title: '本番（ベッドルーム）', count: 0, required: 8 },
      { title: '事後（ベッドルーム）', count: 0, required: 4 },
      { title: 'ボテ腹SEX（ベッドルーム）', count: 0, required: 7 },
    ],
  },
  '5人': {
    '更衣室編': [
      { title: '更衣室着替え', count: 0, required: 3 },
      { title: '更衣室でセクハラ', count: 0, required: 5, note: '少ない' },
      { title: 'フェラ（更衣室）', count: 0, required: 10 },
    ],
    'ビーチ編': [
      { title: '海水着', count: 0, required: 5 },
      { title: 'おっぱい吸う（ビーチ）', count: 0, required: 5 },
      { title: 'フェラ（ビーチ）', count: 0, required: 10 },
      { title: '本番（ビーチ）', count: 0, required: 20, note: '少ない' },
      { title: '事後（ビーチ）', count: 0, required: 15 },
    ],
    'ベッド編': [
      { title: '全裸ベッド', count: 0, required: 3 },
      { title: '本番（ベッドルーム）', count: 0, required: 10 },
      { title: '事後（ベッドルーム）', count: 0, required: 5 },
      { title: 'ボテ腹SEX（ベッドルーム）', count: 0, required: 9 },
    ],
  },
};

/** Chapter セクション */
const ChapterSection: React.FC<{ chapter: string; parts: Part[]; onInc: (idx: number) => void }> = ({ chapter, parts, onInc }) => {
  const [open, setOpen] = useState(false);
  const total = parts.reduce((sum, p) => sum + p.count, 0);
  const totalReq = parts.reduce((sum, p) => sum + p.required, 0);
  const ratio = Math.round((total / totalReq) * 100);

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Header */}
      <button className="w-full flex justify-between items-center p-3 bg-gray-100" onClick={() => setOpen(!open)}>
        <span className="font-bold">{chapter}</span>
        <span className="text-sm text-gray-600">{total}/{totalReq}</span>
      </button>

      {/* Parts */}
      {open && (
        <div className="p-3 space-y-3 bg-white">
          {parts.map((part, idx) => {
            const partRatio = Math.round((part.count / part.required) * 100);
            const reached = part.count >= part.required;
            return (
              <div
                key={idx}
                className={`border rounded p-3 cursor-pointer ${reached ? 'opacity-60 pointer-events-none' : 'hover:bg-gray-50'}`}
                onClick={() => onInc(idx)}
              >
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <span className="font-medium break-all">{part.title}</span>
                  {part.note && <span className="text-red-600 font-bold text-xs">{part.note}</span>}
                  <span className="text-sm whitespace-nowrap">{part.count}/{part.required}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded mt-2">
                  <div
                    className="h-full bg-blue-500 rounded"
                    style={{ width: `${partRatio}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chapter progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full bg-green-500" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
};

/** メインコンポーネント */
// Summary パネル
const SummaryPanel: React.FC<{ current: Chapter; total: number; label: string }> = ({ current, total, label }) => (
  <div className="space-y-2 text-sm">
    <h2 className="font-bold">▶︎{label}の場合</h2>
    <p className="text-green-700 font-semibold">✅ {total}枚構成（1人あたり）</p>
    {Object.entries(current).map(([chap, parts]) => (
      <div key={chap}>
        <p className="font-bold mt-2">〜{chap}〜</p>
        <ul className="list-disc list-inside space-y-0.5">
          {parts.map((p, idx) => (
            <li key={idx} className="flex items-center gap-1">
              <span>{p.title}（{p.required}枚）</span>
              {p.note && <span className="text-red-600 text-xs font-bold">{p.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const CountTool: React.FC = () => {
  const [people, setPeople] = useState<'3人' | '4人' | '5人'>('5人');
  const [data, setData] = useState<PeopleData>(initialData);

  const handleIncrement = (chapter: string, idx: number) => {
    setData(prev => {
      const copy: PeopleData = JSON.parse(JSON.stringify(prev));
      const part = copy[people][chapter][idx];
      if (part.count < part.required) part.count += 1;
      return copy;
    });
  };

  const current = data[people];

    // 合計 required 枚数
  const totalRequired = Object.values(current)
    .flat()
    .reduce((sum, p) => sum + p.required, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 md:space-y-0 md:flex md:gap-8">
      {/* 左:カウントUI */}
      <div className="flex-1 space-y-6"> 
        {/* People selector */}
        <div className="flex gap-3 justify-center">
        {(['3人', '4人', '5人'] as const).map(label => (
          <button
            key={label}
            onClick={() => setPeople(label)}
            className={`px-4 py-2 rounded font-semibold border transition-colors ${label === people ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 border-blue-500 hover:bg-blue-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        {Object.entries(current).map(([chapter, parts]) => (
          <ChapterSection key={chapter} chapter={chapter} parts={parts} onInc={(idx) => handleIncrement(chapter, idx)} />
        ))}
      </div>
    </div>
  );
};

export default CountTool;
