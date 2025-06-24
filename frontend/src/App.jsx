import React, { useState, useEffect } from 'react'
import WelcomePage from './components/WelcomePage'
import SurveyPage from './components/SurveyPage'
import CompletionPage from './components/CompletionPage'

const BACKEND_BASE = 'https://your-api-gateway-url'  // 替换为实际的API Gateway URL

function App() {
  const [currentPhase, setCurrentPhase] = useState('welcome') // welcome, survey, completed
  const [userInfo, setUserInfo] = useState(null)
  const [bookletId, setBookletId] = useState(null)
  const [surveyData, setSurveyData] = useState(null)
  const [responses, setResponses] = useState({})

  // 获取分配的测卷
  const assignBooklet = async () => {
    try {
      // 本地开发时使用随机分配
      if (BACKEND_BASE.includes('your-api-gateway-url')) {
        const randomBookletId = Math.floor(Math.random() * 19)
        // const randomBookletId = 5 // Hardcode for testing
        setBookletId(randomBookletId)
        return randomBookletId
      }

      // 生产环境调用后端API
      const response = await fetch(`${BACKEND_BASE}/assign_booklet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      setBookletId(data.booklet_id)
      return data.booklet_id
    } catch (error) {
      console.error('Failed to assign booklet:', error)
      // 降级到随机分配
      const randomBookletId = Math.floor(Math.random() * 19)
      setBookletId(randomBookletId)
      return randomBookletId
    }
  }

  // 保存响应数据
  const saveResponses = async (allResponses) => {
    try {
      const payload = {
        user_id: userInfo.userId,
        booklet_id: bookletId,
        responses: allResponses,
        ts: Date.now(),
        user_info: userInfo
      }

      // 本地开发时保存到localStorage
      if (BACKEND_BASE.includes('your-api-gateway-url')) {
        localStorage.setItem(`survey_${userInfo.userId}`, JSON.stringify(payload))
        console.log('Responses saved locally:', payload)
        return true
      }

      // 生产环境调用后端API
      const response = await fetch(`${BACKEND_BASE}/save_response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      return response.ok
    } catch (error) {
      console.error('Failed to save responses:', error)
      // 降级到本地存储
      localStorage.setItem(`survey_${userInfo.userId}`, JSON.stringify({
        user_id: userInfo.userId,
        booklet_id: bookletId,
        responses: allResponses,
        ts: Date.now(),
        error: error.message
      }))
      return false
    }
  }

  const handleStartSurvey = async (info) => {
    setUserInfo(info)
    const assignedBookletId = await assignBooklet()

    // 加载对应的测卷数据
    try {
      const bookletResponse = await fetch(`${import.meta.env.BASE_URL}booklets/${assignedBookletId}.json`)
      const bookletData = await bookletResponse.json()
      setSurveyData(bookletData)
      setCurrentPhase('survey')
    } catch (error) {
      console.error('Failed to load survey data:', error)
      console.error('Tried to load:', `${import.meta.env.BASE_URL}booklets/${assignedBookletId}.json`)
      alert('加载测试题目失败，请刷新页面重试')
    }
  }

  const handleSurveyComplete = async (allResponses) => {
    setResponses(allResponses)
    const saved = await saveResponses(allResponses)
    setCurrentPhase('completed')
  }

  return (
    <div className="App">
      {currentPhase === 'welcome' && (
        <WelcomePage onStartSurvey={handleStartSurvey} />
      )}

      {currentPhase === 'survey' && surveyData && (
        <SurveyPage
          surveyData={surveyData}
          bookletId={bookletId}
          onComplete={handleSurveyComplete}
        />
      )}

      {currentPhase === 'completed' && (
        <CompletionPage
          userInfo={userInfo}
          bookletId={bookletId}
          responses={responses}
        />
      )}
    </div>
  )
}

export default App
