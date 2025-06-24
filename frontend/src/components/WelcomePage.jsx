import React, { useState } from 'react'

const WelcomePage = ({ onStartSurvey }) => {
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        consent: false
    })

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.consent) {
            alert('Please agree to the consent agreement')
            return
        }
        const userId = 'user_' + Math.random().toString(36).substring(2, 11)
        onStartSurvey({ ...formData, userId })
    }

    return (
        <div className="container">
            <div className="welcome-header">
                <h1 className="title">🎲 Spatial-DISE</h1>
            </div>

            <div className="card">
                <h2>📋 Test Instructions</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-icon">🎯</span>
                        <div>
                            <strong>Test Purpose</strong>
                            <p>To assess your spatial reasoning and visual cognitive abilities.</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">⏱️</span>
                        <div>
                            <strong>Estimated Time</strong>
                            <p>Approximately 15-20 minutes, 30 questions.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2>👤 Participant Information</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <select
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                            >
                                <option value="">Please select</option>
                                <option value="18-25">18-25 years</option>
                                <option value="26-35">26-35 years</option>
                                <option value="36-45">36-45 years</option>
                                <option value="46-55">46-55 years</option>
                                <option value="55+">Over 55 years</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="gender">Gender</label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value="">Please select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="consent-section">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="consent"
                                checked={formData.consent}
                                onChange={handleInputChange}
                                required
                            />
                            <span className="checkmark"></span>
                            I agree to participate in this cognitive ability assessment, understanding that the data will be used for research purposes and my personal privacy will be protected.
                        </label>
                    </div>

                    <button type="submit" className="btn-primary btn-large">
                        🚀 Start Test
                    </button>
                </form>
            </div>

            <div className="footer">
                <p>🔒 Your data is secure | 🧬 Based on the Spatial-DISE Bench | 🏛️ For research purposes</p>
            </div>
        </div>
    )
}

export default WelcomePage 