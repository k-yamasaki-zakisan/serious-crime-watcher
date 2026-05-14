import { CompactDashboard } from './components/CompactDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🚨 治安モンスター
            </h1>
            <div className="text-sm text-gray-500">
              e-Stat 警察庁犯罪統計 | 統計的公平性重視
            </div>
          </div>
        </div>
      </header>

      <main>
        <CompactDashboard />
      </main>
    </div>
  )
}

export default App
