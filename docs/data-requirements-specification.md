# データ要件仕様書

**基準日**: 2026年5月14日  
**バージョン**: v1.0  
**基準**: 欧州犯罪統計ダッシュボード調査結果

## 📊 統計的公平性指標（高優先度）

### 1. 人口調整済み犯罪率

```typescript
interface PopulationAdjustedStats {
  // 基準となる日本人データ
  japaneseCrimeRate: {
    per100k: number;           // 人口10万人あたり犯罪率
    totalPopulation: number;   // 総人口
    totalCrimes: number;       // 総犯罪件数
  };
  
  // 国籍別比較データ
  byNationality: Array<{
    country: string;
    region: string;
    population: number;        // 在住人口（法務省統計）
    crimesPer100k: number;     // 人口10万人あたり犯罪率
    riskRatio: number;         // 日本人との比率（1.0が同等）
    confidenceInterval: {      // 信頼区間
      lower: number;
      upper: number;
    };
  }>;
}
```

### 2. 年齢層調整統計

```typescript
interface AgeAdjustedAnalysis {
  ageGroups: Array<{
    range: string;             // "20-29", "30-39", etc.
    japanese: {
      population: number;
      crimes: number;
      rate: number;
    };
    foreign: Array<{
      country: string;
      population: number;
      crimes: number;
      rate: number;
    }>;
  }>;
  
  // 年齢標準化犯罪率
  ageStandardizedRates: Array<{
    country: string;
    standardizedRate: number;  // 年齢構成を調整した犯罪率
    rawRate: number;          // 未調整の犯罪率
    adjustment: number;        // 調整の効果
  }>;
}
```

## 🗾 地域分析指標（中優先度）

### 3. 地域集中度分析

```typescript
interface RegionalConcentration {
  byPrefecture: Array<{
    prefecture: string;
    foreignerPopulation: number;      // 外国人人口
    foreignerPopulationRatio: number; // 全人口に占める外国人比率
    crimeConcentrationIndex: number;  // 犯罪集中度指数
    giniCoefficient: number;         // ジニ係数（分布の偏り）
    
    // 主要国籍グループ
    majorGroups: Array<{
      country: string;
      population: number;
      crimeShare: number;            // 犯罪件数シェア
    }>;
  }>;
  
  // 都市圏分析
  urbanRuralAnalysis: {
    urban: CrimeStats;               // 都市部統計
    rural: CrimeStats;               // 地方統計
    difference: number;              // 都市・地方格差
  };
}
```

### 4. 社会経済要因分析

```typescript
interface SocioEconomicAnalysis {
  // 経済指標との相関
  economicCorrelation: Array<{
    prefecture: string;
    unemploymentRate: number;        // 失業率
    averageIncome: number;          // 平均所得
    crimeRate: number;              // 犯罪率
    correlation: number;            // 相関係数
  }>;
  
  // 外国人支援制度との関係
  supportSystemImpact: Array<{
    prefecture: string;
    supportProgramsCount: number;    // 支援プログラム数
    integrationIndex: number;        // 統合指数
    crimeRateChange: number;        // 犯罪率変化
  }>;
}
```

## 📈 時系列分析（中優先度）

### 5. 長期トレンド分析

```typescript
interface TemporalAnalysis {
  yearlyTrends: Array<{
    year: number;
    totalCrimes: number;
    changeFromPrevious: number;      // 前年比変化率
    seasonalAdjustment: number;      // 季節調整値
    
    // 国籍別トレンド
    byNationality: Array<{
      country: string;
      crimes: number;
      population: number;
      trendDirection: 'increasing' | 'decreasing' | 'stable';
    }>;
  }>;
  
  // 政策影響分析
  policyImpactAnalysis: Array<{
    policyName: string;
    implementationDate: string;
    beforeAfterComparison: {
      before: CrimeStats;
      after: CrimeStats;
      statisticalSignificance: number;
    };
  }>;
}
```

### 6. 予測モデリング

```typescript
interface PredictiveAnalysis {
  // 短期予測（6ヶ月）
  shortTermForecast: Array<{
    month: string;
    predictedCrimes: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    factorsInfluencing: string[];
  }>;
  
  // リスクファクター分析
  riskFactors: Array<{
    factor: string;
    impact: number;               // 犯罪率への影響度
    reliability: number;          // 予測信頼度
  }>;
}
```

## 🎯 比較・ベンチマーク指標（低優先度）

### 7. 国際比較

```typescript
interface InternationalComparison {
  countries: Array<{
    country: string;              // ドイツ、オランダ、フランス等
    migrantCrimeRate: number;     // 移民犯罪率
    nativeCrimeRate: number;      // 自国民犯罪率
    ratio: number;                // 比率
    methodology: string;          // 統計手法の違い
  }>;
  
  // 日本の相対位置
  japanRanking: {
    migrantIntegration: number;   // 統合度ランキング
    crimePrevention: number;      // 犯罪予防ランキング
    dataTransparency: number;     // データ透明性ランキング
  };
}
```

### 8. 詳細犯罪分析

```typescript
interface DetailedCrimeAnalysis {
  // 犯罪種別詳細
  crimeTypesDetailed: Array<{
    category: string;
    subcategories: Array<{
      name: string;
      japaneseRate: number;
      foreignRates: Array<{
        country: string;
        rate: number;
      }>;
      riskFactors: string[];
      preventionMeasures: string[];
    }>;
  }>;
  
  // 被害者統計
  victimStatistics: Array<{
    victimNationality: string;
    perpetratorNationality: string;
    crimeType: string;
    frequency: number;
    location: string;
  }>;
}
```

## 🔄 データ更新要件

### 更新頻度
- **月次更新**: 基本犯罪統計
- **四半期更新**: 人口統計、社会経済データ
- **年次更新**: 詳細分析、国際比較データ

### データソース
- **警察庁**: 犯罪統計（月次）
- **法務省**: 在留外国人統計（四半期）
- **総務省**: 人口統計（年次）
- **厚労省**: 雇用統計（四半期）

## 📋 実装優先順位

### フェーズ1（即時実装）
1. 人口調整済み犯罪率
2. 基本的な年齢層比較
3. 地域集中度指標

### フェーズ2（3ヶ月以内）
1. 詳細年齢調整分析
2. 社会経済要因分析
3. 時系列トレンド

### フェーズ3（6ヶ月以内）
1. 予測モデリング
2. 国際比較
3. 詳細犯罪分析

---

**参考基準**: ドイツBKA、オランダCBS統計手法  
**作成者**: Claude Code  
**承認**: プロジェクトチーム