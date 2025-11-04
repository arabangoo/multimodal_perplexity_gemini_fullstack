## [Gemini Perplexity React LangGraph 멀티모달 풀스택 웹페이지]    
   
본 프로젝트는 Gemini-React-LangGraph를 이용한 **멀티모달 지원** 풀스택 웹페이지입니다.   
Gemini API 키와 Perplexity API 키가 필요하니 미리 발급받아 놓으세요.   
   
## 🎯 주요 기능

본 프로젝트를 구축하면 로컬 PC에서 아래와 같은 기능의 서비스를 사용할 수 있습니다:

1. **🔍 Perplexity 최신 검색** - 실시간 웹 정보 검색
2. **🧠 Gemini 심층 분석** - AI 기반 답변 생성 (응답 길이 2배 증가)
3. **🖼️ 멀티모달 지원** - 텍스트 + 이미지 동시 입력
4. **💬 세션 기반 대화 기억** - 이전 대화 컨텍스트 유지
5. **🔄 자동 반복 검색** - 정보 부족 시 최대 3회 재검색
6. **📚 출처 링크 제공** - 답변 근거 URL 표시
7. **🔗 관련 질문 제안** - 추가 탐색 질문 추천

## ✨ 새로운 멀티모달 기능

### **이미지 업로드 및 분석**
- 📎 클립 버튼으로 이미지 첨부 가능
- 지원 형식: JPG, PNG, GIF, WebP, BMP
- 최대 파일 크기: 10MB
- 자동 이미지 최적화 (리사이징 + WebP 변환)

### **멀티모달 검색 프로세스**
1. **이미지 분석**: Gemini가 업로드된 이미지 설명 생성
2. **향상된 검색**: 이미지 설명을 텍스트 쿼리에 포함하여 Perplexity 검색
3. **멀티모달 답변**: 이미지와 검색 결과를 종합한 상세 답변 생성

### **사용 예시**
- 🍕 음식 사진 + "이 음식의 레시피 알려줘" → 레시피 제공
- 🏛️ 건축물 사진 + "이 건물에 대해 설명해줘" → 건물 정보 제공
- 📱 제품 이미지 + "이 제품 리뷰 찾아줘" → 최신 리뷰 검색
- 🐕 동물 사진만 업로드 → 자동으로 동물 종류 및 정보 분석

<br/>

---

## 📋 필수 준비사항
   
### (1) 윈도우 로컬 PC에서 서비스 실행
아래 명령어로 필수 프로그램의 버전을 먼저 확인하세요.

```bash
python --version  # Python 3.11 이상 권장
node --version    # Node.js 18 이상 권장
npm --version     # npm 9 이상 권장
```

<br/><br/>

---

## 📁 프로젝트 구조
                   
### (2) 파일 구성

```txt
├── 실행 관련 파일들 
│   ├── install.bat          ← 의존성 설치 자동화
│   ├── run-backend.bat      ← 백엔드만 실행
│   ├── run-frontend.bat     ← 프론트엔드만 실행
│   ├── run-all.bat          ← 백엔드+프론트엔드 동시 실행
│   └── docker-deploy.bat    ← Docker로 배포
│
├── Docker 관련
│   ├── Dockerfile          
│   ├── docker-compose.yml   ← API 키 설정
│   └── .env                 ← Docker용 환경 변수
│
├── Backend (백엔드)
│   └── backend/
│       ├── .env             ← API 키 설정 (핵심!)
│       ├── pyproject.toml   ← 의존성 정의
│       └── src/
│           ├── agent/
│           │   ├── app.py       ← FastAPI 서버 (멀티모달 지원)
│           │   ├── graph.py     ← LangGraph 워크플로우
│           │   └── state.py     ← ResearchState (이미지 필드 추가)
│           ├── tools/
│           │   └── perplexity.py ← Perplexity 검색 도구
│           └── utils/            ← 🆕 새로 추가됨
│               └── images.py     ← 이미지 처리 유틸리티
│
└── Frontend (프론트엔드)
    └── frontend/
        └── src/
            └── App.tsx      ← React 컴포넌트 (이미지 업로드 UI)
```

