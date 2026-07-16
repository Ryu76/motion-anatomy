# 3D 근골격계 동작 시각화 웹서비스 개발 명세서

> **문서 상태:** 이 문서는 장기 제품 비전과 단계별 로드맵입니다. 현재 구현 범위는 `README.md`의 **Sprint 1 MVP** 섹션을 기준으로 하며, 관절 조작·운동 검색·애니메이션은 아직 구현되지 않았습니다.

## 0. 문서 목적

이 문서는 Codex가 웹 기반 3D 근골격계 교육 프로그램의 초기 프로젝트를 생성하고, 기능을 단계적으로 구현할 수 있도록 작성한 개발 산출물이다.

서비스의 핵심 목적은 다음과 같다.

1. 사용자가 남성/여성 3D 신체 모델을 회전·확대·축소하며 해부학 구조를 확인한다.
2. 근육, 인대, 힘줄, 근막, 뼈를 선택적으로 표시하거나 숨긴다.
3. 특정 구조를 클릭하면 이름, 위치, 기시·정지, 기능, 관련 관절과 동작을 확인한다.
4. 관절을 직접 움직이면 해당 동작에 주로 사용되는 근육과 보조 근육이 시각적으로 강조된다.
5. 웨이트 트레이닝, 일반 움직임, 스트레칭 동작을 검색하고 애니메이션으로 재생한다.
6. 동작 단계별로 주동근, 협력근, 안정근, 길항근과 관련 인대·힘줄의 부하 정보를 제공한다.
7. 교육 목적의 자료이며 의료 진단 도구가 아님을 명확히 표시한다.

---

# 1. 프로젝트 정의

## 1.1 프로젝트 가칭

**Motion Anatomy Web**

대체 이름:

- Muscle Motion Atlas
- Human Movement Lab
- Anatomy in Motion
- 근육 움직임 아틀라스

## 1.2 대상 사용자

- 퍼스널 트레이너
- 운동 코치
- 재활·체육 관련 교육자
- 운동 초보자
- 해부학 학습자
- 물리치료·작업치료·스포츠과학 관련 학생
- 운동 동작을 다른 사람에게 설명해야 하는 사용자

## 1.3 서비스 범위

초기 버전은 교육용 근골격계 시각화에 집중한다.

포함:

- 뼈
- 관절
- 주요 골격근
- 주요 인대
- 주요 힘줄
- 주요 근막
- 관절 동작
- 운동 동작
- 스트레칭 동작
- 근육 활성도 표현
- 남성/여성 모델 선택
- 국문/영문 해부학 명칭

초기 버전에서 제외:

- 질병 진단
- 통증 원인 자동 판정
- 치료법 추천
- MRI/CT 판독
- 실제 근전도 수치로 오인될 수 있는 정밀 활성도 예측
- 사용자 사진을 이용한 의료적 자세 진단
- 생체역학 해석 엔진 수준의 힘·토크 계산
- 환자 개인정보 저장

---

# 2. 핵심 설계 원칙

## 2.1 해부학 모델과 동작 모델 분리

3D 모델 자체에 모든 설명을 넣지 않는다.

- 3D 파일: 형상, 골격, 본, 애니메이션
- 데이터베이스: 근육 설명, 관절 동작, 운동별 활성 구조
- 프런트엔드: 선택, 강조, 검색, 재생
- 관리자 기능: 해부학 데이터 수정 및 검수

이 구조를 사용해야 모델을 교체하거나 해부학 설명을 수정하기 쉽다.

## 2.2 근육 활성도는 “교육용 상대값”으로 표현

색상은 실제 근전도 측정값이 아니라 콘텐츠 제작자가 정의한 상대적 기여도다.

예시:

- 0: 사용하지 않음 또는 정보 없음
- 1: 낮은 기여
- 2: 보조
- 3: 중간
- 4: 높음
- 5: 주동근

UI에는 항상 다음 문구를 표시한다.

> 표시되는 활성도는 교육용 상대 표현이며 개인의 자세, 부하, 가동범위, 신체 구조에 따라 달라질 수 있습니다.

## 2.3 성별 옵션의 해석

남성/여성 모델은 평균적인 외형 및 해부학적 비율을 표현하는 선택지다.

- 동일한 해부 구조 ID 체계 사용
- 외형 메시와 일부 골격 비율은 구분 가능
- 특정 성별에만 존재하는 생식 구조는 본 서비스의 기본 범위에서 제외
- 운동 기능 설명은 성별에 따라 임의로 다르게 작성하지 않음
- 구조적 차이가 실제 기능이나 동작 범위에 영향을 주는 항목만 별도 설명

## 2.4 의료 안전 문구

- 의료 진단이나 치료를 대체하지 않음
- 통증이 지속되거나 부상이 의심되면 의료 전문가와 상담
- 인대·힘줄 부하 표시는 정량적인 손상 위험 예측이 아님
- 스트레칭은 무리한 가동범위를 권장하지 않음

---

# 3. 사용자 기능 요구사항

## 3.1 3D 신체 모델 화면

### 필수 기능

- 남성/여성 모델 전환
- 정면, 후면, 좌측, 우측 보기
- 마우스 드래그 회전
- 휠 확대·축소
- 모델 위치 이동
- 초기 시점 복원
- 전체 화면
- 모바일 터치 회전·확대
- 선택 구조 자동 줌
- 선택 구조 외 나머지 반투명 처리
- 구조 단독 보기
- 좌우 구조 동시 선택
- 레이어별 투명도 조절

### 해부학 레이어

1. 피부 또는 외형
2. 표층 근막
3. 근육
4. 힘줄
5. 인대
6. 뼈
7. 관절
8. 심부 구조

각 레이어는 표시/숨김 및 투명도 조절이 가능해야 한다.

## 3.2 구조 클릭 정보

사용자가 근육, 인대, 힘줄, 근막, 뼈 또는 관절을 클릭하면 우측 정보 패널을 표시한다.

### 근육 정보

- 한국어 이름
- 영어 이름
- 라틴어 또는 표준 해부학 명칭
- 구조 유형
- 신체 부위
- 표층/심층 구분
- 좌측/우측
- 기시
- 정지
- 지배 신경
- 주요 기능
- 보조 기능
- 작용 관절
- 관련 움직임
- 관련 운동
- 관련 스트레칭
- 협력근
- 길항근
- 흔한 오해
- 교육용 주의사항
- 출처와 최종 검수일

