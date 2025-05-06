# 지역 상권 혼잡도 분석 프로젝트

> 각 업종별 점포 수, 인구 수, 성비 등의 지역 데이터를 바탕으로 혼잡도를 분석하는 모델 생성

---

## 프로젝트 개요

- **목표**: 지역별 혼잡도 점수를 계산하여, 사용자에게 혼잡한 상권과 덜 혼잡한 상권을 비교 분석할 수있도록 제공
- **분석 대상**: 행정동 단위 지역
- **분석 요소**:
  - 각 업종별 점포 수
  - 인구 수
  - 남녀 인구 비율
  - 지역 면적

---

### 혼잡도 지수 공식

\[
\text{혼잡도} = \alpha \times \text{점포 밀도} \times (1 + \beta \times \text{인구 밀도}) \times (1 + \gamma \times \text{성비 편차})
\]

- **점포 밀도** = 업종별 점포 수 ÷ 지역 면적
- **인구 밀도** = 인구 수 ÷ 지역 면적
- **성비 편차** = \(|\text{남성 인구} - \text{여성 인구}|\) ÷ 총 인구
- \(\alpha, \beta, \gamma\) = 가중치 (예: \(\alpha = 1.0, \beta = 0.5, \gamma = 0.2\))

> 인구 밀도와 성비 불균형이 클수록 혼잡도는 더 높아짐


---
### `region` (지역 정보)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| region_id | INT | 지역 고유 ID (PK) |
| name | VARCHAR | 행정동/구 이름 |
| area_km2 | FLOAT | 지역 면적 (제곱킬로미터) |
| lat | FLOAT | 중심 위도 |
| lng | FLOAT | 중심 경도 |

---

### `population_stats` (인구 통계)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | INT | PK |
| region_id | INT | FK → region |
| date | DATE | 기준 일자 |
| total | INT | 전체 인구 수 |
| male | INT | 남성 인구 수 |
| female | INT | 여성 인구 수 |

---

### `restaurant_stats` (업종별 점포 수)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | INT | PK |
| region_id | INT | FK → region |
| business_type | VARCHAR | 업종 구분 (예: 한식, 중식, 카페 등) |
| count | INT | 해당 업종 점포 수 |
| date | DATE | 기준 일자 |

---

### `congestion_score` (혼잡도 분석 결과)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | INT | PK |
| region_id | INT | FK → region |
| score | FLOAT | 계산된 혼잡도 점수 |
| date | DATE | 분석 기준 일자 |

---

> 혼잡도 분석 방식: API를 통해 데이터를 받아온후 → DB에저장 → DB 정보들을 토대로 계산후 결과를 DB애 저장

---

##내가 해야할것

| 분야 | 기술 스택 |
|------|------------|
| 분석 모델 | Python |
| DB 설계 | MySQL or PostgreSQL |
| API 연동 | FastAPI or Flask |
| 데이터 수집 | 소상공인진흥공단 API, 공공데이터포털 등 |

## 📌 참고 사이트
- [소상공인시장진흥공단 상권정보시스템](https://bigdata.sbiz.or.kr/)
- [공공데이터포털](https://www.data.go.kr/)
- [행정안전부 주민등록 인구통계](https://jumin.mois.go.kr/)



