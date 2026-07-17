# Motion Anatomy

교육용 3D 인체 구조 탐색 웹앱의 Sprint 1 MVP입니다. 사용자는 절차형 샘플 모델을 회전·확대하고, 구조를 선택하거나 해부학 레이어를 숨기면서 한·영 정보를 확인할 수 있습니다.

> 이 프로젝트는 교육용 프로토타입입니다. 표시되는 정보는 의료 진단이나 치료를 대체하지 않습니다.

## 현재 범위

- Next.js 16 + React 19 + React Three Fiber 3D 뷰어
- 뼈·근육·힘줄·인대·근막 레이어 토글
- 구조 hover/click, 선택 강조, 한·영 정보 패널
- 남성·여성 샘플 모델 및 카메라 시점 전환
- 접근 가능한 구조 목록과 모바일 반응형 레이아웃
- FastAPI 구조 목록·상세 API
- PostgreSQL 16 + SQLAlchemy + Alembic 초기 스키마(후속 편집 워크플로 준비)
- 공유 TypeScript 타입 및 Zod seed 검증
- Vitest, Pytest, Playwright 테스트

실제 해부학 GLB는 라이선스 승인 전까지 저장소에 포함하지 않습니다. 현재 뷰어는 코드로 생성한 교육용 기하 모델을 사용합니다.

## 요구 사항

- Node.js 22+
- pnpm 11+
- Python 3.11+
- [uv](https://docs.astral.sh/uv/)
- Docker Desktop

pnpm이 없다면:

```bash
corepack enable
corepack prepare pnpm@11.13.1 --activate
```

Windows에서 Corepack 쓰기 권한이 없다면 사용자 경로 또는 `npm install --global pnpm`을 사용하세요.

## 설치

```bash
pnpm install
uv sync --project apps/api --dev
```

## 실행

### 웹

```bash
pnpm dev
```

- 웹: http://127.0.0.1:3000
- Windows/pnpm 환경의 Next 16 Turbopack 런타임 문제를 피하기 위해 개발 서버는 Webpack 모드를 사용합니다.

### API + PostgreSQL

```bash
cp .env.example .env
# .env의 POSTGRES_PASSWORD를 임의의 강한 값으로 교체하세요.
docker compose up -d --build
```

- API: http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs
- PostgreSQL: `127.0.0.1:15432`
- 컨테이너 시작 시 `alembic upgrade head`가 자동 실행됩니다.
- Sprint 1 API의 읽기 데이터 소스는 검증된 `data/seed/anatomy_structures.json`입니다. PostgreSQL 스키마는 후속 편집·검수 워크플로를 위한 준비 범위이며 현재 API 응답과 이중으로 동작하지 않습니다.

종료:

```bash
docker compose down
```

## API

```text
GET /health
GET /api/v1/anatomy/structures
GET /api/v1/anatomy/structures/{code}
```

예시:

```bash
curl http://127.0.0.1:8000/api/v1/anatomy/structures/MUSCLE_GLUTEUS_MAXIMUS_L
```

## 검증

```bash
npm run verify          # 단위 테스트 + 타입 + lint + build + API 테스트
npm run verify:release  # 위 항목 + 데스크톱/모바일 Playwright E2E
```

Docker 통합 확인:

```bash
curl http://127.0.0.1:8000/health
docker compose ps
docker compose exec -T db psql -U motion -d motion_anatomy -c "select version_num from alembic_version;"
```

## 구조

```text
apps/
  web/                    Next.js/R3F UI
  api/                    FastAPI, SQLAlchemy, Alembic
packages/
  shared-types/           공통 TypeScript 타입
  anatomy-schema/         공통 Zod 스키마
data/seed/                샘플 구조 및 3D node 매핑
docs/                     아키텍처·라이선스·의료 면책·에셋 파이프라인
assets/                   추가 에셋의 라이선스 검토 안내
```

## 데이터와 3D 에셋

- 샘플 구조: `data/seed/anatomy_structures.json`
- node 매핑: `data/seed/model-node-map.json`
- ID 규칙: `docs/anatomy-id-convention.md`
- 에셋 연결 절차: `docs/asset-pipeline.md`
- 라이선스 정책: `docs/licenses.md`
- 실제 근육계·골격계 기준 모델: `apps/web/public/models/z-anatomy/*.glb`
- 원본 FBX → Draco GLB 변환기: `scripts/convert_z_anatomy.py`

프로덕션 뷰어는 primitive 샘플 대신 Z-Anatomy/BodyParts3D 기반 근육계와 골격계 메시를 사용합니다. 골격은 원본 토폴로지를 유지하고, 근육계는 웹 렌더링에 맞게 감량했습니다. 대둔근과 대퇴직근에는 중립·단축성·신장성 상태를 비교하는 동적 근섬유 오버레이가 추가됩니다. 출처와 라이선스 전문은 `apps/web/public/models/z-anatomy/ATTRIBUTION.md`에 보존합니다.

외부 모델이 공개 다운로드 가능하더라도 재배포 권리가 명확하지 않으면 커밋하지 않습니다.

## 관련 문서

- 제품 명세: `docs/product-spec.md`
- 아키텍처: `docs/architecture.md`
- 의료 면책: `docs/medical-disclaimer.md`
