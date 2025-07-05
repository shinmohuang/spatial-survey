import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import ConsentPage from './components/ConsentPage'
import WelcomePage from './components/WelcomePage'
import SurveyPage from './components/SurveyPage'
import CompletionPage from './components/CompletionPage'
import { db } from './firebase'
import { collection, addDoc } from 'firebase/firestore'

const BACKEND_BASE = 'https://your-api-gateway-url'  // 替换为实际的API Gateway URL

function App() {
  const { t, i18n } = useTranslation();
  const [currentPhase, setCurrentPhase] = useState('consent') // consent, welcome, survey, completed
  const [userInfo, setUserInfo] = useState(null)
  const [consentData, setConsentData] = useState(null)
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

  // Handle consent completion
  const handleConsentComplete = async (consentInfo) => {
    // Generate user ID
    const userId = 'user_' + Math.random().toString(36).substring(2, 11);
    const consentRecord = {
      userId: userId,
      consentGiven: consentInfo.consentGiven,
      consentTimestamp: consentInfo.consentTimestamp,
      userAgent: navigator.userAgent
    };

    try {
      // Try to save consent record to Firestore
      const docRef = await addDoc(collection(db, "consent_records"), consentRecord);
      console.log("Consent record saved to Firestore with ID: ", docRef.id);

      const finalConsentData = {
        ...consentRecord,
        consentRecordId: docRef.id,
        saveMethod: 'firestore'
      };
      setConsentData(finalConsentData);
      setCurrentPhase('welcome');

    } catch (e) {
      console.error("Error saving consent record to Firestore: ", e);

      // Fallback strategy: save to local storage
      try {
        const localConsentData = {
          ...consentRecord,
          savedAt: new Date().toISOString(),
          saveMethod: 'localStorage',
          error: e.message
        };
        localStorage.setItem(`consent_${userId}`, JSON.stringify(localConsentData));
        console.log("Consent record saved to localStorage as fallback");

        const finalConsentData = {
          ...consentRecord,
          consentRecordId: `local_${userId}`,
          saveMethod: 'localStorage'
        };
        setConsentData(finalConsentData);
        setCurrentPhase('welcome');
        alert(t('app.consentSaveLocal'));

      } catch (localError) {
        console.error("Error saving to localStorage: ", localError);

        // Final fallback: still allow to continue, but record the error
        const finalConsentData = {
          ...consentRecord,
          consentRecordId: `error_${userId}`,
          saveMethod: 'none',
          error: e.message,
          localError: localError.message
        };
        setConsentData(finalConsentData);
        setCurrentPhase('welcome');
        alert(t('app.consentSaveError'));

        // We can throw the error to be caught by the caller component if needed
        throw localError;
      }
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
    // 合并 consent 数据和用户信息
    const combinedUserInfo = {
      ...info,
      userId: consentData.userId, // 使用 consent 阶段生成的 userId
      consentRecordId: consentData.consentRecordId,
      consentTimestamp: consentData.consentTimestamp
    }
    setUserInfo(combinedUserInfo)
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
      alert(t('app.loadSurveyError'))
    }
  }

  const handleSurveyComplete = async (allResponses) => {
    setResponses(allResponses)
    setCurrentPhase('completed') // Immediately transition to completion page for better UX

    try {
      const payload = {
        ...allResponses,
        userInfo,
        userId: userInfo.userId,
        completedAt: new Date(),
        // 包含同意相关信息
        consentData: {
          consentRecordId: userInfo.consentRecordId,
          consentTimestamp: userInfo.consentTimestamp,
          consentGiven: true,
          saveMethod: userInfo.saveMethod || 'firestore'
        }
      }
      const docRef = await addDoc(collection(db, "results"), payload)
      console.log("Survey results saved to Firestore with ID: ", docRef.id)
    } catch (e) {
      console.error("Error adding document to Firestore: ", e)
      // Fallback or error handling
      const fallbackData = {
        ...allResponses,
        userInfo,
        consentData: {
          consentRecordId: userInfo.consentRecordId,
          consentTimestamp: userInfo.consentTimestamp,
          consentGiven: true,
          saveMethod: userInfo.saveMethod || 'firestore'
        },
        error: "Firestore save failed",
        fallbackSavedAt: new Date().toISOString()
      }

      localStorage.setItem(`survey_fallback_${userInfo.userId}`, JSON.stringify(fallbackData))
      console.log("Survey results saved to localStorage as fallback")
    }

    // You can keep the old saveResponses logic as a backup or for other purposes
    const saved = await saveResponses(allResponses)
    if (!saved) {
      console.log("Primary save method (backend API) failed, but attempting Firestore save.")
    }
  }

  const renderPhase = () => {
    switch (currentPhase) {
      case 'consent':
        return <ConsentPage onConsentComplete={handleConsentComplete} />
      case 'welcome':
        return <WelcomePage onStartSurvey={handleStartSurvey} />
      case 'survey':
        return <SurveyPage surveyData={surveyData} bookletId={bookletId} onComplete={handleSurveyComplete} />
      case 'completed':
        return <CompletionPage userInfo={userInfo} bookletId={bookletId} responses={responses} surveyData={surveyData} />
      default:
        return <WelcomePage onStartSurvey={handleStartSurvey} />
    }
  }

  return (
    <div className="App">
      <div className="language-switcher">
        <button onClick={() => i18n.changeLanguage('en')} disabled={i18n.language === 'en'}>English</button>
        <button onClick={() => i18n.changeLanguage('zh')} disabled={i18n.language === 'zh'}>中文</button>
      </div>
      {renderPhase()}
    </div>
  )
}

export default App
