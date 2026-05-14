import { useState, useEffect } from 'react';
import type { CrimeDataset } from '../types/crime-data';

/**
 * 犯罪データを取得するカスタムフック
 */
export function useCrimeData(dataPath: string = './data/demo-data.json') {
  const [data, setData] = useState<CrimeDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(dataPath);
        
        if (!response.ok) {
          throw new Error(`データの取得に失敗しました: ${response.status}`);
        }
        
        const jsonData: CrimeDataset = await response.json();
        setData(jsonData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データ取得エラー');
        console.error('Crime data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataPath]);

  return { data, loading, error };
}