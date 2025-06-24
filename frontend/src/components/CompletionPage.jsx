import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from "firebase/firestore"

const CompletionPage = ({ userInfo, bookletId, responses, surveyData }) => {
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
            <h1 className="title fade-in">🎉 Test Completed!</h1>

            <div className="card fade-in">
                <h2 className="subtitle">Thank you for participating in the spatial reasoning assessment.</h2>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                    <p style={{ fontSize: '18px', color: 'var(--success-color)', fontWeight: '600' }}>
                        You have successfully completed all questions in booklet #{bookletId}.
                    </p>
                </div>

                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-value">{stats.totalQuestions}</div>
                        <div className="stat-label">Questions Completed</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.correctAnswers} / {stats.totalQuestions}</div>
                        <div className="stat-label">Correct Answers</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.accuracy?.toFixed(1)}%</div>
                        <div className="stat-label">Accuracy</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{formatTime(stats.totalTime)}</div>
                        <div className="stat-label">Total Time</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{formatTime(stats.avgTimePerQuestion)}</div>
                        <div className="stat-label">Avg. Time / Q</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">#{bookletId}</div>
                        <div className="stat-label">Booklet ID</div>
                    </div>
                </div>
            </div>

            <div className="card fade-in">
                <h3>📊 Test Information</h3>
                <div className="info-table">
                    <div className="info-row">
                        <span className="info-key">User ID:</span>
                        <span className="info-value">{userInfo.userId}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-key">Booklet ID:</span>
                        <span className="info-value">#{bookletId}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-key">Completion Time:</span>
                        <span className="info-value">
                            {new Date(stats.completedAt).toLocaleString('en-US')}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-key">Age:</span>
                        <span className="info-value">{userInfo.age || 'Not provided'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-key">Gender:</span>
                        <span className="info-value">{userInfo.gender || 'Not provided'}</span>
                    </div>
                </div>
            </div>

            <div className="action-buttons">
                <button onClick={downloadResults} className="btn-secondary">
                    💾 Download Results
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                >
                    🔄 Retake Test
                </button>
            </div>

            <div className="footer">
                <p>
                    🔒 Your data has been securely saved |
                    🧬 Based on the Spatial-DISE dataset |
                    🏛️ For research purposes |
                    📧 Contact the research team for any questions
                </p>
            </div>
        </div>
    )
}

export default CompletionPage 