import React, { useState, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next';

const ConsentPage = ({ onConsentComplete }) => {
    const { t } = useTranslation();
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
            alert(t('consentPage.agreeAlert'))
            return
        }

        setIsSubmitting(true)
        try {
            // App.jsx will handle the submission and navigation
            await onConsentComplete({ consentGiven: true, consentTimestamp: new Date() });
        } catch (error) {
            // The App component will show a specific alert. 
            // This is a final catch-all if the promise from App.jsx rejects.
            alert(t('consentPage.consentError'));
            console.error('Submission failed in ConsentPage:', error);
            setIsSubmitting(false)
        }
        // No need to set isSubmitting to false here, as the component will unmount on success.
    }

    return (
        <div className="container">
            <div className="welcome-header">
                <h1 className="title">🔒 {t('consentPage.title')}</h1>
            </div>

            <div className="card">
                <h2>📄 {t('consentPage.researchInfoTitle')}</h2>
                <p style={{ fontSize: '1.1em', marginBottom: '30px', color: 'var(--text-primary)' }}>
                    {t('consentPage.researchInfoText')}
                </p>

                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-icon">📋</span>
                        <div>
                            <strong>{t('consentPage.participantInfoSheet')}</strong>
                            <p>{t('consentPage.participantInfoSheetText')}</p>
                            <a
                                href={`${import.meta.env.BASE_URL}Participant Information Sheet.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pdf-link"
                            >
                                📖 {t('consentPage.viewParticipantInfoSheet')}
                            </a>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">✍️</span>
                        <div>
                            <strong>{t('consentPage.informedConsentForm')}</strong>
                            <p>{t('consentPage.informedConsentFormText')}</p>
                            <a
                                href={`${import.meta.env.BASE_URL}Participant Consent Form.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pdf-link"
                            >
                                📄 {t('consentPage.viewInformedConsentForm')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2>✅ {t('consentPage.consentConfirmation')}</h2>
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
                                <Trans i18nKey="consentPage.consentCheckboxLabel">
                                    I have carefully read and understood the contents of the <strong>Participant Information Sheet</strong> and <strong>Informed Consent Form</strong>.
                                    I understand the purpose, process, risks, and benefits of the research, and voluntarily agree to participate in this spatial cognitive ability study.
                                    I understand that I have the right to withdraw from the study at any time, and that my personal information will be kept confidential.
                                </Trans>
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-large"
                        disabled={!consentGiven || isSubmitting}
                    >
                        {isSubmitting ? `⏳ ${t('consentPage.saving')}` : `✅ ${t('consentPage.agreeAndContinue')}`}
                    </button>
                </form>
            </div>

            <div className="footer">
                <p>
                    {t('consentPage.footer')}
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
                        {isOnline ? `🟢 ${t('consentPage.networkStatusOnline')}` : `🔴 ${t('consentPage.networkStatusOffline')}`}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ConsentPage 