---

## 🔧 백엔드 핵심 파일 설명

   
### (3) backend/.env
Gemini API와 Perplexity API를 사용하기 위한 인증 키 설정

```env
GEMINI_API_KEY=실제_제미나이_API_키_기입
PERPLEXITY_API_KEY=실제_퍼플렉시티_API_키_기입
HOST=0.0.0.0
PORT=8000
LANGSMITH_STUDIO_AUTO_OPEN=false
```

### backend/src/utils/images.py 
이미지 처리 유틸리티 

```python
async def image_to_base64(file: UploadFile) -> str:
    """이미지를 Base64로 인코딩"""
    # - 최대 크기 제한 (3072x3072)
    # - WebP 형식으로 변환
    # - 용량 최적화 (quality=85)
    
def validate_image_file(file: UploadFile) -> bool:
    """이미지 파일 유효성 검증"""
    # - 지원 형식: JPG, PNG, GIF, WebP, BMP
```

### backend/src/agent/state.py
워크플로우 전체에서 사용하는 상태 구조 정의

```python
class ResearchState(TypedDict):
    messages: list[BaseMessage]    # 대화 기록
    query: str                     # 사용자 질문
    image: str                     # 이미지 Base64 (멀티모달)
    search_results: list[dict]     # Perplexity 검색 결과
    citations: list[str]           # 출처 URL
    related_questions: list[str]   # 관련 질문
    analysis: str                  # Gemini 분석
    final_answer: str              # 최종 답변
    iteration: int                 # 검색 횟수 (최대 3회)
    needs_more_research: bool      # 재검색 필요 여부
```

### backend/src/agent/graph.py
LangGraph 워크플로우 정의 (핵심 로직)

**워크플로우 흐름:**

```
extract_query → search_perplexity → analyze_with_gemini 
→ should_continue → (재검색 or generate_final_answer)
```

**주요 노드:**

1. **extract_query**: 질문 추출 및 State 초기화
2. **search_perplexity** (멀티모달):
   - 이미지가 있으면 Gemini로 이미지 설명 생성
   - 이미지 설명을 검색 쿼리에 포함
   - Perplexity로 웹 검색 실행
3. **analyze_with_gemini**: "정보 충분한가?" 판단
4. **should_continue**: 조건 분기 (재검색 vs 답변 생성)
5. **generate_final_answer** (멀티모달):
   - 이미지 포함 프롬프트 구성
   - 검색 결과 종합하여 상세 답변 생성
   - **응답 길이 2배 증가** (max_tokens: 8192)

**Gemini 모델 설정:**
```python
gemini = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    temperature=0.3,
    max_output_tokens=8192  
)
```

### backend/src/agent/app.py
FastAPI 서버 및 API 엔드포인트

```python
@app.post("/api/research")
async def research(
    query: str = Form(...),              # 텍스트 쿼리
    session_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)  
):
    # 1. 이미지 처리 (Base64 인코딩)
    # 2. 세션 ID 확인/생성
    # 3. LangGraph 워크플로우 실행
    # 4. 결과 반환 (answer, citations, related_questions, iterations)
```

**처리 과정:**

1. FormData로 텍스트 + 이미지 받음
2. 이미지 검증 및 Base64 인코딩
3. session_id로 MemorySaver에서 이전 대화 로드
4. 워크플로우 실행 후 JSON 응답
5. CORS 설정으로 프론트엔드(5173) 접근 허용

### backend/src/tools/perplexity.py
Perplexity API 호출 도구

```python
@tool
async def perplexity_search(query: str, search_recency: str) -> dict:
    """Perplexity API로 최신 웹 정보를 검색합니다"""
    # - 실시간 웹 검색
    # - 출처 URL 반환
    # - 관련 질문 제안
```

---

## 🎨 프론트엔드 핵심 파일 설명

