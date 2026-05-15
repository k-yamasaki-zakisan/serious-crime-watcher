import { useState, useEffect } from 'react';

interface ForeignCrimeData {
  metadata: {
    dataSource: string;
    period: string;
    extractedDate: string;
    totalCountries: number;
    definition: string;
  };
  summary: {
    totalPersons2024: number;
    totalPersons2023: number;
    seriousCrimes2024: number;
    seriousCrimes2023: number;
    yearOnYearChange: number;
  };
  countries: Array<{
    name: string;
    region: string;
    data: {
      total: Record<string, number>;
      seriousCrimes: Record<string, number>;
      murder: Record<string, number>;
      robbery: Record<string, number>;
      arson: Record<string, number>;
      sexualAssault: Record<string, number>;
      kidnapping: Record<string, number>;
      indecency: Record<string, number>;
    };
  }>;
  regions: Array<{
    region: string;
    countries: number;
    total2024: number;
    total2023: number;
    seriousCrimes2024: number;
    seriousCrimes2023: number;
  }>;
}

/**
 * 来日外国人犯罪データを取得するカスタムフック
 */
export function useForeignCrimeData(dataPath: string = './data/foreign-crime-statistics.json') {
  const [data, setData] = useState<ForeignCrimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(dataPath);
        
        if (!response.ok) {
          throw new Error(`来日外国人犯罪データの取得に失敗しました: ${response.status}`);
        }
        
        const jsonData: ForeignCrimeData = await response.json();
        setData(jsonData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '来日外国人犯罪データ取得エラー');
        console.error('Foreign crime data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataPath]);

  return { data, loading, error };
}