import React, { useState } from 'react';

const faqs = [
  {
    question: 'What is TalentTrade?',
    answer: 'TalentTrade is a platform that connects talented individuals and service providers, allowing them to exchange services, collaborate on projects, and build their portfolios.'
  },
  {
    question: 'How do I get started?',
    answer: 'Sign up for a free account, complete your profile, and start browsing or offering services. You can favorite services, chat with other users, and leave reviews after collaborations.'
  },
  {
    question: 'How does the service exchange work?',
    answer: 'You can offer your skills in exchange for other services. Negotiate terms directly with other users, agree on deliverables, and complete the exchange through the platform.'
  },
  {
    question: 'Is TalentTrade free to use?',
    answer: 'Yes, TalentTrade is free for users. We aim to empower talent and foster collaboration without barriers.'
  },
  {
    question: 'How do I ensure a safe and successful exchange?',
    answer: 'Always communicate through the platform, clarify expectations, and leave honest reviews. Our team is here to help if you encounter any issues.'
  }
];

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="helpcenter-container">
      <style>{`
        .helpcenter-container {
          max-width: 700px;
          margin: 2rem auto;
          background: #fff;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          padding: 2rem 1.5rem;
        }
        .helpcenter-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .helpcenter-subtitle {
          font-size: 1.1rem;
          color: #64748b;
          margin-bottom: 2rem;
          text-align: center;
        }
        .helpcenter-faq-section {
          margin-top: 2.5rem;
        }
        .helpcenter-faq-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }
        .helpcenter-faq-list {
          display: grid;
          gap: 1rem;
        }
        .helpcenter-faq-item {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: #f8fafc;
          padding: 1rem 1.25rem;
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .helpcenter-faq-item.open {
          background: #e0e7ff;
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37,99,235,0.08);
        }
        .helpcenter-faq-question {
          font-weight: 600;
          color: #2563eb;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .helpcenter-faq-answer {
          margin-top: 0.75rem;
          color: #334155;
          font-size: 1rem;
        }
      `}</style>
      <div className="helpcenter-title">Welcome to TalentTrade Help Center</div>
      <div className="helpcenter-subtitle">
        TalentTrade is your platform for exchanging skills, building your portfolio, and collaborating with talented people from all over the world.<br/>
        Here's how to get the most out of your experience:
      </div>
      <div className="helpcenter-faq-section">
        <div className="helpcenter-faq-title">Frequently Asked Questions</div>
        <div className="helpcenter-faq-list">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`helpcenter-faq-item${openIndex === idx ? ' open' : ''}`}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <div className="helpcenter-faq-question">
                {faq.question}
                <span>{openIndex === idx ? '−' : '+'}</span>
              </div>
              {openIndex === idx && (
                <div className="helpcenter-faq-answer">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter; 