### (4) frontend/src/App.tsx
React 컴포넌트 (멀티모달 UI 지원)

**주요 상태:**
```typescript
const [messages, setMessages] = useState<Message[]>([])
const [sessionId, setSessionId] = useState<string | null>(null)
const [selectedImage, setSelectedImage] = useState<File | null>(null)      
const [imagePreview, setImagePreview] = useState<string | null>(null)      
```

**UI 구성:**
1. **Header** - 제목 + "새 대화" 버튼
2. **Chat Area** - 대화 메시지들
   - 사용자 메시지 (파란색, 오른쪽) + 이미지 미리보기 🆕
   - AI 답변 (회색, 왼쪽) + 출처 + 관련 질문
3. **Input Area**
   - 📎 이미지 업로드 버튼 🆕
   - 이미지 미리보기 + 제거 버튼 🆕
   - 텍스트 입력창
   - 전송 버튼

**세션 관리:**

1. sessionStorage에 session_id 저장
2. 같은 탭에서는 계속 같은 세션 유지
3. 새 탭 열면 새 세션 생성
4. "새 대화" 버튼 누르면 새 세션 생성

**멀티모달 처리:**
```typescript
// 이미지 선택
const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // - 파일 크기 제한 (10MB)
    // - 미리보기 생성
}

// FormData 전송
const formData = new FormData()
formData.append('query', userMessage.content)
formData.append('session_id', sessionId)
if (currentImage) {
    formData.append('file', currentImage) 
}
```

---

## 🚀 실행 방법

### (5) 실행 스크립트들

#### install.bat - 의존성 설치 (최초 1회)
```bash
cd backend
pip install -e .

cd frontend
npm install
```

**🆕 추가 의존성:**
- `Pillow>=10.0.0` - 이미지 처리
- `python-multipart>=0.0.6` - FormData 처리

#### run-backend.bat - 백엔드 실행
```bash
cd backend
langgraph dev
```

**역할:**
- LangGraph 개발 서버 시작
- FastAPI 서버 실행 (포트 2024 - 로컬 개발)
- 핫 리로드 지원 (코드 수정 시 자동 재시작)
- Docker 배포 시에는 포트 8123 사용

#### run-frontend.bat - 프론트엔드 실행
```bash
cd frontend
npm run dev
```

**역할:**
- Vite 개발 서버 시작 (포트 5173)
- React 앱 실행
- 핫 리로드 지원

#### run-all.bat - 전체 동시 실행 (권장)

```bash
start "Backend" cmd /k "cd backend && langgraph dev"
start "Frontend" cmd /k "cd frontend && npm run dev"
```

#### docker-deploy.bat - Docker 배포
```bash
docker build -t gemini-fullstack-langgraph .
docker-compose up -d
```

**역할:**
1. Docker 이미지 빌드 (프론트+백엔드 통합)
2. PostgreSQL, Redis, API 서버 모두 시작
3. 프로덕션 배포용

---

## 📖 서비스 사용 가이드

### (6) 실행 절차

**1단계: 의존성 설치 (최초 1회)**
```bash
install.bat
```

**2단계: 환경 변수 설정**

`backend/.env` 파일 수정:
```env
GEMINI_API_KEY=실제_제미나이_API_키
PERPLEXITY_API_KEY=실제_퍼플렉시티_API_키
```

**3단계: 서비스 실행**
```bash
run-all.bat
```

**4단계: 브라우저 접속**
```
http://localhost:5173
```

---

## 🎯 사용 예시

### 텍스트만 입력
```
입력: "AWS ECS vs EKS 차이점을 비교해줘"
결과: Perplexity 검색 → Gemini 분석 → 상세 비교 답변
```

### 이미지만 입력
```
입력: (강아지 사진 업로드)
자동 질문: "이미지를 분석해주세요"
결과: 
1. Gemini가 이미지 분석 (품종, 특징 등)
2. Perplexity로 관련 정보 검색
3. 강아지 품종, 특성, 케어 방법 등 답변
```