### 인대 정보

- 연결하는 뼈 또는 관절
- 관절 안정화 역할
- 제한하는 움직임
- 긴장도가 증가하는 자세
- 관련 운동 및 주의점
- 손상 진단으로 오인하지 않도록 주의 문구

### 힘줄 정보

- 연결 근육
- 부착 부위
- 전달하는 힘
- 관련 관절 동작
- 반복 부하가 커질 수 있는 동작
- 관련 운동

### 근막 정보

- 위치 및 연결 영역
- 주변 근육과의 관계
- 움직임 시 활주 관계
- 교육적으로 설명 가능한 범위
- 과도한 의학적 주장 금지

### 뼈 및 관절 정보

- 관절 유형
- 주요 관절면
- 가능한 움직임
- 정상 가동범위는 범위값과 출처가 있을 때만 표시
- 관련 근육·인대·힘줄

## 3.3 직접 관절 조작

사용자가 모델의 관절 핸들을 드래그하거나 각도 슬라이더를 움직여 자세를 변경한다.

### 지원할 기본 관절

- 목
- 흉추
- 요추
- 어깨
- 견갑골
- 팔꿈치
- 전완
- 손목
- 고관절
- 무릎
- 발목

### 기본 관절 동작

- 굴곡 / 신전
- 외전 / 내전
- 외회전 / 내회전
- 수평 외전 / 수평 내전
- 회내 / 회외
- 배측굴곡 / 저측굴곡
- 내번 / 외번
- 견갑골 거상 / 하강
- 견갑골 전인 / 후인
- 견갑골 상방회전 / 하방회전
- 몸통 회전
- 몸통 측굴

### 직접 조작 시 처리

1. 현재 관절 각도를 계산한다.
2. 해당 관절의 주된 동작을 판정한다.
3. `movement_muscle_roles` 데이터에서 관련 구조를 조회한다.
4. 주동근, 협력근, 안정근, 길항근을 서로 다른 강도로 표시한다.
5. 움직임 방향에 따라 단축 경향과 신장 경향을 구분한다.
6. 각도 제한을 적용해 비현실적인 관절 자세를 방지한다.
7. 초기 버전에서는 충돌 시뮬레이션이나 실제 인대 장력 계산은 수행하지 않는다.

## 3.4 동작 및 운동 라이브러리

탐색 영역을 다음 세 가지 최상위 메뉴로 구분한다.

### A. 웨이트 트레이닝

하위 분류:

- 하체
- 가슴
- 등
- 어깨
- 팔
- 코어
- 전신
- 맨몸
- 바벨
- 덤벨
- 머신
- 케이블

초기 등록 동작:

- 스쿼트
- 프런트 스쿼트
- 고블릿 스쿼트
- 런지
- 리버스 런지
- 불가리안 스플릿 스쿼트
- 데드리프트
- 루마니안 데드리프트
- 벤치프레스
- 덤벨 체스트 프레스
- 인클라인 덤벨 프레스
- 푸쉬업
- 풀업
- 친업
- 랫풀다운
- 바벨 로우
- 덤벨 로우
- 오버헤드 프레스
- 덤벨 숄더 프레스
- 사이드 레터럴 레이즈
- 프런트 레이즈
- 리어 델트 플라이
- 바이셉 컬
- 트라이셉 익스텐션
- 플랭크
- 힙 쓰러스트
- 카프 레이즈

### B. 움직임

하위 분류:

- 걷기
- 달리기
- 점프
- 착지
- 밀기
- 당기기
- 들기
- 던지기
- 회전
- 일상 동작

초기 등록 동작:

- 두발 수직 점프
- 한발 수직 점프
- 두발 착지
- 한발 착지
- 걷기
- 달리기
- 계단 오르기
- 앉기
- 일어나기
- 물건 들어 올리기
- 팔 뻗기
- 몸통 회전
- 오버헤드 리치

### C. 스트레칭

하위 분류:

- 목
- 어깨
- 가슴
- 등
- 팔
- 손목
- 고관절
- 둔근
- 대퇴 전면
- 대퇴 후면
- 종아리
- 발목
- 전신
- 동적 스트레칭
- 정적 스트레칭

초기 등록 동작:

- 상부 승모근 스트레칭
- 견갑거근 스트레칭
- 도어웨이 가슴 스트레칭
- 광배근 스트레칭
- 삼두근 스트레칭
- 손목 굴곡근 스트레칭
- 손목 신전근 스트레칭
- 장요근 스트레칭
- 이상근 스트레칭
- 둔근 스트레칭
- 대퇴사두근 스트레칭
- 햄스트링 스트레칭
- 내전근 스트레칭
- 비복근 스트레칭
- 가자미근 스트레칭
- 발목 배측굴곡 스트레칭
- 캣카우
- 차일드 포즈
- 흉추 회전 스트레칭
- 월드 그레이티스트 스트레치

## 3.5 동작 상세 화면

각 동작 상세 화면은 다음 정보를 포함한다.

- 동작 이름
- 영문 이름
- 분류
- 난이도
- 필요 장비
- 시작 자세
- 수행 순서
- 호흡
- 동작 단계
- 관절별 움직임
- 주동근
- 협력근
- 안정근
- 길항근
- 신장되는 근육
- 관련 인대·힘줄
- 흔한 보상 동작
- 교육용 주의사항
- 애니메이션 속도
- 일시정지
- 프레임 이동
- 시점 변경
- 좌우 반전
- 단계 반복
- 근육 활성 표시 켜기/끄기
- 골격만 보기
- 근육만 보기

### 동작 단계 예시: 스쿼트

1. 준비
2. 하강 초반
3. 하강 후반
4. 최저점
5. 상승 초반
6. 상승 후반
7. 종료

각 단계는 별도의 활성도 값을 가질 수 있어야 한다.

예:

- 대퇴사두근: 0.7 → 0.9
- 대둔근: 0.5 → 1.0
- 햄스트링: 0.4 → 0.6
- 척추기립근: 안정근 0.5 → 0.7

수치는 절대적 EMG 값이 아니라 0~1 사이 교육용 상대값이다.

## 3.6 검색 및 필터

검색 대상:

- 근육명
- 영문명
- 운동명
- 관절명
- 움직임
- 신체 부위
- 장비
- 난이도
- 주동근
- 스트레칭 대상 근육

필터:

