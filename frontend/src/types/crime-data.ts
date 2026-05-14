export interface CrimeDataset {
  metadata: Metadata;
  foreignerCrimes: ForeignerCrimes;
  japaneseCrimes: JapaneseCrimes;
}

export interface Metadata {
  year: number;
  period: string; // "1-3月", "年間"
  dataSource: string;
  retrievedDate: string;
  notes: string;
  version: string; // "暫定値" or "確定値"
}

export interface ForeignerCrimes {
  total: TotalCrimes;
  byNationality: NationalityData[];
  byPrefecture: PrefectureData[];
  byCrimeType?: CrimeTypeData[];
  byResidenceStatus?: ResidenceStatusData[];
  byAgeGroup?: AgeGroupData[];
}

export interface TotalCrimes {
  cases: number; // 総件数（刑法犯 + 特別法犯）
  persons: number; // 総人員
  criminalCases: number; // 刑法犯のみ
  criminalPersons: number; // 刑法犯のみ
}

export interface NationalityData {
  region: string;
  country: string;
  totalPersons: number;
  seriousCrimes: SeriousCrimes;
  seriousTheft: SeriousTheft;
  residentPopulation?: number;
  crimeRatePer100k?: number;
}

export interface SeriousCrimes {
  total: number;
  murder: number;
  robbery: number;
  arson: number;
  sexualAssault: number; // 不同意性交等
  abduction: number; // 略取誘拐・人身売買
  indecency: number; // 不同意わいせつ
}

export interface SeriousTheft {
  total: number;
  burglary: number; // 侵入盗
  autoTheft: number; // 自動車盗
  snatching: number; // ひったくり
  pickpocketing: number; // すり
}

export interface PrefectureData {
  prefecture: string;
  totalCases: number;
  totalPersons: number;
  criminalCases: number;
  criminalPersons: number;
}

export interface JapaneseCrimes {
  totalCases: number;
  totalPersons: number;
  totalPopulation: number;
  crimeRatePer100k: number;
  byAgeGroup?: AgeGroupData[];
}

export interface AgeGroupData {
  ageGroup: string;
  persons: number;
  population: number;
  crimeRatePer100k: number;
}

export interface CrimeTypeData {
  type: string;
  cases: number;
  persons: number;
}

export interface ResidenceStatusData {
  status: string;
  persons: number;
  cases: number;
}

// 年度インデックス用
export interface DataIndex {
  availableYears: AvailableYear[];
  latestYear: number;
}

export interface AvailableYear {
  year: number;
  period: string;
  version: string;
  fileUrl: string;
}
