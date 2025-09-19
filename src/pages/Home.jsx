import { useState } from 'react';
import { Link } from 'react-router-dom';
import { saveNewsletter, saveContact } from '../utils/storage';
// Removed blog/editor content for simplified home
import SimpleQuoteCards from '../components/SimpleQuoteCards';

const Home = () => {
  // minimal home

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState(null);

  const onNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('Saving...');
    const res = await saveNewsletter(newsletterEmail);
    setNewsletterStatus(res?.ok ? 'Subscribed!' : 'Failed. Try again');
    if (res?.ok) setNewsletterEmail('');
  };

  const onContactSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = contactForm;
    if (!name || !email || !message) return;
    setContactStatus('Saving...');
    const res = await saveContact(contactForm);
    setContactStatus(res?.ok ? 'Sent!' : 'Failed. Try again');
    if (res?.ok) setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-800 dark:to-indigo-900 min-h-[100dvh] md:min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">SIP Calculator Pro</h1>
            <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-6 md:mb-8">Modern SIP, Lumpsum, and SWP tools with live market context.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link to="/sip" className="px-5 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">Try SIP Calculator</Link>
              <Link to="/lumpsum" className="px-5 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors">Try Lumpsum Calculator</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content removed as requested */}

      {/* Bottom: Newsletter + Contact side-by-side above Disclaimer */}
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Newsletter */}
            <div className="rounded-lg border border-white/10 bg-gray-900/40 text-white p-5">
              <h3 className="text-xl font-semibold text-white mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-300 mb-4">Subscribe to our newsletter for daily market insights and investment tips.</p>
              <form className="flex flex-col sm:flex-row gap-2" onSubmit={onNewsletterSubmit}>
                <input
                  value={newsletterEmail}
                  onChange={(e)=>setNewsletterEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full flex-1 px-4 py-2 rounded-lg border-2 border-gray-500/60 bg-gray-900 text-white placeholder-gray-400 caret-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                />
                <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Subscribe</button>
              </form>
              {newsletterStatus && <p className="mt-2 text-xs text-gray-300">{newsletterStatus}</p>}
            </div>
            {/* Contact */}
            <div className="rounded-lg border border-white/10 bg-gray-900/40 text-white p-5">
              <h3 className="text-xl font-semibold text-white mb-2">Contact Us</h3>
              <p className="text-sm text-gray-300">Questions, feedback, or partnership inquiries? We’d love to hear from you.</p>
              <ul className="mt-3 text-sm text-gray-300 space-y-1">
                <li>Email: <a className="text-indigo-400 hover:underline" href="mailto:surjadas098@gmail.com">surjadas098@gmail.com</a></li>
              </ul>
              <form className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={onContactSubmit}>
                <input
                  value={contactForm.name}
                  onChange={(e)=>setContactForm((p)=>({...p, name:e.target.value}))}
                  className="w-full px-3 py-2 rounded border-2 border-gray-500/60 bg-gray-900 text-sm text-white placeholder-gray-400 caret-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  placeholder="Your name"
                  required
                />
                <input
                  value={contactForm.email}
                  onChange={(e)=>setContactForm((p)=>({...p, email:e.target.value}))}
                  className="w-full px-3 py-2 rounded border-2 border-gray-500/60 bg-gray-900 text-sm text-white placeholder-gray-400 caret-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  placeholder="Your email"
                  type="email"
                  required
                />
                <textarea
                  value={contactForm.message}
                  onChange={(e)=>setContactForm((p)=>({...p, message:e.target.value}))}
                  className="sm:col-span-2 w-full px-3 py-2 rounded border-2 border-gray-500/60 bg-gray-900 text-sm text-white placeholder-gray-400 caret-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  rows="4"
                  placeholder="Message"
                  required
                />
                <div className="sm:col-span-2">
                  <button className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white">Send</button>
                </div>
              </form>
              {contactStatus && <p className="mt-2 text-xs text-gray-300">{contactStatus}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Market Snapshot moved to bottom */}
      <div className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Market Snapshot</h2>
          <SimpleQuoteCards />
        </div>
      </div>

      {/* Contact/Newsletter now above Disclaimer; footer removed */}
    </div>
  );
};

export default Home;