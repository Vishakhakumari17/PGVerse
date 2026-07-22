import React, { useState } from 'react';
import api from '../../services/api';
import './Contact.css';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/contact-messages', { name, email, message: msg });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMsg('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send message');
    }
  };

  const faqs = [
    { q: 'How do I book a room on PGVerse?', a: 'First register as a student, search for your preferred hostel, click on View Details, choose a package and start date, then proceed with the advance payment checkout.' },
    { q: 'Is the security deposit refundable?', a: 'Yes, the security deposit is fully refundable at the end of your contract duration, subject to property policies.' },
    { q: 'How can I list my PG hostel?', a: 'Register as an Owner, navigate to the Owner Panel, click Add PG, and input your room pricing lists.' },
    { q: 'Who verifies the listings?', a: 'Our platform administrator manually reviews and approves all PG properties listed by owners to ensure authenticity.' }
  ];

  return (
    <div className="container py-5 page-container text-start">
      <div className="row g-5">
        {/* Support Inquiry Form */}
        <div className="col-lg-6">
          <div className="premium-card p-5 h-100">
            <h2 className="font-display mb-3">Get in Touch</h2>
            <p className="text-muted small mb-4">Have questions or facing issues with bookings? Send us a message and our support team will help.</p>

            {submitted && (
              <div className="alert alert-success py-2.5 small mb-4">
                Thank you! Your support message has been sent. We will get back to you shortly.
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2.5 small mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted font-display">Full Name</label>
                <input
                  type="text"
                  className="form-control custom-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted font-display">Email Address</label>
                <input
                  type="email"
                  className="form-control custom-input"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label small text-muted font-display">Message</label>
                <textarea
                  className="form-control custom-input"
                  rows="4"
                  placeholder="Type your query here..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-premium-primary w-100 py-3 font-display">
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQs */}
        <div className="col-lg-6">
          <h2 className="font-display mb-4">Frequently Asked Questions</h2>
          <div className="accordion d-flex flex-column gap-3" id="faqAccordion">
            {faqs.map((faq, idx) => (
              <div key={idx} className="accordion-item border premium-card overflow-hidden">
                <h2 className="accordion-header" id={`heading-${idx}`}>
                  <button
                    className="accordion-button collapsed font-display small py-3.5 px-4"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${idx}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${idx}`}
                    style={{ background: 'transparent', border: 'none', outline: 'none', boxShadow: 'none' }}
                  >
                    {faq.q}
                  </button>
                </h2>
                <div
                  id={`collapse-${idx}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${idx}`}
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body text-muted small bg-light py-3 px-4 border-top">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
