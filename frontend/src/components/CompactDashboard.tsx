import React, { useState } from 'react';
import { useCrimeData } from '../hooks/useCrimeData';
import type { CrimeDataset } from '../types/crime-data';
import { NationalityBarChart } from './charts/NationalityBarChart';
import { PrefectureDonutChart } from './charts/PrefectureDonutChart';
import { CrimeTypePieChart } from './charts/CrimeTypePieChart';

const HeroKPI: React.FC<{ data: CrimeDataset }> = ({ data }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-8 rounded-2xl shadow-2xl mb-8">
    {/* Background pattern */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
    
    <div className="relative z-10">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
          {data.metadata.year}年 犯罪統計サマリー
        </h2>
        <p className="text-slate-300 text-sm mt-2">{data.metadata.period} | {data.metadata.dataSource}</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center group">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">
              {data.foreignerCrimes.total.cases.toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm font-medium">外国人総件数</div>
            <div className="text-xs text-slate-300 mt-2 opacity-75">全犯罪（刑法犯+特別法犯）</div>
          </div>
        </div>
        
        <div className="text-center group">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-white to-emerald-200 bg-clip-text text-transparent">
              {data.foreignerCrimes.total.persons.toLocaleString()}
            </div>
            <div className="text-emerald-100 text-sm font-medium">検挙総人員</div>
            <div className="text-xs text-slate-300 mt-2 opacity-75">検挙された総人数</div>
          </div>
        </div>
        
        <div className="text-center group">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-white to-orange-200 bg-clip-text text-transparent">
              {Math.round(data.japaneseCrimes.crimeRatePer100k)}
            </div>
            <div className="text-orange-100 text-sm font-medium">日本人犯罪率</div>
            <div className="text-xs text-slate-300 mt-2 opacity-75">人口10万人あたり</div>
          </div>
        </div>
        
        <div className="text-center group">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
              {data.foreignerCrimes.byPrefecture.length}
            </div>
            <div className="text-purple-100 text-sm font-medium">対象都道府県</div>
            <div className="text-xs text-slate-300 mt-2 opacity-75">全国カバレッジ</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CompactChart: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  height?: string;
}> = ({ title, children, height = "h-80" }) => (
  <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-500 hover:border-blue-200/50">
    <div className="flex items-center mb-4">
      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">{title}</h3>
    </div>
    <div className={`${height} overflow-hidden relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  </div>
);

const QuickStats: React.FC<{ data: CrimeDataset }> = ({ data }) => {
  const topNationalities = data.foreignerCrimes.byNationality.slice(0, 3);
  const topPrefectures = data.foreignerCrimes.byPrefecture.slice(0, 3);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-500">
      <div className="flex items-center mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
        <h3 className="text-lg font-bold text-gray-800">統計サマリー</h3>
      </div>
      
      <div className="space-y-6 h-80 overflow-y-auto custom-scrollbar">
        {/* 検挙人員 TOP3 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center mb-3">
            <span className="text-lg">🏆</span>
            <h4 className="font-bold text-gray-700 ml-2">検挙人員 TOP3</h4>
          </div>
          <div className="space-y-2">
            {topNationalities.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors duration-200">
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{item.country}</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{item.totalPersons.toLocaleString()}人</span>
              </div>
            ))}
          </div>
        </div>

        {/* 都道府県 TOP3 */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center mb-3">
            <span className="text-lg">📍</span>
            <h4 className="font-bold text-gray-700 ml-2">都道府県 TOP3</h4>
          </div>
          <div className="space-y-2">
            {topPrefectures.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors duration-200">
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                    index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-teal-400' : 'bg-cyan-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{item.prefecture}</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{item.totalCases.toLocaleString()}件</span>
              </div>
            ))}
          </div>
        </div>

        {/* メタ情報 */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="flex items-center">
              <span className="text-sm mr-2">📊</span>
              <span className="font-medium">{data.metadata.year}年 {data.metadata.period}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">🔍</span>
              <span>データソース: {data.metadata.dataSource}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2">⚖️</span>
              <span>統計的公平性を重視した表示</span>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

const DetailToggle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mt-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group w-full bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm hover:from-white/80 hover:to-white/60 p-4 rounded-2xl text-sm font-bold text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/50 hover:border-blue-200/50"
      >
        <div className="flex items-center justify-center space-x-3">
          <span className="text-lg">{isOpen ? '📊' : '📈'}</span>
          <span className="group-hover:text-blue-700 transition-colors duration-300">
            {isOpen ? '詳細データを隠す' : '詳細データを表示'}
          </span>
          <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="mt-6 max-h-96 overflow-y-auto animate-fadeIn">
          {children}
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero KPI Section */}
        <HeroKPI data={data} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-320px)]">
          {/* Left Column - Charts (8/12) */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompactChart title="国籍別検挙状況" height="h-full">
              <NationalityBarChart data={data.foreignerCrimes.byNationality} />
            </CompactChart>
            
            <CompactChart title="都道府県別分布" height="h-full">
              <PrefectureDonutChart data={data.foreignerCrimes.byPrefecture} />
            </CompactChart>
            
            <div className="col-span-1 lg:col-span-2">
              <CompactChart title="犯罪種別構成" height="h-full">
                <CrimeTypePieChart data={data.foreignerCrimes.byNationality} />
              </CompactChart>
            </div>
          </div>

          {/* Right Column - Quick Stats (4/12) */}
          <div className="col-span-12 lg:col-span-4">
            <QuickStats data={data} />
          </div>
        </div>

        {/* Collapsible Detailed Tables */}
        <DetailToggle>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-gray-100/50 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-gray-800">国籍別詳細データ</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">国・地域</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">総人員</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">重要犯罪</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {data.foreignerCrimes.byNationality.slice(0, 8).map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50/50 transition-colors duration-200 rounded-lg">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.country}</td>
                        <td className="px-4 py-3 text-blue-600 font-semibold">{item.totalPersons.toLocaleString()}</td>
                        <td className="px-4 py-3 text-red-600 font-semibold">{item.seriousCrimes.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-gray-100/50 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-gray-800">都道府県別詳細データ</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">都道府県</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">総件数</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">総人員</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {data.foreignerCrimes.byPrefecture.slice(0, 8).map((item, index) => (
                      <tr key={index} className="hover:bg-emerald-50/50 transition-colors duration-200 rounded-lg">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.prefecture}</td>
                        <td className="px-4 py-3 text-emerald-600 font-semibold">{item.totalCases.toLocaleString()}</td>
                        <td className="px-4 py-3 text-teal-600 font-semibold">{item.totalPersons.toLocaleString()}</td>
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