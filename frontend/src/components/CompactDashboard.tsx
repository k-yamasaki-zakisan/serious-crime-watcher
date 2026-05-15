import React, { useState } from 'react';
import { useCrimeData } from '../hooks/useCrimeData';
import type { CrimeDataset } from '../types/crime-data';
// Charts will be implemented later when external data is available

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
              {data.summary.totalRecognizedCases.toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm font-medium">総認知件数</div>
            <div className="text-xs text-slate-300 mt-2 opacity-75">刑法犯総数</div>
          </div>
        </div>
        
        <div className="text-center group">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-white to-emerald-200 bg-clip-text text-transparent">
              {data.summary.totalArrestedCases.toLocaleString()}
            </div>
            <div className="text-emerald-100 text-sm font-medium">総検挙件数</div>
            <div className="text-xs text-slate-300 mt-2 opacity-75">検挙された総件数</div>
          </div>
        </div>
        
        <div className="text-center group">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-white to-orange-200 bg-clip-text text-transparent">
              {data.summary.averageArrestRate}%
            </div>
            <div className="text-orange-100 text-sm font-medium">平均検挙率</div>
            <div className="text-xs text-slate-300 mt-2 opacity-75">全期間平均</div>
          </div>
        </div>
        
        <div className="text-center group">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
              {data.summary.totalPersonnel.toLocaleString()}
            </div>
            <div className="text-purple-100 text-sm font-medium">検挙総人員</div>
            <div className="text-xs text-slate-300 mt-2 opacity-75">検挙された総人数</div>
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
  const topCrimeTypes = data.crimeTypes.slice(0, 3);
  const recentYears = data.yearlyTrends.slice(-3);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-500">
      <div className="flex items-center mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
        <h3 className="text-lg font-bold text-gray-800">統計サマリー</h3>
      </div>
      
      <div className="space-y-6 h-80 overflow-y-auto custom-scrollbar">
        {/* 犯罪種別 TOP3 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center mb-3">
            <span className="text-lg">🏆</span>
            <h4 className="font-bold text-gray-700 ml-2">犯罪種別 TOP3</h4>
          </div>
          <div className="space-y-2">
            {topCrimeTypes.map((item, index) => (
              <div key={item.code} className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors duration-200">
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{item.recognized.toLocaleString()}件</span>
              </div>
            ))}
          </div>
        </div>

        {/* 直近年度推移 */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center mb-3">
            <span className="text-lg">📈</span>
            <h4 className="font-bold text-gray-700 ml-2">直近年度推移</h4>
          </div>
          <div className="space-y-2">
            {recentYears.map((item, index) => (
              <div key={item.year} className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors duration-200">
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                    index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-teal-400' : 'bg-cyan-500'
                  }`}>
                    {item.year}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{item.year}年</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{item.totalRecognized.toLocaleString()}件</span>
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
            <CompactChart title="年次推移" height="h-full">
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <h4 className="font-bold text-gray-700 mb-2">年次推移グラフ</h4>
                  <p className="text-sm text-gray-500">2006-2016年の犯罪統計トレンド</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>最新年度:</span>
                      <span className="font-bold">{data.summary.latestYear}年</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>総認知件数:</span>
                      <span className="font-bold">{data.summary.totalRecognizedCases.toLocaleString()}件</span>
                    </div>
                  </div>
                </div>
              </div>
            </CompactChart>
            
            <CompactChart title="犯罪種別トップ10" height="h-full">
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-center w-full p-4">
                  <div className="text-4xl mb-4">🏆</div>
                  <h4 className="font-bold text-gray-700 mb-4">主要犯罪種別</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.crimeTypes.slice(0, 5).map((crime, index) => (
                      <div key={crime.code} className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <div className="flex items-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 ${
                            index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-xs font-medium">{crime.name}</span>
                        </div>
                        <span className="text-xs font-bold">{crime.recognized.toLocaleString()}件</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CompactChart>
            
            <div className="col-span-1 lg:col-span-2">
              <CompactChart title="重要犯罪統計" height="h-full">
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                  <div className="text-center w-full p-4">
                    <div className="text-4xl mb-4">🚨</div>
                    <h4 className="font-bold text-gray-700 mb-4">重要犯罪（殺人・強盗・放火・強姦）</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/60 rounded-lg p-3">
                        <div className="text-xl font-bold text-red-600">{data.seriousCrimes.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">総認知件数</div>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3">
                        <div className="text-xl font-bold text-green-600">{data.seriousCrimes.arrested.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">検挙件数</div>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3">
                        <div className="text-xl font-bold text-blue-600">{data.seriousCrimes.arrestRate}%</div>
                        <div className="text-xs text-gray-600">検挙率</div>
                      </div>
                    </div>
                  </div>
                </div>
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
                <h3 className="text-lg font-bold text-gray-800">年次推移詳細</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">年度</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">認知件数</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">検挙率</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {data.yearlyTrends.slice(-8).reverse().map((item) => (
                      <tr key={item.year} className="hover:bg-blue-50/50 transition-colors duration-200 rounded-lg">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.year}年</td>
                        <td className="px-4 py-3 text-blue-600 font-semibold">{item.totalRecognized.toLocaleString()}件</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">{item.arrestRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-gray-100/50 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-gray-800">重要犯罪詳細</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">犯罪種別</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">認知件数</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">検挙件数</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {data.seriousCrimes.breakdown.slice(0, 6).map((item) => (
                      <tr key={item.code} className="hover:bg-emerald-50/50 transition-colors duration-200 rounded-lg">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-emerald-600 font-semibold">{item.recognized.toLocaleString()}件</td>
                        <td className="px-4 py-3 text-teal-600 font-semibold">{item.arrested.toLocaleString()}件</td>
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