- 카테고리
- 신체 부위
- 장비
- 난이도
- 동작 형태
- 단측/양측
- 열린 사슬/닫힌 사슬
- 밀기/당기기
- 주동근
- 관련 관절

검색어 자동완성 및 한글 초성 검색은 후순위 기능으로 둔다.

## 3.7 비교 기능

2개의 운동을 선택해 비교한다.

예:

- 풀업 vs 친업
- 스쿼트 vs 프런트 스쿼트
- 벤치프레스 vs 덤벨 체스트 프레스
- 런지 vs 불가리안 스플릿 스쿼트

비교 항목:

- 주요 관절 움직임
- 주동근
- 협력근
- 안정근
- 장비
- 난이도
- 동작 범위
- 좌우 독립성
- 교육상 차이점

## 3.8 발표·교육 모드

다른 사람에게 설명하기 위한 기능이다.

- UI 최소화
- 전체 화면
- 선택 구조 강조
- 라벨 표시
- 레이저 포인터 형태의 커서
- 단계별 동작 재생
- 재생 속도 0.25x / 0.5x / 1x
- 특정 단계 고정
- 주동근만 보기
- 주동근+협력근 보기
- 구조 설명 카드 표시
- 현재 화면 이미지 저장
- 공유 링크 생성은 로그인 기능 도입 이후 구현

---

# 4. 화면 구성

## 4.1 메인 화면

```text
┌──────────────────────────────────────────────────────────────┐
│ 로고 | 해부학 | 웨이트 | 움직임 | 스트레칭 | 검색 | 설정      │
├──────────────┬──────────────────────────────┬────────────────┤
│ 레이어 패널   │                              │ 구조 정보 패널 │
│              │          3D 모델             │                │
│ 피부         │                              │ 이름           │
│ 근육         │                              │ 역할           │
│ 힘줄         │                              │ 관련 동작      │
│ 인대         │                              │ 관련 운동      │
│ 근막         │                              │ 출처           │
│ 골격         │                              │                │
├──────────────┴──────────────────────────────┴────────────────┤
│ 재생 | 일시정지 | 속도 | 단계 | 활성도 범례 | 초기화          │
└──────────────────────────────────────────────────────────────┘
```

## 4.2 모바일

- 3D 모델을 화면 중심에 배치
- 레이어와 정보 패널은 하단 시트
- 검색은 상단
- 재생 컨트롤은 하단 고정
- 복잡한 직접 관절 조작은 태블릿·데스크톱 우선 지원

## 4.3 URL 구조

```text
/
 /anatomy
 /anatomy/:structureId
 /exercises
 /exercises/:exerciseId
 /movements
 /movements/:movementId
 /stretches
 /stretches/:stretchId
 /compare
 /presentation/:contentId
 /admin
 /admin/structures
 /admin/movements
 /admin/exercises
```

---

# 5. 권장 기술 스택

## 5.1 프런트엔드

- Next.js
- React
- TypeScript
- Three.js
- React Three Fiber
- Drei
- Zustand
- TanStack Query
- Tailwind CSS
- shadcn/ui
- Zod
- React Hook Form

### 선택 이유

- React Three Fiber를 사용하면 Three.js 장면을 React 컴포넌트 구조로 관리할 수 있다.
- 3D 모델은 웹 전송과 애니메이션에 적합한 GLB/glTF 형식을 기본으로 사용한다.
- 구조 클릭은 raycasting 또는 별도 저해상도 선택용 메시로 처리한다.
- 상태는 카메라, 선택 구조, 레이어, 애니메이션, 활성도 상태로 분리한다.

## 5.2 백엔드

초기 권장:

- FastAPI
- Python 3.12 이상
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic
- Redis는 캐시가 필요할 때 추가
- S3 호환 스토리지 또는 Cloudflare R2

대안:

- Next.js Route Handler + PostgreSQL

그러나 해부학 데이터 관리, 검색, 향후 분석 기능을 고려하면 FastAPI 분리가 권장된다.

## 5.3 3D 제작 도구

- Blender
- glTF/GLB Exporter
- Meshopt 또는 Draco 압축
- glTF Transform CLI
- Blender Python 스크립트

## 5.4 배포

초기 개발:

- Docker Compose
- 프런트엔드 컨테이너
- FastAPI 컨테이너
- PostgreSQL 컨테이너
- MinIO 선택
- Nginx 또는 Caddy

운영 후보:

- Vercel + 별도 API
- Cloudflare Pages/Workers 조합
- AWS
- Azure
- GCP
- 국내 클라우드

운영 플랫폼은 3D 파일 전송량과 CDN 비용을 먼저 비교한 뒤 선택한다.

---

# 6. 3D 에셋 요구사항

## 6.1 모델 구성 방식

하나의 거대한 메시로 만들지 않는다.

권장 계층:

```text
HumanModel
 ├─ Skeleton
 │   ├─ pelvis
 │   ├─ femur_l
 │   └─ ...
 ├─ Muscles
 │   ├─ gluteus_maximus_l
 │   ├─ gluteus_maximus_r
 │   └─ ...
 ├─ Tendons
 ├─ Ligaments
 ├─ Fascia
 ├─ Skin
 └─ SelectionProxies
```

각 구조는 고유하고 안정적인 `anatomy_id`를 가진다.

예:

```text
MUSCLE_GLUTEUS_MAXIMUS_L
MUSCLE_GLUTEUS_MAXIMUS_R
TENDON_ACHILLES_L
LIGAMENT_ACL_L
FASCIA_THORACOLUMBAR
BONE_FEMUR_L
JOINT_HIP_L
```

## 6.2 모델 파일 분할

초기 로딩 속도를 위해 다음 중 하나를 사용한다.

### 방식 A: 영역별 GLB

- body-base.glb
- muscles-upper.glb
- muscles-lower.glb
- ligaments-upper.glb
- ligaments-lower.glb
- tendons.glb
- fascia.glb

### 방식 B: LOD 기반 단일 모델

- low
- medium
- high

MVP에서는 영역별 GLB + 저해상도 모델을 권장한다.

## 6.3 모델 최적화 기준

- 첫 화면 전송량 목표: 10~20MB 이하
- 전체 고해상도 모델은 필요할 때 지연 로딩
- 텍스처는 WebP/AVIF 또는 KTX2 검토
- 메시 압축
- 불필요한 버텍스 제거
- 모바일 저사양 모드 제공
- 선택 판정은 고해상도 SkinnedMesh 전체가 아니라 selection proxy 사용
- 보이지 않는 레이어는 렌더링 비활성화
- 그림자 품질 단계 제공
- 3D 지원 실패 시 2D 이미지 대체 화면 제공

