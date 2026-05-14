import React from 'react';
import { useCrimeData } from '../hooks/useCrimeData';
import type { CrimeDataset } from '../types/crime-data';
import { NationalityBarChart } from './charts/NationalityBarChart';
import { PrefectureDonutChart } from './charts/PrefectureDonutChart';
import { CrimeTypePieChart } from './charts/CrimeTypePieChart';

/**
 * 統計カード表示コンポーネント
 */
const StatCard: React.FC<{
  title: string;
  value: number;
  subtext?: string;
  color?: string;
}> = ({ title, value, subtext, color = "blue" }) => (
  <div className={`bg-white p-6 rounded-lg shadow border-l-4 border-${color}-500`}>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    {subtext && <p className="text-sm text-gray-600 mt-1">{subtext}</p>}
  </div>
);

/**
 * 国籍別データ表示コンポーネント
 */
const NationalityTable: React.FC<{ data: CrimeDataset['foreignerCrimes']['byNationality'] }> = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">国籍別検挙人員</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">国・地域</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">総人員</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">重要犯罪</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">重要窃盗</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div className="font-medium">{item.country}</div>
                  <div className="text-xs text-gray-500">{item.region}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalPersons.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seriousCrimes.total.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seriousTheft.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * 都道府県別データ表示コンポーネント
 */
const PrefectureTable: React.FC<{ data: CrimeDataset['foreignerCrimes']['byPrefecture'] }> = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">都道府県別検挙状況</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">都道府県</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">総件数</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">総人員</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">刑法犯件数</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.prefecture}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalCases.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalPersons.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.criminalCases.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * メインダッシュボードコンポーネント
 */
export const Dashboard: React.FC = () => {
  const { data, loading, error } = useCrimeData();

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">データの読み込みに失敗しました</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">データが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* メタデータ表示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          {data.metadata.year}年 {data.metadata.period} 犯罪統計データ
        </h2>
        <p className="text-sm text-blue-700">
          データソース: {data.metadata.dataSource} | 
          取得日: {data.metadata.retrievedDate} | 
          {data.metadata.version}
        </p>
        {data.metadata.notes && (
          <p className="text-sm text-blue-600 mt-1">
            注記: {data.metadata.notes}
          </p>
        )}
      </div>

      {/* 統計概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="外国人検挙総件数"
          value={data.foreignerCrimes.total.cases}
          subtext="全犯罪（刑法犯+特別法犯）"
          color="blue"
        />
        <StatCard
          title="外国人検挙総人員"
          value={data.foreignerCrimes.total.persons}
          subtext="検挙された総人数"
          color="green"
        />
        <StatCard
          title="外国人刑法犯件数"
          value={data.foreignerCrimes.total.criminalCases}
          subtext="刑法犯のみ"
          color="orange"
        />
        <StatCard
          title="日本人犯罪率"
          value={Math.round(data.japaneseCrimes.crimeRatePer100k)}
          subtext="人口10万人あたり"
          color="purple"
        />
      </div>

      {/* チャート表示エリア */}
      <div className="space-y-8">
        {/* 国籍別・都道府県別チャート */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <NationalityBarChart data={data.foreignerCrimes.byNationality} />
          <PrefectureDonutChart data={data.foreignerCrimes.byPrefecture} />
        </div>
        
        {/* 犯罪種別チャート */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CrimeTypePieChart data={data.foreignerCrimes.byNationality} />
          </div>
          <div className="space-y-4">
            {/* 追加の統計情報 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">統計サマリー</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">データ対象年度</span>
                  <span className="font-medium">{data.metadata.year}年</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">対象期間</span>
                  <span className="font-medium">{data.metadata.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">国・地域数</span>
                  <span className="font-medium">{data.foreignerCrimes.byNationality.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">都道府県数</span>
                  <span className="font-medium">{data.foreignerCrimes.byPrefecture.length}</span>
                </div>
                <hr className="my-3" />
                <div className="text-xs text-gray-500">
                  <p>📊 データソース: {data.metadata.dataSource}</p>
                  <p>📅 取得日: {data.metadata.retrievedDate}</p>
                  <p>📝 {data.metadata.version}</p>
                </div>
              </div>
            </div>
            
            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ データ解釈の注意</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>• 検挙ベースの統計（起訴・有罪とは異なる）</p>
                <p>• 人口構成の違いを考慮した比較が必要</p>
                <p>• 年齢・社会的背景の影響を考慮</p>
                <p>• 特定民族への偏見助長は本意ではない</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* データテーブル */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <NationalityTable data={data.foreignerCrimes.byNationality} />
        <PrefectureTable data={data.foreignerCrimes.byPrefecture} />
      </div>
    </div>
  );
};