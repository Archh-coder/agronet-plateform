// FAQ.jsx — General AgroNet FAQ page at /faq

import { useState } from 'react'

const faqs = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'What is AgroNet?',
        a: 'AgroNet is a contract farming platform that connects farmers directly with buyers. Farmers list their crops, and buyers can browse, negotiate, and form contracts — cutting out middlemen and ensuring fair prices on both sides.'
      },
      {
        q: 'Who can use AgroNet?',
        a: 'Anyone! Farmers register to list their crops and manage orders. Buyers (individuals, businesses, or food processors) register to browse crops and place contract orders. Registration is free.'
      },
      {
        q: 'Is AgroNet free to use?',
        a: 'Browsing and registering is completely free. A small platform fee applies only when a contract is successfully completed — no upfront charges for either farmers or buyers.'
      },
    ]
  },
  {
    section: 'For Farmers',
    items: [
      {
        q: 'How do I list my crop?',
        a: 'After registering as a farmer, go to Dashboard → Add Crop. Fill in the crop name, category, price per kg, available stock, minimum order quantity, and optionally add photos. Your listing goes live immediately.'
      },
      {
        q: 'Can I set a minimum order quantity?',
        a: 'Yes. When adding or editing a crop, set your minimum order quantity (in kg). Buyers will only be able to place orders at or above this threshold.'
      },
      {
        q: 'How do I manage incoming orders?',
        a: 'Go to Dashboard → Orders. You\'ll see all contract requests from buyers. You can accept, negotiate, or decline each one. Once accepted, the contract is binding on both sides.'
      },
      {
        q: 'Can I update my crop listing after publishing?',
        a: 'Yes, you can edit price, stock, and description at any time from your Dashboard. Note that editing price does not affect contracts already accepted.'
      },
    ]
  },
  {
    section: 'For Buyers',
    items: [
      {
        q: 'How do I place a contract order?',
        a: 'Browse to any crop listing and click "View & Contract". Choose your quantity (at or above the minimum order), review the price, and submit your contract request. The farmer will review and respond.'
      },
      {
        q: 'What is the Cart for?',
        a: 'The Cart lets you add multiple crops from different farmers and review them together before placing contract requests. Think of it as a wishlist before committing to contracts.'
      },
      {
        q: 'What if a farmer rejects my contract?',
        a: 'You\'ll receive a notification. You can search for alternative listings for the same crop, or contact the farmer to negotiate a different quantity or price through the listing\'s Q&A section.'
      },
      {
        q: 'Are there delivery services on AgroNet?',
        a: 'AgroNet facilitates contracts and payments. Delivery logistics are agreed upon directly between farmer and buyer within the contract terms. We\'re working on integrated logistics support — stay tuned.'
      },
    ]
  },
  {
    section: 'Contracts & Payments',
    items: [
      {
        q: 'How does contract farming work on AgroNet?',
        a: 'A contract specifies the crop, quantity, price per kg, and delivery terms. Once both parties accept, it\'s legally binding. The buyer pays through the platform; funds are held in escrow and released to the farmer upon delivery confirmation.'
      },
      {
        q: 'What payment methods are supported?',
        a: 'We support UPI, net banking, and major debit/credit cards. All transactions are secured and processed through our payment partner.'
      },
      {
        q: 'What if there is a dispute?',
        a: 'AgroNet has a dispute resolution process. Either party can raise a dispute within 7 days of the expected delivery date. Our support team reviews evidence from both sides and mediates a resolution.'
      },
    ]
  },
  {
    section: 'CropSense AI',
    items: [
      {
        q: 'What is CropSense AI?',
        a: 'CropSense AI is AgroNet\'s built-in AI assistant for farmers. It can suggest optimal crops based on your region and season, help you price competitively, and provide general farming advice. Access it from the top navigation.'
      },
      {
        q: 'Is CropSense AI available to buyers too?',
        a: 'Currently CropSense AI is focused on farmer tools. Buyer-facing AI features (like demand forecasting and crop recommendations) are on our roadmap.'
      },
    ]
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen((v) => !v)}>
        <span>{q}</span>
        <span className={`faq-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="faq-answer">{a}</div>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="faq-container">

      {/* Header */}
      <div className="faq-header">
        <h1 className="faq-title">Frequently Asked Questions</h1>
        <p className="faq-subtitle">
          Everything you need to know about AgroNet. Can't find an answer?{' '}
          <a href="mailto:support@agronet.in" className="faq-contact-link">Contact support →</a>
        </p>
      </div>

      {/* Sections */}
      <div className="faq-content">
        {faqs.map((section) => (
          <div key={section.section} className="faq-section">
            <h2 className="faq-section-title">{section.section}</h2>
            <div className="faq-section-items">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions CTA */}
      <div className="faq-cta">
        <h3 className="faq-cta-title">Still have questions?</h3>
        <p className="faq-cta-text">Our support team is available Monday–Saturday, 9am–6pm IST.</p>
        <a href="mailto:support@agronet.in" className="faq-cta-btn">📧 Email Support</a>
      </div>
    </div>
  )
}