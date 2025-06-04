
CREATE DATABASE business_district;

USE business_district;

#결과 저장용
CREATE TABLE congestion_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(100),               -- 예: 서울특별시 강남구 신사동
    industry_level VARCHAR(2),           -- '대', '중', '소'
    industry_name VARCHAR(50),           -- 예: 음식점업, 한식
    store_count INT,                     -- 점포 수
    population_total INT,                -- 총 인구
    population_male INT,                 -- 남성 인구
    population_female INT,               -- 여성 인구
    area_km2 DOUBLE,                     -- 면적(㎢)
    population_density DOUBLE,           -- 인구 밀도
    store_density DOUBLE,                -- 점포 밀도
    gender_bias VARCHAR(10),             -- 남초 / 여초 / 균형
    congestion_score DOUBLE,             -- 혼잡도 점수 (0~100)
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 저장 시각
);

#최대값 저장용
CREATE TABLE congestion_max_values (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_type VARCHAR(20),   
    max_value DOUBLE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

#초기값 삽입(더 큰 값 나오면 갱신됨)
INSERT INTO congestion_max_values (metric_type, max_value) VALUES
('population_density', 269404.3),
('shop_density', 1616.3);

