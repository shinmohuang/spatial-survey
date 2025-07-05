import React from 'react'
import { useTranslation } from 'react-i18next';

const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
    const { t, i18n } = useTranslation();
    if (!question) return null

    const handleAnswerClick = (answer) => {
        onAnswerSelect(question.position, answer)
    }

    // Adapt to the new booklet format where options are a JSON string.
    const getOptionList = (q) => {
        if (!q?.options || typeof q.options !== 'string') {
            return []
        }

        const optionsStr = q.options.trim()

        // Handle JSON or Python-style dict strings: `{"A": "..."}` or `{'A': '...'}`
        if (optionsStr.startsWith('{')) {
            try {
                return Object.keys(JSON.parse(optionsStr))
            } catch (e) {
                try {
                    const fixedString = optionsStr.replace(/'/g, '"')
                    return Object.keys(JSON.parse(fixedString))
                } catch (e2) {
                    console.error(`Error parsing options object for question #${question.position}:`, optionsStr, e2)
                    return []
                }
            }
        }

        // Handle simple comma-separated strings: "A, B, C, D"
        if (optionsStr.length > 0) {
            return optionsStr.split(',').map(s => s.trim())
        }

        return []
    }

    const optionList = getOptionList(question)

    return (
        <div className="question-card">
            <div className="question-header">
                <div className="question-meta">
                    <span className="category-tag">{question.category}</span>
                    <span className="difficulty-tag">{question.difficulty}</span>
                </div>
                <div className="question-id">#{question.position}</div>
            </div>

            <div className="question-content">
                <h3 className="question-text">
                    {i18n.language === 'zh' && question.question_zh ? question.question_zh : question.question}
                </h3>

                {question.image && (
                    <div className="question-image">
                        <img
                            src={question.image}
                            alt="Question illustration"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'block'
                            }}
                        />
                        <div className="image-error" style={{ display: 'none' }}>
                            ⚠️ {t('questionCard.imageFailedToLoad')}
                        </div>
                    </div>
                )}
            </div>

            <div className="options-container">
                <h4>{t('questionCard.pleaseSelectAnAnswer')}</h4>
                <div className="options-grid">
                    {optionList.map((option, index) => (
                        <button
                            key={`${option}-${index}`}
                            className={`option-button ${selectedAnswer === option ? 'selected' : ''}`}
                            onClick={() => handleAnswerClick(option)}
                        >
                            <span className="option-letter">{option}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="question-footer">
                <div className="answer-indicator">
                    {selectedAnswer ? (
                        <span className="selected-answer">✓ {t('questionCard.answerSelected', { answer: selectedAnswer })}</span>
                    ) : (
                        <span className="no-answer">{t('questionCard.noAnswer')}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuestionCard 