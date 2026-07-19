export type ContentKind = "exercise" | "movement" | "stretch";
export type Difficulty = "초급" | "중급" | "고급";

export type FunctionalContent = {
  kind: ContentKind;
  slug: string;
  nameKo: string;
  nameEn: string;
  category: string;
  difficulty: Difficulty;
  equipment: string[];
  summary: string;
  startPosition: string;
  steps: string[];
  breathing: string;
  primaryMuscles: string[];
  assistingMuscles: string[];
  joints: string[];
  cautions: string[];
  relatedStructureCodes: string[];
};

export type ContentFilter = {
  kind?: ContentKind;
  query?: string;
  category?: string;
  equipment?: string;
  difficulty?: Difficulty | "";
};

export const kindMeta: Record<ContentKind, { label: string; path: string; eyebrow: string; description: string }> = {
  exercise: { label: "웨이트", path: "/exercises", eyebrow: "STRENGTH LIBRARY", description: "관절 움직임과 주동근을 함께 이해하는 저항운동 라이브러리" },
  movement: { label: "움직임", path: "/movements", eyebrow: "MOVEMENT LIBRARY", description: "걷기·점프·일상 동작을 단계와 관절 중심으로 탐색하는 라이브러리" },
  stretch: { label: "스트레칭", path: "/stretches", eyebrow: "MOBILITY LIBRARY", description: "목표 근육과 안전 수칙을 확인하는 교육용 스트레칭 라이브러리" },
};

