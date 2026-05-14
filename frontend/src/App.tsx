import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            治安モンスター
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <Dashboard />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            データソース: e-Stat 警察庁犯罪統計 | 
            <span className="ml-2">統計的に公平な比較のため、人口比での表示を推奨</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
