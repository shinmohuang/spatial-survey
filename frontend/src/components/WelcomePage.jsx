import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { db } from '../firebase'
import { collection, addDoc } from "firebase/firestore"

const WelcomePage = ({ onStartSurvey }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        age: '',
        gender: ''
    })

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Basic validation
        if (!formData.age || !formData.gender) {
            alert(t('welcomePage.requiredFieldAlert'))
            return
        }

        try {
            const docRef = await addDoc(collection(db, "users"), {
                age: formData.age,
                gender: formData.gender,
                startTime: new Date()
            })
            console.log("User info saved with ID: ", docRef.id)
            onStartSurvey({ ...formData, userRecordId: docRef.id })
        } catch (e) {
            console.error("Error adding document: ", e)
            alert(t('welcomePage.startSurveyError'))
        }
    }

    return (
        <div className="container">
            <div className="welcome-header">
                <h1 className="title">🎲 {t('welcomePage.title')}</h1>
            </div>

            <div className="card">
                <h2>📋 {t('welcomePage.testInstructions')}</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-icon">🎯</span>
                        <div>
                            <strong>{t('welcomePage.testPurpose')}</strong>
                            <p>{t('welcomePage.testPurposeText')}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">⏱️</span>
                        <div>
                            <strong>{t('welcomePage.estimatedTime')}</strong>
                            <p>{t('welcomePage.estimatedTimeText')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2>👤 {t('welcomePage.participantInfo')}</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="age">{t('welcomePage.age')} <span className="required">*</span></label>
                            <select
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">{t('welcomePage.pleaseSelect')}</option>
                                <option value="Under 18">{t('welcomePage.under18')}</option>
                                <option value="18-25">{t('welcomePage.years18_25')}</option>
                                <option value="26-35">{t('welcomePage.years26_35')}</option>
                                <option value="36-45">{t('welcomePage.years36_45')}</option>
                                <option value="46-55">{t('welcomePage.years46_55')}</option>
                                <option value="55+">{t('welcomePage.over55')}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="gender">{t('welcomePage.gender')} <span className="required">*</span></label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">{t('welcomePage.pleaseSelect')}</option>
                                <option value="male">{t('welcomePage.male')}</option>
                                <option value="female">{t('welcomePage.female')}</option>
                                <option value="other">{t('welcomePage.other')}</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary btn-large">
                        🚀 {t('welcomePage.startTest')}
                    </button>
                </form>
            </div>

            <div className="footer">
                <p>{t('welcomePage.footer')}</p>
            </div>
        </div>
    )
}

export default WelcomePage 