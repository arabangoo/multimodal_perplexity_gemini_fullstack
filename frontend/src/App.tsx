import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import './global.css'

const API_URL = 'http://127.0.0.1:2024'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: string[]
  relatedQuestions?: string[]
  iterations?: number
  imagePreview?: string
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 세션 ID 생성
  useEffect(() => {
    let sid = sessionStorage.getItem('chat_session_id')
    if (!sid) {
      sid = generateUUID()
      sessionStorage.setItem('chat_session_id', sid)
    }
    setSessionId(sid)
    console.log('🔑 Session ID:', sid)
  }, [])

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }
      
      setSelectedImage(file)
      
      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 이미지 제거
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage) || loading || !sessionId) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim() || '이미지를 분석해주세요',
      imagePreview: imagePreview || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    const currentImage = selectedImage
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setLoading(true)

    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('query', userMessage.content)
      formData.append('session_id', sessionId)
      
      if (currentImage) {
        formData.append('file', currentImage)
      }

      const response = await axios.post(`${API_URL}/api/research`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.answer,
        citations: response.data.citations || [],
        relatedQuestions: response.data.related_questions || [],
        iterations: response.data.iterations || 0
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    const sid = generateUUID()
    sessionStorage.setItem('chat_session_id', sid)
    setSessionId(sid)
    console.log('🔑 New Session ID:', sid)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔬</div>
            <div>
              <h1 className="text-xl font-bold text-white">Multimodal Perplexity + Gemini Research</h1>
              <p className="text-sm text-gray-400">실시간 웹 검색 + AI 분석 + 이미지 지원</p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            새 대화
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="max-w-4xl mx-auto space-y-4 min-h-full">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-white mb-2">궁금한 것을 물어보세요</h2>
              <p className="text-gray-400">텍스트와 이미지를 함께 보낼 수 있습니다</p>
              <p className="text-gray-500 text-sm mt-2">지원 형식: JPG, PNG, GIF, WebP (최대 10MB)</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 break-words overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="space-y-2">
                    {msg.imagePreview && (
                      <div className="mb-2">
                        <img 
                          src={msg.imagePreview} 
                          alt="Uploaded" 
                          className="max-w-full max-h-64 rounded border-2 border-blue-400"
                        />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-invert max-w-none break-words">
                      <ReactMarkdown 
                        components={{
                          p: ({children}) => <p className="break-words">{children}</p>,
                          a: ({href, children}) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-400 hover:text-blue-300 underline break-all"
                            >
                              {children}
                            </a>
                          )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {msg.iterations && msg.iterations > 0 && (
                      <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                        🔄 검색 반복: {msg.iterations}회
                      </div>
                    )}

                    {msg.citations && msg.citations.length > 0 && (
                      <div className="border-t border-gray-700 pt-3 space-y-2">
                        <p className="text-sm font-semibold text-blue-400">📚 참고 출처</p>
                        <div className="space-y-1 text-xs">
                          {msg.citations.map((cite, i) => (
                            <div key={i} className="text-gray-400 hover:text-blue-400 transition break-all">
                              <a 
                                href={cite} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="underline break-all"
                              >
                                [{i + 1}] {cite}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                      <div className="border-t border-gray-700 pt-3 space-y-2">
                        <p className="text-sm font-semibold text-blue-400">🔗 관련 질문</p>
                        <div className="space-y-1 text-sm">
                          {msg.relatedQuestions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setInput(q)
                              }}
                              className="block text-left w-full p-2 rounded hover:bg-gray-700 transition text-gray-300 break-words"
                            >
                              • {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-gray-400">이미지 분석 및 검색 중...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* 이미지 미리보기 */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-32 rounded border-2 border-blue-500"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          )}
          
          <div className="flex gap-2">
            {/* 이미지 업로드 버튼 */}
            <label className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition flex items-center justify-center">
              <span className="text-xl">📎</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={loading}
              />
            </label>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력하거나 이미지를 업로드하세요..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedImage)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '전송 중...' : '전송'}
            </button>
          </div>
          {sessionId && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Session: {sessionId.substring(0, 8)}... | 메모리 저장: 휘발성 (새로고침 시 초기화)
            </p>
          )}
        </form>
      </footer>
    </div>
  )
}
