export interface CrimeDataset {
  metadata: Metadata;
  summary: CrimeSummary;
  yearlyTrends: YearlyTrend[];
  crimeTypes: CrimeType[];
  seriousCrimes: SeriousCrimesData;
  foreignerCrimes: ForeignerCrimes;
}

export interface Metadata {
  year: number;
  period: string; // "年次"
  dataSource: string;
  retrievedDate: string;
  version: string; // "ver.2.0"
  notes: string;
  totalRecords: number;
}

export interface CrimeSummary {
  latestYear: number;
  totalRecognizedCases: number;
  totalArrestedCases: number;
  averageArrestRate: number;
  totalPersonnel: number;
}

export interface YearlyTrend {
  year: number;
  totalRecognized: number;
  totalArrested: number;
  arrestRate: number;
  totalPersonnel: number;
  details: Record<string, any>;
}

export interface CrimeType {
  name: string;
  code: string;
  level: string;
  recognized: number;
  arrested: number;
  personnel: number;
  yearlyTrend: any[];
}

export interface SeriousCrimesData {
  total: number;
  arrested: number;
  arrestRate: number;
  breakdown: SeriousCrimeBreakdown[];
}

export interface SeriousCrimeBreakdown {
  name: string;
  code: string;
  level: string;
  recognized: number;
  arrested: number;
  personnel: number;
}

export interface ForeignerCrimes {
  note: string;
  estimated: {
    totalCases: number;
    byRegion: RegionData[];
  };
}

export interface RegionData {
  region: string;
  cases: number;
}

// Legacy interfaces - may be used by future foreign national statistics
export interface LegacyForeignerData {
  total: TotalCrimes;
  byNationality: NationalityData[];
}

export interface TotalCrimes {
  cases: number;
  persons: number;
}

export interface NationalityData {
  region: string;
  country: string;
  totalPersons: number;
  seriousCrimes?: any;
  seriousTheft?: any;
}