## 6.4 남성/여성 모델

두 모델은 동일한 골격 본 이름과 해부학 구조 ID를 사용하는 것이 중요하다.

예:

```text
male.glb:
  bone name = femur_l
  anatomy id = BONE_FEMUR_L

female.glb:
  bone name = femur_l
  anatomy id = BONE_FEMUR_L
```

이렇게 해야 동일한 애니메이션과 데이터 매핑을 최대한 재사용할 수 있다.

## 6.5 라이선스 확인

무료 공개 해부학 모델을 그대로 상업 서비스에 넣기 전에 반드시 확인해야 한다.

확인 항목:

- 상업적 사용 가능 여부
- 저작자 표시 의무
- 동일 조건 변경 허락 의무
- 수정 모델 재배포 조건
- 데이터와 렌더 이미지의 라이선스 차이
- 남성/여성 모델 모두 제공되는지
- 교육용 서비스에 사용할 수 있는지
- 사용자에게 모델 파일이 직접 노출되는 구조인지

BodyParts3D 계열 데이터는 출처와 라이선스 조건을 반드시 검토하고, 남성 모델 중심이라는 한계도 고려한다.

---

# 7. 애니메이션 및 동작 시스템

## 7.1 기본 구조

```text
Exercise
 └─ AnimationClip
     ├─ Phase 1
     ├─ Phase 2
     ├─ Phase 3
     └─ Phase N
```

각 애니메이션 클립은 `movement_timeline` 데이터와 연결한다.

## 7.2 애니메이션 데이터 예시

```json
{
  "exerciseId": "barbell_back_squat",
  "animationClip": "squat_standard",
  "duration": 4.0,
  "loop": true,
  "phases": [
    {
      "id": "setup",
      "start": 0.0,
      "end": 0.5
    },
    {
      "id": "descent",
      "start": 0.5,
      "end": 1.8
    },
    {
      "id": "bottom",
      "start": 1.8,
      "end": 2.2
    },
    {
      "id": "ascent",
      "start": 2.2,
      "end": 3.5
    },
    {
      "id": "finish",
      "start": 3.5,
      "end": 4.0
    }
  ]
}
```

## 7.3 근육 활성 타임라인

```json
{
  "exerciseId": "barbell_back_squat",
  "structureId": "MUSCLE_GLUTEUS_MAXIMUS",
  "role": "agonist",
  "samples": [
    { "time": 0.0, "activation": 0.2 },
    { "time": 1.0, "activation": 0.5 },
    { "time": 2.0, "activation": 0.8 },
    { "time": 3.0, "activation": 1.0 },
    { "time": 4.0, "activation": 0.2 }
  ],
  "evidenceLevel": "editorial"
}
```

프런트엔드는 현재 애니메이션 시간에 가장 가까운 값을 보간해 재질 강조도를 변경한다.

## 7.4 역할 분류

- agonist: 주동근
- synergist: 협력근
- stabilizer: 안정근
- antagonist: 길항근
- stretched: 주로 늘어나는 구조
- loaded_tendon: 부하가 전달되는 힘줄
- stabilizing_ligament: 관절 안정화에 관여하는 인대

## 7.5 색상 표현 권장

색상만으로 의미를 전달하지 말고 범례와 패턴을 함께 제공한다.

예:

- 주동근: 가장 강한 발광 또는 채도
- 협력근: 중간 강조
- 안정근: 윤곽선
- 길항근: 다른 패턴
- 스트레칭 대상: 길이 방향 흐름 효과
- 힘줄·인대: 별도 재질과 범례

색각 이상 사용자를 위해 대체 팔레트와 텍스트 목록을 제공한다.

---

# 8. 데이터 모델

## 8.1 주요 테이블

### anatomy_structures

```sql
id
code
name_ko
name_en
name_latin
structure_type
body_region
side
depth
description
origin_text
insertion_text
innervation_text
function_text
medical_disclaimer
model_node_name
parent_structure_id
source_id
review_status
reviewed_by
reviewed_at
created_at
updated_at
```

`structure_type`:

```text
muscle
tendon
ligament
fascia
bone
joint
nerve
other
```

초기 서비스는 nerve를 숨겨두고 확장 가능하게 만든다.

### movements

```sql
id
code
name_ko
name_en
joint_id
plane
axis
description
default_min_angle
default_max_angle
created_at
updated_at
```

### movement_structure_roles

```sql
id
movement_id
structure_id
role
contribution_level
length_change
notes
source_id
review_status
```

`length_change`:

```text
shortening
lengthening
isometric
variable
unknown
```

### contents

운동, 일반 움직임, 스트레칭을 하나의 공통 테이블로 관리한다.

```sql
id
slug
content_type
name_ko
name_en
summary
difficulty
equipment
body_region
laterality
kinetic_chain
instructions
breathing
cautions
thumbnail_url
animation_asset_id
published
review_status
created_at
updated_at
```

`content_type`:

```text
weight_training
movement
stretch
```

### content_phases

```sql
id
content_id
phase_order
phase_code
name_ko
start_time
end_time
description
```

### content_phase_structures

```sql
id
content_phase_id
structure_id
role
activation
load_level
length_change
notes
evidence_level
source_id
```

### content_joint_actions

```sql
id
content_phase_id
joint_id
movement_id
angle_from
angle_to
notes
```

### sources

```sql
id
title
authors
organization
publication_year
url
license
citation_text
accessed_at
```

### assets

```sql
id
asset_type
model_variant
url
file_size
hash
version
license
attribution
created_at
```

## 8.2 검수 상태

```text
draft
editor_review
expert_review
approved
deprecated
```

해부학 설명과 운동별 근육 역할은 관리자 승인 전 공개하지 않는다.

---

# 9. API 설계

## 9.1 구조 조회

```http
GET /api/v1/anatomy/structures
GET /api/v1/anatomy/structures/{id}
GET /api/v1/anatomy/structures/{id}/related-contents
GET /api/v1/anatomy/search?q=대둔근
```

## 9.2 동작 조회

```http
GET /api/v1/movements
GET /api/v1/movements/{id}
GET /api/v1/movements/{id}/structures
POST /api/v1/movements/evaluate
```

직접 관절 조작 평가 요청 예시:

