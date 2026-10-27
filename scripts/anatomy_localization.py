"""Deterministic Korean primary names for source-backed anatomy records.

``name_en`` deliberately retains the source-object name.  This module only
localizes display names: it makes no claims about structure function, origin, or
insertion.  Exact source names use curated Korean anatomical nomenclature; the
semantic token map is deliberately conservative for future source labels and
never performs character-by-character transliteration.
"""
from __future__ import annotations

import re

# Source names whose conventional Korean term cannot safely be reconstructed by
# word order alone.  Values omit laterality; korean_anatomical_name adds it.
EXACT_SOURCE_NAMES = {
    "Abdominal part of pectoralis major muscle": "큰가슴근 복부",
    "Abductor digiti minimi of foot": "새끼발가락벌림근", "Abductor digiti minimi of hand": "새끼손가락벌림근",
    "Abductor hallucis": "엄지발가락벌림근", "Abductor pollicis brevis": "짧은엄지벌림근", "Abductor pollicis longus": "긴엄지벌림근",
    "Acromial part of deltoid muscle": "세모근 봉우리부", "Adductor brevis": "짧은모음근", "Adductor longus": "긴모음근",
    "Adductor magnus": "큰모음근", "Adductor minimus": "작은모음근", "Anconeus muscle": "팔꿈치근",
    "Anterior belly of digastric muscle": "두힘살근 앞힘살", "Ary-epiglottic part of oblique arytenoid muscle": "빗모뿔연골근 모뿔후두덮개부",
    "Ascending part of trapezius muscle": "등세모근 상행부", "Brachialis muscle": "위팔근", "Brachioradialis muscle": "위팔노근",
    "Bucinator": "볼근", "Clavicular head of pectoralis major muscle": "큰가슴근 빗장갈래", "Clavicular part of deltoid muscle": "세모근 빗장부",
    "Coccygeus muscle": "꼬리근", "Coracobrachialis muscle": "부리위팔근", "Corrugator supercilii": "눈썹주름근",
    "Deep head of flexor pollicis brevis": "짧은엄지굽힘근 깊은갈래", "Deep head of pronator teres": "원엎침근 깊은갈래",
    "Deep part of masseter": "깨물근 깊은부", "Depressor anguli oris": "입꼬리내림근", "Depressor labii inferioris": "아래입술내림근",
    "Depressor septi nasi": "코중격내림근", "Descending part of trapezius muscle": "등세모근 하행부", "Diaphragm": "가로막",
    "Dorsal interossei muscles of foot": "발등뼈사이근", "Dorsal interossei muscles of hand": "손등뼈사이근",
    "Dorsal parts of lateral intertransversarii lumborum muscles": "가쪽허리뼈사이근 등쪽부",
    "Extensor carpi radialis brevis": "짧은노쪽손목폄근", "Extensor carpi radialis longus": "긴노쪽손목폄근",
    "Extensor digiti minimi": "새끼손가락폄근", "Extensor digitorum brevis": "짧은발가락폄근", "Extensor digitorum": "손가락폄근",
    "Extensor digitorum longus": "긴발가락폄근", "Extensor hallucis brevis": "짧은엄지발가락폄근", "Extensor hallucis longus": "긴엄지발가락폄근",
    "Extensor indicis": "집게손가락폄근", "Extensor pollicis brevis": "짧은엄지폄근", "Extensor pollicis longus": "긴엄지폄근",
    "External abdominal oblique muscle": "바깥배빗근", "External anal sphincter": "바깥항문조임근", "External intercostal muscles": "바깥갈비사이근",
    "External part of thyro-arytenoid muscle": "방패모뿔연골근 바깥부", "Fibularis brevis muscle": "짧은종아리근",
    "Fibularis longus muscle": "긴종아리근", "Fibularis tertius muscle": "셋째종아리근", "Flexor carpi radialis": "노쪽손목굽힘근",
    "Flexor digiti minimi of foot": "새끼발가락굽힘근", "Flexor digiti minimi of hand": "새끼손가락굽힘근",
    "Flexor digitorum brevis": "짧은발가락굽힘근", "Flexor digitorum longus": "긴발가락굽힘근", "Flexor digitorum profundus": "깊은손가락굽힘근",
    "Flexor hallucis longus": "긴엄지발가락굽힘근", "Flexor pollicis longus": "긴엄지굽힘근", "Frontalis muscle": "이마근",
    "Genioglossus muscle": "턱끝혀근", "Geniohyoid muscle": "턱끝목뿔근", "Gluteus maximus muscle": "큰볼기근",
    "Gluteus medius muscle": "중간볼기근", "Gluteus minimus muscle": "작은볼기근", "Gracilis muscle": "박근",
    "Humeral head of extensor carpi ulnaris": "자쪽손목폄근 위팔갈래", "Humeral head of flexor carpi ulnaris": "자쪽손목굽힘근 위팔갈래",
    "Humero-ulnar head of flexor digitorum superficialis": "얕은손가락굽힘근 위팔자갈래", "Hyoglossus muscle": "목뿔혀근",
    "Iliacus muscle": "엉덩근", "Iliococcygeus muscle": "엉덩꼬리근", "Iliocostalis colli muscle": "목엉덩갈비근",
    "Iliocostalis lumborum muscle": "허리엉덩갈비근", "Iliocostalis thoracis muscle": "가슴엉덩갈비근",
    "Inferior gemellus muscle": "아래쌍둥이근", "Inferior head of lateral pterygoid muscle": "가쪽날개근 아래갈래",
    "Inferior oblique muscle": "아래빗근", "Inferior pharyngeal constrictor": "아래인두조임근", "Inferior rectus muscle": "아래곧은근",
    "Infraspinatus muscle": "가시아래근", "Innermost intercostal muscles": "속갈비사이근", "Internal abdominal oblique muscle": "속배빗근",
    "Internal intercostal muscles": "속갈비사이근", "Interspinales colli muscles": "목가시사이근",
    "Interspinales lumborum muscles": "허리가시사이근", "Interspinales thoracis muscles": "가슴가시사이근",
    "Lateral crico-arytenoid muscle": "가쪽반지모뿔연골근", "Lateral head of flexor hallucis brevis": "짧은엄지발가락굽힘근 가쪽갈래",
    "Lateral head of gastrocnemius": "장딴지근 가쪽갈래", "Lateral head of triceps brachii": "위팔세갈래근 가쪽갈래",
    "Lateral rectus muscle": "가쪽곧은근", "Latissimus dorsi muscle": "넓은등근", "Levatores breves costarum": "짧은갈비뼈올림근",
    "Levatores longi costarum": "긴갈비뼈올림근", "Levator anguli oris": "입꼬리올림근", "Levator labii superioris": "위입술올림근",
    "Levator nasolabialis": "코입술올림근", "Levator palpebrae superioris": "위눈꺼풀올림근", "Levator scapulae": "어깨뼈올림근",
    "Longissimus capitis muscle": "머리최장근", "Longissimus colli muscle": "목최장근", "Longissimus thoracis muscle": "가슴최장근",
    "Longus capitis muscle": "머리긴근", "Longus colli muscle": "목긴근", "Long head of biceps brachii": "위팔두갈래근 긴갈래",
    "Long head of biceps femoris": "넙다리두갈래근 긴갈래", "Long head of triceps brachii": "위팔세갈래근 긴갈래",
    "Lumbrical muscles of foot": "발벌레근", "Lumbrical muscles of hand": "손벌레근", "Medial head of flexor hallucis brevis": "짧은엄지발가락굽힘근 안쪽갈래",
    "Medial head of gastrocnemius": "장딴지근 안쪽갈래", "Medial head of triceps brachii": "위팔세갈래근 안쪽갈래",
    "Medial pterygoid muscle": "안쪽날개근", "Medial rectus muscle": "안쪽곧은근", "Mentalis muscle": "턱끝근",
    "Middle pharyngeal constrictor": "중간인두조임근", "Multifidus colli muscle": "목뭇갈래근", "Multifidus lumborum muscle": "허리뭇갈래근",
    "Multifidus thoracis muscle": "가슴뭇갈래근", "Mylohyoid muscle": "턱목뿔근", "Nasalis muscle": "코근",
    "Oblique head of adductor hallucis": "엄지발가락모음근 빗갈래", "Oblique head of adductor pollicis": "엄지모음근 빗갈래",
    "Oblique part of cricothyroid muscle": "반지방패근 빗부분", "Obliquus inferior capitis muscle": "아래머리빗근",
    "Obliquus superior capitis muscle": "위머리빗근", "Obturator externus": "바깥폐쇄근", "Obturator internus": "속폐쇄근",
    "Occipitalis muscle": "뒤통수근", "Omohyoid muscle": "어깨목뿔근", "Opponens digiti minimi muscle of foot": "새끼발가락맞섬근",
    "Opponens digiti minimi muscle of hand": "새끼손가락맞섬근", "Opponens pollicis muscle": "엄지맞섬근", "Orbicularis oris muscle": "입둘레근",
    "Orbital part of orbicularis oculi": "눈둘레근 눈확부", "Palatopharyngeus muscle": "입천장인두근", "Palmaris longus muscle": "긴손바닥근",
    "Palmar interossei muscles": "손바닥뼈사이근", "Palpebral part of orbicularis oculi": "눈둘레근 눈꺼풀부", "Pectineus muscle": "두덩근",
    "Pectoralis minor muscle": "작은가슴근", "Piriformis muscle": "궁둥구멍근", "Plantaris muscle": "족저근",
    "Plantar interossei muscles": "발바닥뼈사이근", "Platysma": "넓은목근", "Popliteus muscle": "오금근",
    "Posterior belly of digastric muscle": "두힘살근 뒤힘살", "Posterior crico-arytenoid muscle": "뒤반지모뿔연골근",
    "Procerus muscle": "눈살근", "Pronator quadratus": "네모엎침근", "Psoas major": "큰허리근",
    "Pubococcygeus muscle": "두덩꼬리근", "Pubo-analis muscle": "두덩항문근", "Pyramidalis muscle": "피라미드근",
    "Quadratus femoris muscle": "넙다리네모근", "Quadratus lumborum muscle": "허리네모근", "Quadratus plantae muscle": "발바닥네모근",
    "Radial head of flexor digitorum superficialis": "얕은손가락굽힘근 노갈래", "Rectus abdominis muscle": "배곧은근",
    "Rectus anterior capitis muscle": "앞머리곧은근", "Rectus femoris muscle": "넙다리곧은근", "Rectus lateralis capitis muscle": "가쪽머리곧은근",
    "Rectus posterior major capitis muscle": "뒤큰머리곧은근", "Rectus posterior minor capitis muscle": "뒤작은머리곧은근",
    "Rhomboid major muscle": "큰마름근", "Rhomboid minor muscle": "작은마름근", "Risorius muscle": "웃음근", "Rotatores": "돌림근",
    "Sartorius muscle": "넙다리빗근", "Scalenus anterior muscle": "앞목갈비근", "Scalenus medius muscle": "중간목갈비근",
    "Scalenus posterior muscle": "뒤목갈비근", "Scapular spinal part of deltoid muscle": "세모근 어깨뼈가시부",
    "Semimembranosus muscle": "반막근", "Semispinalis colli muscle": "목반가시근", "Semispinalis thoracis muscle": "가슴반가시근",
    "Semitendinosus muscle": "반힘줄근", "Serratus anterior muscle": "앞톱니근", "Serratus posterior inferior muscle": "뒤아래톱니근",
    "Serratus posterior superior muscle": "뒤위톱니근", "Short head of biceps brachii": "위팔두갈래근 짧은갈래",
    "Short head of biceps femoris": "넙다리두갈래근 짧은갈래", "Soleus muscle": "가자미근", "Spinalis capitis muscle": "머리가시근",
    "Spinalis colli muscle": "목가시근", "Spinalis thoracis muscle": "가슴가시근", "Splenius capitis muscle": "머리널판근",
    "Splenius colli muscle": "목널판근", "Sternocleidomastoid muscle": "목빗근", "Sternocostal head of pectoralis major muscle": "큰가슴근 복장갈비갈래",
    "Sternohyoid muscle": "복장목뿔근", "Sternothyroid muscle": "복장방패근", "Straight part of cricothyroid muscle": "반지방패근 곧은부분",
    "Stylohyoid muscle": "붓목뿔근", "Stylopharyngeus muscle": "붓인두근", "Subclavius muscle": "빗장밑근",
    "Subscapularis muscle": "어깨밑근", "Superficial head of flexor pollicis brevis": "짧은엄지굽힘근 얕은갈래",
    "Superficial head of pronator teres": "원엎침근 얕은갈래", "Superficial part of masseter": "깨물근 얕은부",
    "Superior gemellus muscle": "위쌍둥이근", "Superior head of lateral pterygoid muscle": "가쪽날개근 위갈래",
    "Superior oblique muscle": "위빗근", "Superior pharyngeal constrictor": "위인두조임근", "Superior rectus muscle": "위곧은근",
    "Supinator": "뒤침근", "Supraspinatus muscle": "가시위근", "Temporalis muscle": "관자근", "Temporoparietalis muscle": "관자마루근",
    "Tensor fasciae latae": "넙다리근막긴장근", "Teres major muscle": "큰원근", "Teres minor muscle": "작은원근",
    "Thyrohyoid muscle": "방패목뿔근", "Thyro-epiglottic part of thyro-arytenoid muscle": "방패모뿔연골근 방패후두덮개부",
    "Tibialis anterior muscle": "앞정강근", "Tibialis posterior muscle": "뒤정강근", "Transverse arytenoid muscle": "가로모뿔연골근",
    "Transverse head of adductor hallucis": "엄지발가락모음근 가로갈래", "Transverse head of adductor pollicis": "엄지모음근 가로갈래",
    "Transverse part of trapezius muscle": "등세모근 가로부", "Transversus abdominis muscle": "배가로근", "Transversus thoracis muscle": "가슴가로근",
    "Ulnar head of extensor carpi ulnaris": "자쪽손목폄근 자갈래", "Ulnar head of flexor carpi ulnaris": "자쪽손목굽힘근 자갈래",
    "Vastus intermedius muscle": "중간넓은근", "Vastus lateralis muscle": "가쪽넓은근", "Vastus medialis muscle": "안쪽넓은근",
    "Ventral parts of lateral intertransversarii lumborum muscles": "가쪽허리뼈사이근 배쪽부",
    "Zygomaticus major muscle": "큰광대근", "Zygomaticus minor muscle": "작은광대근",
}

