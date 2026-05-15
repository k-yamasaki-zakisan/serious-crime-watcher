import React from 'react';
import { useForeignCrimeData } from '../hooks/useForeignCrimeData';
import { ForeignCrimeLineChart } from './charts/ForeignCrimeLineChart';

/**
 * 来日外国人犯罪統計ダッシュボード
 * 最新のe-Statデータを使用したモダンなインターフェース
 */
export const ForeignCrimeDashboard: React.FC = () => {
  const { data, loading, error } = useForeignCrimeData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">データ読み込みエラー</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-300">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">
              来日外国人犯罪統計ダッシュボード
            </h1>
            <p className="mt-2 text-gray-300">
              警察庁統計に基づく包括的な犯罪分析
            </p>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* インタラクティブチャート */}
          <ForeignCrimeLineChart data={data} />
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">
              このデータは{data.metadata.dataSource}の公式統計に基づいています
            </p>
            <p className="mb-2">
              定義: {data.metadata.definition}
            </p>
            <p>
              最終更新: {data.metadata.extractedDate} | 対象期間: {data.metadata.period}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};