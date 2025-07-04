import React, { useState, useEffect } from 'react'

const ConsentPage = ({ onConsentComplete }) => {
    const [consentGiven, setConsentGiven] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    const handleConsentChange = (e) => {
        setConsentGiven(e.target.checked)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!consentGiven) {
            alert('Please agree to the informed consent form to participate in the research')
            return
        }

        setIsSubmitting(true)
        try {
            // App.jsx will handle the submission and navigation
            await onConsentComplete({ consentGiven: true, consentTimestamp: new Date() });
        } catch (error) {
            // The App component will show a specific alert. 
            // This is a final catch-all if the promise from App.jsx rejects.
            alert('An error occurred while saving your consent. Please try again.');
            console.error('Submission failed in ConsentPage:', error);
            setIsSubmitting(false)
        }
        // No need to set isSubmitting to false here, as the component will unmount on success.
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

                {/* Network status display */}
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
                    borderRadius: '5px',
                    border: `1px solid ${isOnline ? '#c3e6cb' : '#f5c6cb'}`,
                    fontSize: '0.9em'
                }}>
                    <span style={{
                        color: isOnline ? '#155724' : '#721c24',
                        fontWeight: '600'
                    }}>
                        {isOnline ? '🟢 Network status: Online' : '🔴 Network status: Offline'}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ConsentPage 