```json
{
  "jointCode": "JOINT_SHOULDER_L",
  "fromRotation": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "toRotation": {
    "x": 0,
    "y": 0,
    "z": 45
  }
}
```

응답:

```json
{
  "movementCode": "SHOULDER_ABDUCTION",
  "direction": "positive",
  "structures": [
    {
      "structureCode": "MUSCLE_DELTOID_MIDDLE_L",
      "role": "agonist",
      "contribution": 0.95
    },
    {
      "structureCode": "MUSCLE_SUPRASPINATUS_L",
      "role": "synergist",
      "contribution": 0.75
    }
  ]
}
```

MVP에서는 이 계산을 프런트엔드의 정적 매핑으로 처리해도 된다.

## 9.3 콘텐츠 조회

```http
GET /api/v1/contents
GET /api/v1/contents/{slug}
GET /api/v1/contents/{slug}/timeline
GET /api/v1/contents/compare?ids=pull-up,chin-up
```

검색 예시:

```http
GET /api/v1/contents?type=weight_training&bodyRegion=shoulder
GET /api/v1/contents?targetStructure=MUSCLE_DELTOID_MIDDLE
GET /api/v1/contents?q=스쿼트
```

## 9.4 관리자 API

```http
POST   /api/v1/admin/structures
PATCH  /api/v1/admin/structures/{id}
POST   /api/v1/admin/contents
PATCH  /api/v1/admin/contents/{id}
POST   /api/v1/admin/contents/{id}/phases
POST   /api/v1/admin/assets
POST   /api/v1/admin/reviews
```

---

# 10. 프런트엔드 컴포넌트 구조

```text
src/
 ├─ app/
 │   ├─ anatomy/
 │   ├─ exercises/
 │   ├─ movements/
 │   ├─ stretches/
 │   ├─ compare/
 │   └─ admin/
 ├─ components/
 │   ├─ anatomy/
 │   │   ├─ AnatomyCanvas.tsx
 │   │   ├─ HumanModel.tsx
 │   │   ├─ AnatomyLayerPanel.tsx
 │   │   ├─ StructureInfoPanel.tsx
 │   │   ├─ StructureHighlight.tsx
 │   │   ├─ SelectionProxy.tsx
 │   │   ├─ JointManipulator.tsx
 │   │   └─ CameraControls.tsx
 │   ├─ motion/
 │   │   ├─ MotionPlayer.tsx
 │   │   ├─ Timeline.tsx
 │   │   ├─ PhaseSelector.tsx
 │   │   ├─ ActivationLegend.tsx
 │   │   └─ JointActionPanel.tsx
 │   ├─ catalog/
 │   │   ├─ ContentSearch.tsx
 │   │   ├─ CategoryFilter.tsx
 │   │   ├─ ContentCard.tsx
 │   │   └─ ComparisonTable.tsx
 │   └─ common/
 ├─ stores/
 │   ├─ anatomyStore.ts
 │   ├─ motionStore.ts
 │   ├─ viewerStore.ts
 │   └─ settingsStore.ts
 ├─ lib/
 │   ├─ api/
 │   ├─ three/
 │   ├─ anatomy/
 │   └─ validation/
 ├─ types/
 └─ data/
```

---

# 11. 상태 관리

## 11.1 viewerStore

```ts
type ViewerState = {
  sexModel: "male" | "female";
  selectedStructureIds: string[];
  hoveredStructureId: string | null;
  cameraPreset: "front" | "back" | "left" | "right" | "free";
  layerVisibility: Record<string, boolean>;
  layerOpacity: Record<string, number>;
  isolateMode: boolean;
  presentationMode: boolean;
};
```

## 11.2 motionStore

```ts
type MotionState = {
  contentId: string | null;
  clipName: string | null;
  isPlaying: boolean;
  currentTime: number;
  playbackRate: 0.25 | 0.5 | 1;
  currentPhaseId: string | null;
  activationMap: Record<string, number>;
  roleMap: Record<string, AnatomyRole>;
};
```

## 11.3 anatomyStore

```ts
type AnatomyState = {
  structuresById: Record<string, AnatomyStructure>;
  searchQuery: string;
  selectedBodyRegions: string[];
  selectedStructureTypes: string[];
};
```

---

# 12. 머티리얼 강조 로직

의사 코드:

```ts
function getStructureVisualState(
  structureId: string,
  activationMap: Record<string, number>,
  roleMap: Record<string, AnatomyRole>,
  selectedIds: string[],
  hoveredId: string | null
) {
  const activation = activationMap[structureId] ?? 0;
  const role = roleMap[structureId] ?? "none";
  const selected = selectedIds.includes(structureId);
  const hovered = hoveredId === structureId;

  return {
    emissiveIntensity:
      selected ? 1.4 :
      hovered ? 1.0 :
      activation * 0.8,
    opacity:
      selected ? 1 :
      activation > 0 ? 0.95 :
      0.25,
    role
  };
}
```

원본 머티리얼을 직접 계속 수정하지 말고 구조별 상태를 계산해 렌더링한다.

---

# 13. 성능 요구사항

- 일반 데스크톱에서 첫 화면 5초 이내 목표
- 3D 뷰어 조작 시 평균 45FPS 이상 목표
- 저사양 모드 30FPS 이상 목표
- 모델 로딩 중 진행률 표시
- 모델 파일 캐싱
- 화면 밖 또는 숨김 레이어 렌더링 최소화
- API 응답 500ms 이내 목표
- 검색 결과 1초 이내
- 메모리 누수를 막기 위해 geometry/material/texture dispose 처리
- 페이지 이동 시 AnimationMixer 및 이벤트 리스너 정리
- 동일 GLB 중복 로딩 방지
- WebGL context lost 처리
- 모바일에서는 고해상도 근막 레이어 기본 비활성화

---

# 14. 접근성 요구사항

- 키보드로 검색 및 패널 조작 가능
- 3D 모델 외 텍스트 목록으로도 동일 정보 제공
- 색상 외에 라벨·패턴·범례 제공
- 명도 대비 준수
- 애니메이션 감소 설정 지원
- 스크린리더용 구조 이름 및 상태 제공
- 자막 또는 텍스트 단계 설명
- 전체 화면 종료 키 제공
- 모바일 터치 영역 최소 크기 준수

---

# 15. 보안 요구사항