### 텍스트 + 이미지 입력
```
입력: "이 음식의 레시피를 알려줘" + (음식 사진)
결과:
1. Gemini가 이미지에서 음식 식별
2. "이 음식의 레시피 [이미지 설명: 파스타...]"로 검색
3. 레시피, 재료, 조리법 상세 답변
```

### 건축물 분석
```
입력: "이 건물에 대해 설명해줘" + (건물 사진)
결과:
1. 이미지에서 건물 특징 분석
2. 건물 이름, 역사, 건축 양식 검색
3. 상세한 건축 설명 제공
```

---

## 📊 워크플로우 상세

### (7) 멀티모달 처리 흐름

```
사용자 입력 (텍스트 + 이미지)
    ↓
프론트엔드: FormData 생성
    ↓
백엔드: 이미지 → Base64 인코딩
    ↓
graph.py: extract_query (초기화)
    ↓
graph.py: search_perplexity
    ├─ 이미지 있음?
    │   ├─ YES → Gemini로 이미지 설명 생성
    │   │         "주요 객체, 색상, 분위기..."
    │   └─ 쿼리 업데이트: "원래 질문 + [이미지 설명: ...]"
    └─ Perplexity 검색 (향상된 쿼리)
    ↓
graph.py: analyze_with_gemini
    └─ 정보 충분? NO → 다시 search_perplexity (최대 3회)
    └─ 정보 충분? YES → generate_final_answer
    ↓
graph.py: generate_final_answer
    ├─ 멀티모달 프롬프트 구성
    │   - 텍스트 프롬프트
    │   - 이미지 (있을 경우)
    └─ Gemini 답변 생성 (8192 토큰)
    ↓
응답 반환
    ├─ 최종 답변
    ├─ 출처 링크 (최대 10개)
    ├─ 관련 질문 (최대 5개)
    └─ 검색 반복 횟수
```

---

## ⚙️ 환경 설정 가이드

### (8) 필수 설정 파일


#### 루트 디렉토리 `.env` (Docker 배포용)
```env
GEMINI_API_KEY=실제_제미나이_API_키
PERPLEXITY_API_KEY=실제_퍼플렉시티_API_키
LANGSMITH_API_KEY=실제_랭스미스_API_키  # 선택사항
```

#### `backend/.env` (로컬 개발용)
```env
GEMINI_API_KEY=실제_제미나이_API_키
PERPLEXITY_API_KEY=실제_퍼플렉시티_API_키
HOST=0.0.0.0
PORT=8000
LANGSMITH_STUDIO_AUTO_OPEN=false
```

#### `run-all.bat` 수정
```batch
cd /d C:\실제_경로  # ← 프로젝트의 실제 경로로 변경
```

**⚠️ 중요**: "실제 경로" 부분을 프로젝트가 있는 실제 경로로 바꿔야 합니다.

---

## 🔧 기술 스택

### 백엔드
- **Python 3.11+**
- **FastAPI** - REST API 서버
- **LangGraph** - 워크플로우 오케스트레이션
- **LangChain** - LLM 통합
- **Gemini 2.0 Flash** - 멀티모달 LLM
- **Perplexity API** - 실시간 웹 검색
- **Pillow** - 이미지 처리 🆕
- **python-multipart** - FormData 처리 🆕

### 프론트엔드
- **React 19**
- **TypeScript**
- **Vite** - 빌드 도구
- **Axios** - HTTP 클라이언트
- **React Markdown** - 마크다운 렌더링
- **Tailwind CSS** - 스타일링

### 인프라
- **MemorySaver** - 휘발성 메모리 (세션별)
- **PostgreSQL** - 영구 저장소 (Docker 배포 시)
- **Redis** - 캐싱 (Docker 배포 시)

---

## 📝 주요 개선 사항

### 🆕 v2.0 (멀티모달 버전)


