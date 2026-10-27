# Project Development & Agent Guidelines

## 1. Batch Script Guidelines (`.bat`, `.cmd`)
- **English-Only Comments & Messages**: Whenever creating, updating, or generating Windows batch files (`.bat`, `.cmd`), all comments (`REM`, `::`), console output (`echo`), and interactive prompts (`choice`, `set /p`) **MUST be written strictly in English (ASCII-only)**.
- **Encoding Issue Prevention**: Windows `cmd.exe` environments frequently run under legacy OEM code pages (e.g. CP949). Multi-byte non-ASCII characters cause encoding corruption and batch parse errors. Pure ASCII ensures guaranteed compatibility across all Windows environments.

- Always respond in Korean (항상 한국어로 답변해주세요).

## 2. Fully Autonomous Execution (완전 자율 실행 원칙)
- **No Intermediate Interruptions / Do Not Ask Questions**: Unless the user sends a new instruction during execution, the agent MUST NOT stop, ask intermediate questions (e.g. `ask_question`), or require confirmation/SUBMIT approvals from the user.
- **Run to Full Completion**: When given a user request, execute all steps, tool calls, file edits, and commands continuously and autonomously until the entire objective is 100% complete.
- **Autonomous Problem Solving**: If minor ambiguities, choices, or unexpected errors arise during execution, use best judgment to solve them automatically without interrupting the user.
- **Final Summary Only**: Present the result to the user only after all implementations and verifications are completely finished.

<!--
## 프로젝트 개발 및 에이전트 가이드라인

1. 배치 스크립트 가이드라인 (`.bat`, `.cmd`)
 - **영어만 사용하는 주석 및 메시지**: 윈도우 배치 파일(`.bat`, `.cmd`)을 만들거나 수정, 생성할 때는 모든 주석(`REM`, `::`), 콘솔 출력(`echo`), 대화형 프롬프트(`choice`, `set /p`)를 반드시 영어(ASCII만)로 작성해야 합니다.
 - **인코딩 문제 예방**: Windows `cmd.exe` 환경은 종종 레거시 OEM 코드 페이지(예: CP949) 아래에서 실행됩니다. 다중 바이트 비-ASCII 문자는 인코딩 손상과 배치 파싱 오류를 일으킵니다. 순수 ASCII는 모든 윈도우 환경에서 호환성을 보장합니다.

2. 완전 자율 실행 원칙
 - 사용자가 중간에 새로운 지시를 보내지 않는 한, 작업 도중 질문이나 승인(SUBMIT)을 요구하지 말고 처음 요청된 목표를 끝까지 완수할 때까지 자율적으로 실행합니다.
-->
