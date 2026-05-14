function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Serious Crime Watcher
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            日本国内における外国人関連の犯罪統計ダッシュボード
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                プロジェクトセットアップ完了
              </h2>
              <p className="text-gray-500 mb-2">
                React + TypeScript + Vite + TailwindCSS + ApexCharts
              </p>
              <p className="text-sm text-gray-400">
                次のステップ: データ可視化コンポーネントの実装
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            データソース: e-Stat 警察庁犯罪統計
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