1. ✅ **멀티모달 지원** - 텍스트 + 이미지 동시 입력
2. ✅ **이미지 자동 분석** - Gemini가 이미지 설명 생성
3. ✅ **향상된 검색** - 이미지 설명 포함 검색
4. ✅ **응답 길이 2배** - max_tokens: 4096 → 8192
5. ✅ **이미지 최적화** - 자동 리사이징 + WebP 변환
6. ✅ **UI/UX 개선** - 이미지 업로드 버튼, 미리보기
7. ✅ **파일 크기 제한** - 10MB 이하
8. ✅ **다양한 형식 지원** - JPG, PNG, GIF, WebP, BMP

### v1.0 (기본 버전)
1. ✅ Perplexity 실시간 검색
2. ✅ Gemini AI 분석
3. ✅ 세션 기반 대화 기억
4. ✅ 자동 반복 검색 (최대 3회)
5. ✅ 출처 링크 제공
6. ✅ 관련 질문 제안

---

## 🐛 트러블슈팅

### 이미지 업로드 실패
**문제**: "파일 크기는 10MB 이하여야 합니다"
**해결**: 이미지 크기를 줄이거나 압축하세요

**문제**: 이미지가 업로드되지 않음
**해결**: 지원 형식 확인 (JPG, PNG, GIF, WebP, BMP)

### 백엔드 실행 오류
**문제**: "GEMINI_API_KEY not found"
**해결**: `backend/.env` 파일에 API 키 설정 확인

**문제**: "ModuleNotFoundError: No module named 'PIL'"
**해결**: 
```bash
cd backend
pip install Pillow python-multipart
```

### 프론트엔드 연결 오류
**문제**: CORS 오류 발생
**해결**: 백엔드가 포트 2024에서 실행 중인지 확인

### 응답 시간 느림
**원인**: 이미지 분석 추가로 2-3초 증가
**정상**: 멀티모달 처리는 추가 시간 소요

---

## 📌 포트 정보


- **프론트엔드**: 5173 (Vite)
- **백엔드 (로컬)**: 2024 (langgraph dev)
- **백엔드 (Docker)**: 8123
- **PostgreSQL**: 5433
- **Redis**: 6379

---

## 💡 사용 팁

### 이미지 활용 방법
1. **음식 사진** → 레시피, 영양 정보, 유사 요리 검색
2. **제품 이미지** → 리뷰, 가격 비교, 대안 제품 추천
3. **장소 사진** → 위치 정보, 역사, 관광 정보
4. **동식물 사진** → 종 식별, 특성, 서식지 정보
5. **에러 스크린샷** → 문제 진단, 해결 방법 검색

### 검색 최적화
- 구체적인 질문 사용
- 이미지와 텍스트를 함께 제공하면 더 정확한 답변
- 관련 질문 버튼 활용하여 추가 정보 탐색

### 대화 관리
- "새 대화" 버튼으로 새 세션 시작
- 같은 탭에서는 대화 기록 유지
- 새로고침하면 세션 초기화

---

## 🔐 보안 및 제한사항

### 파일 업로드 제한
- 최대 파일 크기: 10MB
- 이미지 최대 해상도: 3072x3072
- 지원 형식만 업로드 가능

### API 사용량
- Gemini API: 이미지 포함 시 토큰 사용량 증가
- Perplexity API: 검색당 1회 요청
- 최대 3회 반복 검색 가능

---

## 🚀 향후 개발 계획

### 예정된 기능
- [ ] PDF 문서 지원
- [ ] 여러 이미지 동시 업로드
- [ ] 음성 입력 지원 (Whisper)
- [ ] 대화 기록 영구 저장 (PostgreSQL)
- [ ] 이미지 편집 (크롭, 회전)
- [ ] 다크/라이트 모드
- [ ] 검색 히스토리
- [ ] 출처 미리보기

---

## 📄 라이선스


MIT License

---

## 🎓 참고 자료

### API 문서
- [Gemini API](https://ai.google.dev/)
- [Perplexity API](https://docs.perplexity.ai/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
