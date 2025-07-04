import React, { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from "firebase/firestore"

const WelcomePage = ({ onStartSurvey }) => {
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
            alert('Please fill in all required fields')
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
            alert('Could not start survey. Please try again.')
        }
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
                            <label htmlFor="age">Age <span className="required">*</span></label>
                            <select
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Please select</option>
                                <option value="Under 18">Under 18 years</option>
                                <option value="18-25">18-25 years</option>
                                <option value="26-35">26-35 years</option>
                                <option value="36-45">36-45 years</option>
                                <option value="46-55">46-55 years</option>
                                <option value="55+">Over 55 years</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="gender">Gender <span className="required">*</span></label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Please select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
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