export const contentCatalog: FunctionalContent[] = [
  {
    kind: "exercise", slug: "squat", nameKo: "스쿼트", nameEn: "Back Squat", category: "하체", difficulty: "중급", equipment: ["바벨", "랙"],
    summary: "고관절·무릎·발목을 함께 굽혔다 펴는 대표적인 닫힌사슬 하체 운동입니다.", startPosition: "바벨을 안정적으로 견착하고 발을 편안한 너비로 둔 뒤 몸통을 중립으로 세웁니다.",
    steps: ["발 전체로 지면을 누르며 고관절과 무릎을 함께 굽힙니다.", "무릎과 발끝 방향을 맞추고 몸통 긴장을 유지합니다.", "발바닥을 밀어 고관절과 무릎을 함께 펴며 일어납니다."],
    breathing: "하강 전에 숨을 들이마셔 몸통을 안정시키고 상승 구간을 통과하며 내쉽니다.", primaryMuscles: ["대둔근", "대퇴사두근"], assistingMuscles: ["햄스트링", "내전근군", "척추기립근"], joints: ["고관절", "무릎관절", "발목관절"],
    cautions: ["통증 없는 가동범위에서 수행합니다.", "무릎이 안쪽으로 무너지지 않도록 발 방향과 맞춥니다."], relatedStructureCodes: ["MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_RECTUS_FEMORIS_L", "BONE_FEMUR_L", "LIGAMENT_ACL_L"],
  },
  {
    kind: "exercise", slug: "hip-thrust", nameKo: "힙 쓰러스트", nameEn: "Hip Thrust", category: "하체", difficulty: "중급", equipment: ["벤치", "바벨"],
    summary: "고관절 신전을 중심으로 대둔근을 훈련하는 운동입니다.", startPosition: "견갑골 아래를 벤치에 기대고 발을 지면에 둔 뒤 중량을 골반 앞에 안정적으로 놓습니다.",
    steps: ["턱을 가볍게 당기고 갈비뼈를 과도하게 들지 않습니다.", "발뒤꿈치를 눌러 골반을 들어 올립니다.", "고관절이 펴진 지점에서 대둔근을 수축한 뒤 통제하며 내립니다."], breathing: "들어 올리며 내쉬고 내려가며 들이마십니다.",
    primaryMuscles: ["대둔근"], assistingMuscles: ["햄스트링", "대내전근"], joints: ["고관절"], cautions: ["허리를 과도하게 젖혀 높이를 만들지 않습니다.", "벤치와 중량 패드가 안정적인지 확인합니다."], relatedStructureCodes: ["MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_GLUTEUS_MAXIMUS_R"],
  },
  {
    kind: "exercise", slug: "reverse-lunge", nameKo: "리버스 런지", nameEn: "Reverse Lunge", category: "하체", difficulty: "초급", equipment: ["맨몸"],
    summary: "한 발을 뒤로 보내며 앞다리의 고관절과 무릎을 사용하는 단측 하체 운동입니다.", startPosition: "두 발을 골반 너비로 두고 몸통을 세웁니다.",
    steps: ["한 발을 충분히 뒤로 보냅니다.", "앞발 전체에 압력을 유지하며 양 무릎을 굽힙니다.", "앞발로 지면을 밀어 시작 자세로 돌아옵니다."], breathing: "내려가며 들이마시고 일어서며 내쉽니다.",
    primaryMuscles: ["대둔근", "대퇴사두근"], assistingMuscles: ["중둔근", "햄스트링"], joints: ["고관절", "무릎관절", "발목관절"], cautions: ["앞 무릎과 발끝의 방향을 맞춥니다.", "균형이 어렵다면 고정된 지지물을 사용합니다."], relatedStructureCodes: ["MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_RECTUS_FEMORIS_L", "BONE_FEMUR_L"],
  },
  {
    kind: "movement", slug: "walking", nameKo: "걷기", nameEn: "Walking Gait", category: "보행", difficulty: "초급", equipment: ["없음"],
    summary: "지지기와 흔들기기가 교대로 이어지는 기본적인 인간 이동 동작입니다.", startPosition: "시선은 전방에 두고 편안하게 선 자세에서 시작합니다.",
    steps: ["한쪽 발뒤꿈치가 닿으며 체중을 받아들입니다.", "지지 다리 위로 몸이 이동하고 반대 다리가 앞으로 흔들립니다.", "발가락으로 지면을 밀며 다음 발걸음으로 전환합니다."], breathing: "자연스러운 호흡을 유지합니다.", primaryMuscles: ["대둔근", "하퇴삼두근"], assistingMuscles: ["중둔근", "대퇴사두근", "전경골근"], joints: ["고관절", "무릎관절", "발목관절"], cautions: ["보행 중 통증이나 심한 불균형이 있다면 전문가 평가를 고려합니다."], relatedStructureCodes: ["MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_RECTUS_FEMORIS_L", "TENDON_ACHILLES_L"],
  },
  {
    kind: "movement", slug: "stair-ascent", nameKo: "계단 오르기", nameEn: "Stair Ascent", category: "일상 동작", difficulty: "초급", equipment: ["계단"],
    summary: "한쪽 다리로 체중을 들어 올리며 고관절과 무릎을 펴는 일상 동작입니다.", startPosition: "계단 앞에 서서 한 발 전체를 계단 위에 올립니다.",
    steps: ["위쪽 발 전체에 체중을 싣습니다.", "고관절과 무릎을 펴며 몸을 위로 이동합니다.", "반대 발을 안정적으로 다음 계단에 놓습니다."], breathing: "힘을 쓰며 내쉬고 다음 발을 준비하며 들이마십니다.", primaryMuscles: ["대둔근", "대퇴사두근"], assistingMuscles: ["종아리근", "중둔근"], joints: ["고관절", "무릎관절", "발목관절"], cautions: ["발 전체가 계단에 놓였는지 확인합니다.", "필요하면 난간을 사용합니다."], relatedStructureCodes: ["MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_RECTUS_FEMORIS_L"],
  },
  {
    kind: "movement", slug: "sit-to-stand", nameKo: "앉았다 일어나기", nameEn: "Sit to Stand", category: "일상 동작", difficulty: "초급", equipment: ["의자"],
    summary: "의자에서 체중중심을 앞으로 옮긴 뒤 고관절과 무릎을 펴는 기능적 동작입니다.", startPosition: "의자 앞쪽에 앉아 두 발을 무릎 아래에 둡니다.",
    steps: ["몸통을 고관절에서 앞으로 기울입니다.", "발 전체로 바닥을 누르며 엉덩이를 듭니다.", "고관절과 무릎을 펴서 안정적으로 섭니다."], breathing: "일어서며 내쉽니다.", primaryMuscles: ["대둔근", "대퇴사두근"], assistingMuscles: ["척추기립근", "가자미근"], joints: ["고관절", "무릎관절", "발목관절"], cautions: ["의자가 미끄러지지 않도록 고정합니다.", "어지럼증이 있으면 천천히 수행합니다."], relatedStructureCodes: ["MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_RECTUS_FEMORIS_L"],
  },
  {
    kind: "stretch", slug: "glute-stretch", nameKo: "둔근 스트레칭", nameEn: "Glute Stretch", category: "둔근", difficulty: "초급", equipment: ["매트"],
    summary: "고관절을 굽히고 회전해 둔부의 부드러운 신장감을 만드는 스트레칭입니다.", startPosition: "등을 대고 누워 한쪽 발목을 반대쪽 허벅지 위에 올립니다.",
    steps: ["아래쪽 허벅지를 양손으로 잡습니다.", "허벅지를 몸 쪽으로 천천히 당깁니다.", "둔부에 편안한 신장감이 생긴 위치에서 호흡합니다."], breathing: "긴장을 풀며 천천히 호흡합니다.", primaryMuscles: ["대둔근", "이상근"], assistingMuscles: ["중둔근"], joints: ["고관절"], cautions: ["무릎을 강제로 누르지 않습니다.", "찌르는 통증이나 저림이 생기면 중단합니다."], relatedStructureCodes: ["MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_GLUTEUS_MAXIMUS_R"],
  },
  {
    kind: "stretch", slug: "quadriceps-stretch", nameKo: "대퇴사두근 스트레칭", nameEn: "Quadriceps Stretch", category: "대퇴 전면", difficulty: "초급", equipment: ["없음"],
    summary: "무릎 굽힘을 이용해 대퇴 전면 근육의 신장감을 만드는 스트레칭입니다.", startPosition: "벽이나 지지물 옆에 서서 한쪽 무릎을 굽혀 발목을 잡습니다.",
    steps: ["양쪽 무릎을 가깝게 둡니다.", "골반을 중립에 가깝게 유지합니다.", "대퇴 전면에 편안한 신장감이 느껴지는 범위에서 유지합니다."], breathing: "호흡을 멈추지 않고 천천히 내쉽니다.", primaryMuscles: ["대퇴사두근", "대퇴직근"], assistingMuscles: ["장요근"], joints: ["무릎관절", "고관절"], cautions: ["허리를 과도하게 젖히지 않습니다.", "무릎 통증이 있으면 범위를 줄이거나 중단합니다."], relatedStructureCodes: ["MUSCLE_RECTUS_FEMORIS_L", "MUSCLE_RECTUS_FEMORIS_R"],
  },
  {
    kind: "stretch", slug: "calf-stretch", nameKo: "종아리 스트레칭", nameEn: "Standing Calf Stretch", category: "종아리", difficulty: "초급", equipment: ["벽"],
    summary: "발뒤꿈치를 지면에 유지하며 발목 배측굴곡을 만들어 종아리를 늘립니다.", startPosition: "벽을 짚고 한 발을 뒤로 보냅니다.",
    steps: ["뒤쪽 발끝을 정면에 가깝게 둡니다.", "뒤 무릎을 펴고 발뒤꿈치를 바닥에 유지합니다.", "앞 무릎을 굽히며 몸을 앞으로 이동합니다."], breathing: "편안하게 호흡하며 긴장을 줄입니다.", primaryMuscles: ["비복근"], assistingMuscles: ["가자미근"], joints: ["발목관절"], cautions: ["뒤꿈치가 들리지 않는 범위에서 수행합니다.", "아킬레스힘줄에 날카로운 통증이 있으면 중단합니다."], relatedStructureCodes: ["TENDON_ACHILLES_L"],
  },
];

const normalize = (value: string) => value.trim().toLocaleLowerCase("ko-KR");

export function filterContent(items: FunctionalContent[], filter: ContentFilter) {
  const query = normalize(filter.query ?? "");
  return items.filter((item) => {
    if (filter.kind && item.kind !== filter.kind) return false;
    if (filter.category && item.category !== filter.category) return false;
    if (filter.equipment && !item.equipment.includes(filter.equipment)) return false;
    if (filter.difficulty && item.difficulty !== filter.difficulty) return false;
    if (!query) return true;
    const haystack = [item.nameKo, item.nameEn, item.category, item.summary, ...item.primaryMuscles, ...item.assistingMuscles, ...item.joints, ...item.equipment].join(" ");
    return normalize(haystack).includes(query);
  });
}

export function getContentBySlug(kind: ContentKind, slug: string) {
  return contentCatalog.find((item) => item.kind === kind && item.slug === slug) ?? null;
}