- 관리자 기능 인증
- 역할 기반 권한
- 입력값 검증
- 업로드 파일 MIME 및 확장자 검증
- 3D 파일 크기 제한
- 관리자 HTML 입력 sanitize
- API rate limit
- CORS 제한
- 비밀정보 환경변수 관리
- 운영 로그에 개인정보 저장 금지
- 에셋 해시 검증
- 라이선스 메타데이터 삭제 금지
- 공개 API에서 내부 저장소 경로 노출 금지

---

# 16. 콘텐츠 제작 및 검수 프로세스

## 16.1 역할

- 3D 아티스트: 모델 분리, 리깅, 애니메이션
- 개발자: 뷰어, API, 관리자 기능
- 운동 전문가: 동작 단계와 근육 역할 작성
- 해부학 검수자: 구조 설명 검수
- 콘텐츠 관리자: 출처, 라이선스, 수정 이력 관리

## 16.2 콘텐츠 등록 흐름

1. 초안 작성
2. 출처 입력
3. 운동 전문가 검토
4. 해부학 전문가 검토
5. 3D 노드 매핑 확인
6. 애니메이션과 활성 타임라인 동기화
7. 접근성 확인
8. 승인
9. 공개
10. 변경 이력 보존

---

# 17. 테스트 전략

## 17.1 단위 테스트

- 활성도 시간 보간
- 구조 ID 매핑
- 관절 움직임 판정
- 필터링
- 검색
- 레이어 상태
- 역할별 스타일 변환
- API 스키마 검증

## 17.2 통합 테스트

- 구조 클릭 → 정보 패널 표시
- 운동 선택 → 애니메이션 로드
- 애니메이션 시간 → 근육 강조 동기화
- 성별 모델 전환 후 동일 구조 선택 유지
- 레이어 숨김
- 직접 관절 조작 후 관련 근육 표시
- 검색 결과에서 상세 화면 이동

## 17.3 E2E 테스트

Playwright 사용.

필수 시나리오:

1. 메인 화면 접속
2. 여성 모델 선택
3. 근육 레이어 표시
4. 대둔근 클릭
5. 설명 패널 확인
6. 관련 운동에서 스쿼트 선택
7. 애니메이션 재생
8. 최저점 단계 정지
9. 주동근 강조 확인
10. 발표 모드 진입

## 17.4 3D 검수

- 좌우 구조가 뒤바뀌지 않았는지
- 구조 선택 ID가 정확한지
- 모델 관통이 과도하지 않은지
- 관절 범위가 비현실적이지 않은지
- 남성/여성 모델에서 동일 애니메이션이 깨지지 않는지
- 모바일에서 텍스처 및 메시가 과도하지 않은지

---

# 18. 단계별 개발 로드맵

## Phase 0. 사전 조사 및 에셋 검증

산출물:

- 3D 모델 후보 목록
- 라이선스 검토표
- 남성/여성 모델 확보 전략
- 해부학 구조 ID 규칙
- 초기 운동 10개 목록
- 해부학 검수 담당 정의
- 프로토타입 성능 테스트

종료 조건:

- 상업·교육적 사용이 가능한 모델 확보
- 구조별 분리 또는 분리 가능한 원본 확보
- 동일한 골격 체계로 애니메이션 적용 가능성 확인

## Phase 1. 3D 뷰어 MVP

구현:

- Next.js 프로젝트
- 3D GLB 로딩
- 회전, 줌, 이동
- 레이어 표시
- 구조 클릭
- 구조 정보 패널
- 남성/여성 모델 전환
- 정적 샘플 데이터
- 반응형 기본 UI

초기 구조:

- 주요 뼈 20개 이상
- 주요 근육 30개 이상
- 주요 인대·힘줄·근막 각 5개 이상

종료 조건:

- 모델의 개별 구조를 안정적으로 클릭할 수 있음
- 선택 구조 정보가 표시됨
- 구조 ID와 데이터가 정확히 연결됨

## Phase 2. 운동 애니메이션 MVP

초기 운동:

1. 스쿼트
2. 런지
3. 데드리프트
4. 벤치프레스
5. 덤벨 숄더 프레스
6. 사이드 레터럴 레이즈
7. 풀업
8. 친업
9. 푸쉬업
10. 두발 점프

구현:

- 애니메이션 재생
- 단계 구분
- 활성도 타임라인
- 역할별 강조
- 단계 설명
- 속도 변경
- 반복 재생
- 프레임 이동

종료 조건:

- 10개 동작에서 애니메이션과 근육 강조가 동기화됨
- 각 동작별 설명과 출처가 등록됨

## Phase 3. 직접 관절 조작

구현:

- 주요 관절 핸들
- 각도 슬라이더
- 관절 제한
- 동작 판정
- 관련 근육 강조
- 단축/신장 표시
- 원상 복구
- 좌우 동기 또는 독립 조작

종료 조건:

- 어깨, 팔꿈치, 고관절, 무릎, 발목의 기본 움직임 지원
- 잘못된 각도 입력을 제한
- 관련 근육 데이터가 표시됨

## Phase 4. 콘텐츠 라이브러리

구현:

- 웨이트 / 움직임 / 스트레칭 메뉴
- 검색
- 필터
- 즐겨찾기
- 최근 본 항목
- 운동 비교
- 관련 콘텐츠 추천
- 발표 모드

종료 조건:

- 콘텐츠 50개 이상
- 검색과 필터가 모바일에서도 사용 가능
- 모든 공개 콘텐츠가 검수 상태 approved

## Phase 5. 관리자 및 운영 기능

구현:

- 구조 관리
- 동작 관리
- 운동 단계 관리
- 활성도 편집
- 출처 관리
- 검수 상태
- 변경 이력
- 에셋 버전
- 오류 신고

## Phase 6. 고급 기능

후순위 후보:

- 사용자 자세 업로드와 단순 관절 각도 비교
- 카메라 기반 모션 캡처
- WebXR
- 강사 공유 링크
- 수업용 플레이리스트
- 한국어/영어 다국어
- 퀴즈
- 구조 암기 모드
- 운동별 관절 궤적 표시
- 2개 운동 나란히 애니메이션 비교
- 사용자 정의 동작 편집기
- 근육군별 필터
- 교육기관 계정

고급 기능은 의료 진단으로 해석되지 않도록 범위를 엄격히 제한한다.

---

# 19. MVP에서 반드시 줄여야 할 범위

처음부터 전신 모든 근육, 모든 인대, 모든 운동을 구현하면 실패 가능성이 높다.