# A semantic vocabulary remains available when a future source adds a clearly
# composable term.  Unknown tokens never become pseudo-transliterated Hangul.
TOKEN_TERMS = {
    "abdominal": "배", "abductor": "벌림근", "adductor": "모음근", "anterior": "앞", "deep": "깊은",
    "descending": "하행", "dorsal": "등쪽", "external": "바깥", "flexor": "굽힘근", "head": "갈래",
    "inferior": "아래", "internal": "속", "lateral": "가쪽", "long": "긴", "major": "큰", "medial": "안쪽",
    "minor": "작은", "muscle": "근", "posterior": "뒤", "superficial": "얕은", "superior": "위",
    "transverse": "가로", "ventral": "배쪽",
}


def source_base_name(name: str) -> str:
    """Remove only a terminal Blender laterality marker from a source name."""
    return re.sub(r"(?:[._ -])[lr]$", "", name, flags=re.I).strip()


def _semantic_name(base_name: str) -> str:
    words = re.findall(r"[a-z]+", base_name.lower())
    translated = [TOKEN_TERMS[word] for word in words if word in TOKEN_TERMS]
    # Do not expose unreviewed source words or manufacture a pseudo-pronunciation.
    return " ".join(translated) if translated and len(translated) == len(words) else "해부학적 근육 구조"


def korean_anatomical_name(source_name: str, side: str) -> str:
    """Return a Korean-only primary display name for a source mesh object."""
    base_name = source_base_name(source_name).replace("(", "").replace(")", "").strip()
    localized = EXACT_SOURCE_NAMES.get(base_name, _semantic_name(base_name))
    prefix = {"left": "왼쪽 ", "right": "오른쪽 ", "midline": ""}.get(side)
    if prefix is None:
        raise ValueError(f"Unknown anatomical side: {side}")
    return f"{prefix}{localized}"


def korean_unreviewed_description() -> str:
    return "이 구조는 Z-Anatomy 출처 메시와 연결되어 있습니다. 상세 임상 해부 정보 검토가 완료되지 않았습니다."


def korean_unreviewed_function() -> str:
    return "상세 기능 정보의 임상 검토가 완료되지 않았습니다."
