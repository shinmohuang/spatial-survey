import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { db } from '../firebase'
import { collection, addDoc } from "firebase/firestore"

const CompletionPage = ({ userInfo, bookletId, responses, surveyData }) => {
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState({})

    useEffect(() => {
        // Calculate test statistics
        const calculateStats = () => {
            const userResponses = responses.responses || {};
            const totalQuestions = surveyData.length;
            let correctAnswers = 0;

            surveyData.forEach(question => {
                if (userResponses[question.position] === question.answer) {
                    correctAnswers++;
                }
            });

            const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
            const totalTime = responses.total_time || 0
            const avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0

            return {
                totalQuestions,
                correctAnswers,
                accuracy,
                totalTime,
                avgTimePerQuestion,
                completedAt: responses.completed_at || new Date().toISOString()
            }
        }

        if (surveyData && surveyData.length > 0) {
            setStats(calculateStats());
        }
    }, [responses, surveyData]);

    useEffect(() => {
        const saveResults = async () => {
            if (!userInfo || !userInfo.userId || !stats.accuracy) {
                console.log("User info or stats not available, skipping save.")
                return;
            }

            try {
                const docRef = await addDoc(collection(db, "responses"), {
                    userId: userInfo.userId,
                    bookletId: bookletId,
                    age: userInfo.age,
                    gender: userInfo.gender,
                    ...responses,
                    stats: stats,
                });
                console.log("Document written with ID: ", docRef.id);
            } catch (e) {
                console.error("Error adding document: ", e);
                // Optionally, inform the user that saving failed
            }
        };

        if (stats.accuracy) {
            saveResults();
        }
    }, [userInfo, bookletId, responses, stats]); // Dependencies to ensure this runs only when data is available

    const formatTime = (ms) => {
        if (isNaN(ms)) return '0m 0s'
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}m ${seconds}s`
    }

    const downloadResults = () => {
        const data = {
            userInfo,
            bookletId,
            responses,
            stats,
            completedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `spatial-survey-results-${userInfo.userId}-${bookletId}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="container">
            <h1 className="title fade-in">🎉 {t('completionPage.title')}</h1>

            <div className="card fade-in">
                <h2 className="subtitle">{t('completionPage.thankYou')}</h2>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                    <p style={{ fontSize: '18px', color: 'var(--success-color)', fontWeight: '600' }}>
                        {t('completionPage.successMessage', { bookletId })}
                    </p>
                </div>

                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-value">{stats.totalQuestions}</div>
                        <div className="stat-label">{t('completionPage.questionsCompleted')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.correctAnswers} / {stats.totalQuestions}</div>
                        <div className="stat-label">{t('completionPage.correctAnswers')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.accuracy?.toFixed(1)}%</div>
                        <div className="stat-label">{t('completionPage.accuracy')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{formatTime(stats.totalTime)}</div>
                        <div className="stat-label">{t('completionPage.totalTime')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{formatTime(stats.avgTimePerQuestion)}</div>
                        <div className="stat-label">{t('completionPage.avgTimePerQ')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">#{bookletId}</div>
                        <div className="stat-label">{t('completionPage.bookletId')}</div>
                    </div>
                </div>
            </div>

            <div className="card fade-in">
                <h3>📊 {t('completionPage.testInformation')}</h3>
                <div className="info-table">
                    <div className="info-row">
                        <span className="info-key">{t('completionPage.userId')}</span>
                        <span className="info-value">{userInfo.userId}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-key">{t('completionPage.bookletId')}:</span>
                        <span className="info-value">#{bookletId}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-key">{t('completionPage.completionTime')}</span>
                        <span className="info-value">
                            {new Date(stats.completedAt).toLocaleString(i18n.language)}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-key">{t('completionPage.age')}</span>
                        <span className="info-value">{userInfo.age || t('completionPage.notProvided')}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-key">{t('completionPage.gender')}</span>
                        <span className="info-value">{userInfo.gender || t('completionPage.notProvided')}</span>
                    </div>
                </div>
            </div>

            <div className="action-buttons">
                <button onClick={downloadResults} className="btn-secondary">
                    💾 {t('completionPage.downloadResults')}
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                >
                    🔄 {t('completionPage.retakeTest')}
                </button>
            </div>

            <div className="footer">
                <p>
                    {t('completionPage.footer')}
                </p>
            </div>
        </div>
    )
}

export default CompletionPage 