권장 MVP 범위:

- 성별 모델 2종
- 골격
- 주요 근육 30~50개
- 주요 힘줄 10개
- 주요 인대 10개
- 주요 근막 5개
- 운동 10개
- 스트레칭 10개
- 기본 관절 움직임 12개
- 구조 클릭
- 운동 애니메이션
- 근육 강조
- 검색
- 관리자 없이 JSON seed로 시작

관리자 화면은 모델·데이터 구조가 안정화된 후 개발한다.

---

# 20. 추가로 반드시 결정해야 할 사항

## 20.1 사업 및 라이선스

- 무료 서비스인지 유료 서비스인지
- 상업적 이용 여부
- 모델 파일의 재배포 방지 필요 여부
- 오픈소스 라이선스와 서비스 라이선스의 양립 여부
- 전문가 감수 비용
- 3D 아티스트 제작 비용
- CDN 전송 비용
- 번역 비용

## 20.2 해부학 정확성

- 어떤 해부학 표준 명칭을 사용할지
- 한국어 표준 용어와 일반 운동 용어를 어떻게 병기할지
- 기시·정지 정보의 출처
- 동작별 근육 기여도를 누가 승인할지
- EMG 문헌을 쓸 경우 연구마다 조건이 다른 문제를 어떻게 표현할지
- 근막 관련 설명에서 근거가 약한 주장을 배제할 기준

## 20.3 3D 제작

- 기존 모델 구매 또는 자체 제작
- 남녀 모델 골격 호환 여부
- 근육 변형이 관절 움직임에 따라 자연스럽게 보일 필요 수준
- 근육이 실제로 수축해 부피가 바뀌는 표현을 넣을지
- 인대·힘줄의 변형을 단순 시각 효과로 처리할지
- 운동 기구 모델 제작 범위
- 의상 또는 피부 레이어 처리

## 20.4 운영

- 로그인 필요 여부
- 즐겨찾기 저장 여부
- 강사 자료 공유 여부
- 익명 사용 통계 수집 여부
- 콘텐츠 오류 신고 처리 흐름
- 전문가 검수 갱신 주기
- 3D 에셋 버전 관리 방식

---

# 21. Codex 작업 규칙

Codex는 다음 규칙을 따라야 한다.

1. 한 번에 전체 서비스를 완성하려 하지 않는다.
2. Phase 단위로 브랜치를 나눈다.
3. 먼저 더미 모델과 샘플 JSON으로 기능을 검증한다.
4. 3D 모델 라이선스가 확정되기 전 실제 모델을 저장소에 커밋하지 않는다.
5. 모든 구조는 문자열 이름이 아닌 안정적인 ID로 연결한다.
6. UI 텍스트와 해부학 데이터는 컴포넌트에 하드코딩하지 않는다.
7. 근육 활성 수치를 실제 의료 수치로 표현하지 않는다.
8. 의료 진단 문구를 생성하지 않는다.
9. TypeScript strict 모드를 사용한다.
10. API와 프런트 타입을 공유하거나 스키마에서 생성한다.
11. 테스트 없는 핵심 계산 로직을 만들지 않는다.
12. GLB 로딩 실패, WebGL 실패, 모바일 저사양을 처리한다.
13. 렌더링 루프에서 React state를 매 프레임 갱신하지 않는다.
14. 프레임 단위 값은 ref 또는 Three.js 객체에서 관리한다.
15. 모델 교체가 가능하도록 viewer와 asset mapping을 분리한다.
16. 접근성용 텍스트 목록을 반드시 제공한다.
17. 에셋 출처와 라이선스 메타데이터를 보존한다.
18. 커밋 전 lint, typecheck, unit test를 실행한다.

---

# 22. 권장 저장소 구조

```text
motion-anatomy/
 ├─ apps/
 │   ├─ web/
 │   └─ api/
 ├─ packages/
 │   ├─ shared-types/
 │   ├─ anatomy-schema/
 │   ├─ ui/
 │   └─ eslint-config/
 ├─ assets/
 │   ├─ README.md
 │   └─ sample/
 ├─ data/
 │   ├─ seed/
 │   └─ schemas/
 ├─ docs/
 │   ├─ architecture.md
 │   ├─ asset-pipeline.md
 │   ├─ anatomy-id-convention.md
 │   ├─ medical-disclaimer.md
 │   └─ licenses.md
 ├─ docker-compose.yml
 ├─ .env.example
 ├─ package.json
 └─ README.md
```

---

# 23. 첫 번째 스프린트 작업 목록

## Sprint 1 목표

샘플 GLB 모델에서 개별 구조를 클릭하고 정보 패널을 표시한다.

### 작업

- [ ] Monorepo 생성
- [ ] Next.js + TypeScript strict 구성
- [ ] FastAPI 기본 서버 구성
- [ ] PostgreSQL Docker 구성
- [ ] 공유 타입 정의
- [ ] AnatomyCanvas 구현
- [ ] GLB loader 구현
- [ ] OrbitControls 구현
- [ ] 구조 hover 구현
- [ ] 구조 click 구현
- [ ] 선택 구조 강조
- [ ] 레이어 표시/숨김
- [ ] 정보 패널 구현
- [ ] 샘플 anatomy JSON 10개 작성
- [ ] 모델 node name → anatomy ID 매핑 파일 작성
- [ ] 로딩 및 오류 화면
- [ ] 단위 테스트
- [ ] Playwright 기본 테스트
- [ ] README 실행 방법 작성

### 완료 기준

- `docker compose up`으로 API와 DB 실행 가능
- 웹은 한 명령으로 실행 가능
- 샘플 모델 회전·확대 가능
- 메시 클릭 시 정확한 구조 정보 표시
- 레이어 숨김 가능
- 테스트 통과

---

# 24. Codex에 처음 전달할 실행 프롬프트

아래 내용을 Codex에 그대로 전달한다.

