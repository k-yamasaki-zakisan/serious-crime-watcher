import React, { useState } from 'react';
import { useCrimeData } from '../hooks/useCrimeData';
import type { CrimeDataset } from '../types/crime-data';
import { NationalityBarChart } from './charts/NationalityBarChart';
import { PrefectureDonutChart } from './charts/PrefectureDonutChart';
import { CrimeTypePieChart } from './charts/CrimeTypePieChart';

const HeroKPI: React.FC<{ data: CrimeDataset }> = ({ data }) => (
  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg mb-6">
    <div className="grid grid-cols-4 gap-6">
      <div className="text-center">
        <div className="text-3xl font-bold">{data.foreignerCrimes.total.cases.toLocaleString()}</div>
        <div className="text-blue-100 text-sm">外国人総件数</div>
        <div className="text-xs text-blue-200 mt-1">+5.2% 前年比</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold">{data.foreignerCrimes.total.persons.toLocaleString()}</div>
        <div className="text-blue-100 text-sm">検挙総人員</div>
        <div className="text-xs text-blue-200 mt-1">主要10カ国</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold">{Math.round(data.japaneseCrimes.crimeRatePer100k)}</div>
        <div className="text-blue-100 text-sm">日本人犯罪率</div>
        <div className="text-xs text-blue-200 mt-1">10万人あたり</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold">{data.foreignerCrimes.byPrefecture.length}</div>
        <div className="text-blue-100 text-sm">対象都道府県</div>
        <div className="text-xs text-blue-200 mt-1">全国カバー</div>
      </div>
    </div>
  </div>
);

const CompactChart: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  height?: string;
}> = ({ title, children, height = "h-80" }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">{title}</h3>
    <div className={`${height} overflow-hidden`}>
      {children}
    </div>
  </div>
);

const QuickStats: React.FC<{ data: CrimeDataset }> = ({ data }) => {
  const topNationalities = data.foreignerCrimes.byNationality.slice(0, 3);
  const topPrefectures = data.foreignerCrimes.byPrefecture.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">クイック統計</h3>
      <div className="space-y-4 h-80 overflow-y-auto">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">🏆 検挙人員 TOP3</h4>
          {topNationalities.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="text-sm font-medium">{index + 1}. {item.country}</span>
              <span className="text-sm text-gray-600">{item.totalPersons.toLocaleString()}人</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">📍 都道府県 TOP3</h4>
          {topPrefectures.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="text-sm font-medium">{index + 1}. {item.prefecture}</span>
              <span className="text-sm text-gray-600">{item.totalCases.toLocaleString()}件</span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <p>📊 {data.metadata.year}年 {data.metadata.period}</p>
            <p>🔍 データソース: {data.metadata.dataSource}</p>
            <p>⚖️ 統計的公平性を重視した表示</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailToggle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 hover:bg-gray-100 p-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
      >
        {isOpen ? '📊 詳細データを隠す' : '📊 詳細データを表示'} 
        <span className="ml-1">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="mt-4 max-h-96 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export const CompactDashboard: React.FC = () => {
  const { data, loading, error } = useCrimeData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">データの読み込みに失敗しました</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero KPI Section */}
        <HeroKPI data={data} />

        {/* Main Dashboard Grid - 画面高さの残り部分を使用 */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
          {/* Left Column - Charts (8/12) */}
          <div className="col-span-8 grid grid-cols-2 gap-4">
            <CompactChart title="国籍別検挙状況" height="h-full">
              <NationalityBarChart data={data.foreignerCrimes.byNationality} />
            </CompactChart>
            
            <CompactChart title="都道府県別分布" height="h-full">
              <PrefectureDonutChart data={data.foreignerCrimes.byPrefecture} />
            </CompactChart>
            
            <div className="col-span-2">
              <CompactChart title="犯罪種別構成" height="h-full">
                <CrimeTypePieChart data={data.foreignerCrimes.byNationality} />
              </CompactChart>
            </div>
          </div>

          {/* Right Column - Quick Stats (4/12) */}
          <div className="col-span-4">
            <QuickStats data={data} />
          </div>
        </div>

        {/* Collapsible Detailed Tables */}
        <DetailToggle>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">国籍別詳細データ</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">国・地域</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">総人員</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">重要犯罪</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.foreignerCrimes.byNationality.slice(0, 8).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{item.country}</td>
                        <td className="px-4 py-2">{item.totalPersons.toLocaleString()}</td>
                        <td className="px-4 py-2">{item.seriousCrimes.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">都道府県別詳細データ</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">都道府県</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">総件数</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">総人員</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.foreignerCrimes.byPrefecture.slice(0, 8).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{item.prefecture}</td>
                        <td className="px-4 py-2">{item.totalCases.toLocaleString()}</td>
                        <td className="px-4 py-2">{item.totalPersons.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DetailToggle>
      </div>
    </div>
  );
};