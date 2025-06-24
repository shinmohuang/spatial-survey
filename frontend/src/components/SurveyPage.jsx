import React, { useState, useEffect } from 'react'
import QuestionCard from './QuestionCard'

const SurveyPage = ({ surveyData, bookletId, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [responses, setResponses] = useState({})
    const [startTime] = useState(Date.now())
    const [questionStartTime, setQuestionStartTime] = useState(Date.now())
    const [responseTimes, setResponseTimes] = useState({})
    const [elapsedTime, setElapsedTime] = useState(0)

    const currentQuestion = surveyData[currentQuestionIndex]
    const totalQuestions = surveyData.length
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

    useEffect(() => {
        setQuestionStartTime(Date.now())
    }, [currentQuestionIndex])

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(Date.now() - startTime)
        }, 1000)

        return () => clearInterval(timer)
    }, [startTime])

    const handleAnswerSelect = (questionId, answer) => {
        const responseTime = Date.now() - questionStartTime

        setResponses(prev => ({
            ...prev,
            [questionId]: answer
        }))

        setResponseTimes(prev => ({
            ...prev,
            [questionId]: responseTime
        }))
    }

    const goToNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            // 完成测试
            const finalData = {
                responses,
                response_times: responseTimes,
                total_time: Date.now() - startTime,
                booklet_id: bookletId,
                completed_at: new Date().toISOString()
            }
            onComplete(finalData)
        }
    }

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const isCurrentQuestionAnswered = () => {
        return responses.hasOwnProperty(currentQuestion?.position)
    }

    const getAnsweredCount = () => {
        return Object.keys(responses).length
    }

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    if (!currentQuestion) {
        return <div className="container">Loading...</div>
    }

    return (
        <div className="survey-container">
            {/* Top Navigation Bar */}
            <div className="survey-header">
                <div className="survey-info">
                    <span className="booklet-id">📚 Booklet #{bookletId}</span>
                    <span className="question-counter">
                        Question {currentQuestionIndex + 1} / {totalQuestions}
                    </span>
                    <span className="timer">
                        ⏱️ {formatTime(elapsedTime)}
                    </span>
                </div>

                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Area */}
            <div className="question-area">
                <QuestionCard
                    question={currentQuestion}
                    selectedAnswer={responses[currentQuestion.position]}
                    onAnswerSelect={handleAnswerSelect}
                />
            </div>

            {/* Bottom Navigation */}
            <div className="survey-footer">
                <div className="nav-buttons">
                    <button
                        onClick={goToPrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="btn-secondary"
                    >
                        ← Previous
                    </button>

                    <div className="middle-info">
                        <span className="answered-count">
                            Answered: {getAnsweredCount()} / {totalQuestions}
                        </span>
                    </div>

                    <button
                        onClick={goToNextQuestion}
                        className={isCurrentQuestionAnswered() ? 'btn-primary' : 'btn-secondary'}
                        disabled={!isCurrentQuestionAnswered() && currentQuestionIndex < totalQuestions - 1}
                    >
                        {currentQuestionIndex === totalQuestions - 1 ? 'Finish Test ✓' : 'Next →'}
                    </button>
                </div>

                {/* Question Jump Navigation */}
                <div className="question-nav">
                    {surveyData.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`nav-dot ${index === currentQuestionIndex ? 'current' :
                                responses[surveyData[index].position] ? 'answered' : 'unanswered'
                                }`}
                            title={`Question ${index + 1}${responses[surveyData[index].position] ? ' (Answered)' : ''}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SurveyPage 