```text
당신은 시니어 풀스택 개발자이자 WebGL/Three.js 아키텍트입니다.

첨부한 “3D 근골격계 동작 시각화 웹서비스 개발 명세서”를 기준으로 프로젝트를 시작하세요.

이번 작업 범위는 전체 서비스가 아니라 Phase 1의 첫 번째 스프린트입니다.

목표:
- 샘플 GLB 모델을 웹에서 로드한다.
- 모델을 회전, 확대, 축소할 수 있다.
- GLB 내부의 개별 메시를 hover 및 click할 수 있다.
- 선택한 구조를 강조한다.
- 구조 ID에 연결된 한국어/영어 이름과 설명을 우측 패널에 표시한다.
- 근육, 인대, 힘줄, 근막, 골격 레이어 표시 여부를 제어한다.
- 남성/여성 모델 선택 UI를 만들되, 초기에는 동일한 샘플 GLB를 사용해도 된다.
- 실제 해부학 모델은 저장소에 포함하지 말고 public/models/sample-human.glb 경로만 가정한다.

기술:
- pnpm workspace 기반 monorepo
- apps/web: Next.js, React, TypeScript strict
- 3D: three, @react-three/fiber, @react-three/drei
- 상태: Zustand
- 스타일: Tailwind CSS
- 테스트: Vitest, React Testing Library, Playwright
- apps/api: FastAPI
- DB: PostgreSQL + Docker Compose
- 스키마: Pydantic 및 Zod
- lint, format, typecheck 명령 제공

구현 규칙:
1. UI와 3D 뷰어 로직을 분리한다.
2. anatomy ID와 model node name을 매핑 파일로 관리한다.
3. 컴포넌트 내부에 해부학 설명을 하드코딩하지 않는다.
4. 샘플 데이터는 JSON seed 파일로 관리한다.
5. 렌더 루프에서 React setState를 매 프레임 호출하지 않는다.
6. GLB 로딩 실패와 WebGL 미지원 UI를 제공한다.
7. 선택용 mesh 또는 raycasting 구조를 별도 모듈로 만든다.
8. 모든 주요 함수와 타입에 설명을 작성한다.
9. README에 Windows PowerShell 기준 실행 방법도 포함한다.
10. 실제 의료 진단 기능이나 실제 EMG 값이라고 표현하는 기능은 만들지 않는다.

먼저 다음 문서를 작성하고 코드를 구현하세요.
- docs/architecture.md
- docs/anatomy-id-convention.md
- docs/asset-pipeline.md
- docs/licenses.md
- README.md

그 다음 프로젝트 파일을 생성하세요.

최종 응답에는 다음을 포함하세요.
- 생성·수정한 파일 목록
- 주요 아키텍처 설명
- 실행 명령
- 테스트 명령
- 아직 구현하지 않은 항목
- 다음 스프린트 권장 작업
```

---

# 25. Phase 2용 Codex 후속 프롬프트

```text
현재 Phase 1의 3D 구조 선택 기능이 완료되었습니다.

이제 운동 애니메이션과 근육 활성도 시각화 기능을 구현하세요.

대상 운동:
- 스쿼트
- 런지
- 데드리프트
- 벤치프레스
- 덤벨 숄더 프레스
- 사이드 레터럴 레이즈
- 풀업
- 친업
- 푸쉬업
- 두발 점프

요구사항:
- GLB AnimationClip을 재생한다.
- 동작별 phase 데이터를 JSON으로 관리한다.
- phase별 주동근, 협력근, 안정근, 길항근을 관리한다.
- 0~1 상대 활성도 값을 시간에 따라 보간한다.
- 활성도는 실제 EMG 수치가 아니라 교육용 상대값임을 UI에 표시한다.
- 재생, 정지, 속도, 반복, 단계 이동 기능을 만든다.
- 현재 phase와 관련 근육 목록을 텍스트로도 표시한다.
- 선택한 역할만 필터링할 수 있게 한다.
- 색상만으로 역할을 구분하지 않는다.
- animation mixer 및 material 자원을 정상적으로 정리한다.
- 활성도 보간 함수의 단위 테스트를 작성한다.
- 스쿼트 1개를 완성한 후 나머지 운동을 확장할 수 있는 데이터 구조로 만든다.

작업 전 기존 구조를 분석하고, 변경 계획을 먼저 제시한 다음 구현하세요.
```

---

# 26. 개발 승인 체크리스트

## 기능

- [ ] 남성/여성 전환
- [ ] 3D 회전·확대·축소
- [ ] 레이어 표시
- [ ] 구조 클릭
- [ ] 구조 설명
- [ ] 운동 검색
- [ ] 동작 재생
- [ ] 단계 이동
- [ ] 근육 활성 표시
- [ ] 직접 관절 조작
- [ ] 스트레칭 대상 표시
- [ ] 발표 모드

## 정확성

- [ ] 구조 ID 검수
- [ ] 좌우 검수
- [ ] 기시·정지 출처
- [ ] 운동별 역할 출처
- [ ] 전문가 승인
- [ ] 의료 면책 문구
- [ ] 근막 관련 과장 표현 없음

## 기술

- [ ] 초기 로딩 용량
- [ ] 평균 FPS
- [ ] 모바일 저사양 모드
- [ ] WebGL 오류 처리
- [ ] 메모리 정리
- [ ] 접근성
- [ ] E2E 테스트
- [ ] 에셋 라이선스 기록

---

# 27. 최종 권장 방향

이 프로젝트의 가장 큰 난점은 웹 코드보다 다음 세 가지다.

1. 개별 구조가 분리되고 리깅된 고품질 남녀 해부학 모델 확보
2. 운동 단계별 근육 역할을 신뢰할 수 있게 작성하고 검수하는 작업
3. 고용량 3D 데이터를 웹에서 원활하게 렌더링하는 최적화

따라서 먼저 “완벽한 전신 해부학 서비스”를 목표로 하지 말고, 샘플 모델과 스쿼트 한 동작으로 전체 파이프라인을 검증한다.

최초 성공 기준은 다음과 같다.

> 사용자가 3D 모델의 대둔근을 클릭해 설명을 확인하고, 스쿼트 애니메이션을 재생했을 때 동작 단계에 따라 대둔근·대퇴사두근·척추기립근 등의 역할이 구분되어 표시되는 것.

이 흐름이 안정적으로 작동한 뒤 근육 수, 운동 수, 인대·힘줄·근막 범위를 확장한다.

---

# 28. 참고 기술 및 데이터

- Three.js documentation: https://threejs.org/docs/
- React Three Fiber documentation: https://r3f.docs.pmnd.rs/
- Khronos glTF: https://www.khronos.org/gltf/
- glTF 2.0 specification: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- BodyParts3D / Anatomography: https://lifesciencedb.jp/bp3d/?lng=en

참고 자료를 실제 서비스에 적용할 때는 최신 라이선스 원문과 배포 조건을 별도로 확인해야 한다.
