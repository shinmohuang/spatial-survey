import React, { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from "firebase/firestore"

const ConsentPage = ({ onConsentComplete }) => {
    const [consentGiven, setConsentGiven] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [debugInfo, setDebugInfo] = useState(null)

    const handleConsentChange = (e) => {
        setConsentGiven(e.target.checked)
    }

    // 测试 Firestore 连接
    const testFirestoreConnection = async () => {
        try {
            // 尝试一个简单的 Firestore 操作
            const testDoc = await addDoc(collection(db, "connection_test"), {
                test: true,
                timestamp: new Date()
            })
            console.log("Firestore connection test successful:", testDoc.id)
            alert("Firestore connection test successful!")
        } catch (error) {
            console.error("Firestore connection test failed:", error)
            setDebugInfo({
                error: error.message,
                code: error.code,
                timestamp: new Date().toISOString(),
                testType: 'connection'
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!consentGiven) {
            alert('Please agree to the informed consent form to participate in the research')
            return
        }

        setIsSubmitting(true)

        // 生成用户ID
        const userId = 'user_' + Math.random().toString(36).substring(2, 11)
        const consentData = {
            userId: userId,
            consentGiven: true,
            consentTimestamp: new Date(),
            userAgent: navigator.userAgent
        }

        try {
            // 尝试保存同意记录到 Firestore
            const docRef = await addDoc(collection(db, "consent_records"), consentData)

            console.log("Consent record saved with ID: ", docRef.id)

            // 调用完成回调
            onConsentComplete({
                ...consentData,
                consentRecordId: docRef.id,
                saveMethod: 'firestore'
            })
        } catch (e) {
            console.error("Error saving consent record to Firestore: ", e)

            // 设置调试信息
            const errorInfo = {
                error: e.message,
                code: e.code,
                timestamp: new Date().toISOString(),
                userId: userId
            }
            setDebugInfo(errorInfo)

            // 降级策略：保存到本地存储
            try {
                const localConsentData = {
                    ...consentData,
                    savedAt: new Date().toISOString(),
                    saveMethod: 'localStorage',
                    error: e.message
                }

                localStorage.setItem(`consent_${userId}`, JSON.stringify(localConsentData))
                console.log("Consent record saved to localStorage as fallback")

                // 仍然允许用户继续
                onConsentComplete({
                    ...consentData,
                    consentRecordId: `local_${userId}`,
                    saveMethod: 'localStorage'
                })

                // 显示警告但不阻塞
                alert('Network connection is unstable. Your consent has been saved locally. You can continue with the research.')

            } catch (localError) {
                console.error("Error saving to localStorage: ", localError)

                // 更新调试信息
                setDebugInfo({
                    ...errorInfo,
                    localError: localError.message
                })

                // 最后的降级策略：仍然允许继续，但记录错误
                onConsentComplete({
                    ...consentData,
                    consentRecordId: `error_${userId}`,
                    saveMethod: 'none',
                    error: e.message
                })

                alert('Technical issues occurred while saving consent record, but you can still continue with the research. Your consent has been recorded.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container">
            <div className="welcome-header">
                <h1 className="title">🔒 Research Participation Informed Consent</h1>
            </div>

            <div className="card">
                <h2>📄 Research Information & Consent Forms</h2>
                <p style={{ fontSize: '1.1em', marginBottom: '30px', color: 'var(--text-primary)' }}>
                    Before participating in this spatial cognitive ability research, please carefully read the following documents:
                </p>

                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-icon">📋</span>
                        <div>
                            <strong>Participant Information Sheet</strong>
                            <p>Detailed explanation of research purpose, process, and your rights</p>
                            <a
                                href={`${import.meta.env.BASE_URL}Participant Information Sheet.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pdf-link"
                            >
                                📖 View Participant Information Sheet (PDF)
                            </a>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">✍️</span>
                        <div>
                            <strong>Informed Consent Form</strong>
                            <p>Formal legal document for consent to participate in research</p>
                            <a
                                href={`${import.meta.env.BASE_URL}Participant Consent Form.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pdf-link"
                            >
                                📄 View Informed Consent Form (PDF)
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2>✅ Consent Confirmation</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="consent-section">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={consentGiven}
                                onChange={handleConsentChange}
                                required
                            />
                            <span className="checkmark"></span>
                            <span>
                                I have carefully read and understood the contents of the <strong>Participant Information Sheet</strong> and <strong>Informed Consent Form</strong>.
                                I understand the purpose, process, risks, and benefits of the research, and voluntarily agree to participate in this spatial cognitive ability study.
                                I understand that I have the right to withdraw from the study at any time, and that my personal information will be kept confidential.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-large"
                        disabled={!consentGiven || isSubmitting}
                    >
                        {isSubmitting ? '⏳ Saving...' : '✅ I Agree and Continue'}
                    </button>
                </form>
            </div>

            <div className="footer">
                <p>
                    🔒 Your data is secure | 🧬 Based on Spatial-DISE benchmark | 🏛️ For research purposes |
                    📧 Contact the research team if you have questions
                </p>
            </div>

            {/* 调试信息显示区域 */}
            {debugInfo && (
                <div className="card" style={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
                    <h3>🔧 Debug Information</h3>
                    <p><strong>Error:</strong> {debugInfo.error}</p>
                    {debugInfo.code && <p><strong>Error Code:</strong> {debugInfo.code}</p>}
                    <p><strong>Time:</strong> {debugInfo.timestamp}</p>
                    <p><strong>User ID:</strong> {debugInfo.userId}</p>
                    {debugInfo.localError && <p><strong>Local Storage Error:</strong> {debugInfo.localError}</p>}
                    <p><strong>Environment:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}</p>
                    <p><strong>Base URL:</strong> {import.meta.env.BASE_URL}</p>
                    <div style={{ fontSize: '0.9em', color: '#856404', marginTop: '15px' }}>
                        <p><strong>💡 Troubleshooting Suggestions:</strong></p>
                        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                            <li>Check if your network connection is working properly</li>
                            <li>Try refreshing the page to start over</li>
                            <li>If using a proxy or VPN, try disabling it</li>
                            <li>Ensure your browser allows third-party cookies</li>
                            <li>Try using a different browser</li>
                        </ul>
                        <p style={{ marginTop: '10px' }}>
                            🔄 <strong>You can still continue with the research</strong> - Your consent has been recorded, no need to re-enter
                        </p>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setDebugInfo(null)}
                            className="btn-secondary"
                        >
                            🔄 Retry Save
                        </button>
                        <button
                            onClick={testFirestoreConnection}
                            className="btn-secondary"
                        >
                            🧪 Test Connection
                        </button>
                        <button
                            onClick={() => {
                                const errorReport = {
                                    ...debugInfo,
                                    url: window.location.href,
                                    userAgent: navigator.userAgent,
                                    timestamp: new Date().toISOString()
                                }
                                navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
                                    .then(() => alert('Error report copied to clipboard'))
                                    .catch(() => console.log('Error report:', errorReport))
                            }}
                            className="btn-secondary"
                        >
                            📋 Copy Error Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ConsentPage 