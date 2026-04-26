import React, { useState, useEffect } from 'react';
import { Settings, MessageCircle, Instagram, Code, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    // Fetch initial config state
    axios.get('/api/config').then(res => {
      setMessage(res.data.messageTemplate);
      setIsActive(res.data.isActive);
      setIsConnected(res.data.instagramConnected);
      
      // Calculate derived webhook URL for Meta
      const currentUrl = window.location.origin;
      setWebhookUrl(`${currentUrl}/api/webhook`);
    }).catch(err => console.error("Error fetching config:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg text-white">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">ReelAutoDM</h1>
          </div>
          <div>
            {isConnected ? (
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4" /> Connected to Instagram
              </span>
            ) : (
              <button className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm">
                <Instagram className="w-4 h-4" /> Connect Account
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-gray-500" />
                Auto-Reply Message
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                This is the exact message that will be sent via DM to users who comment on your reels.
              </p>
              
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none transition-all"
                placeholder="Hey! Thanks for commenting. Here is the link: https://..."
              />

              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={isActive}
                      onChange={() => setIsActive(!isActive)}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${isActive ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isActive ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="font-medium text-sm">
                    {isActive ? 'Bot is Active' : 'Bot is Paused'}
                  </span>
                </label>

                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors">
                  Save Changes
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-gray-500" />
                Setup Instructions
              </h2>
              
                <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <span className="inline-block w-6 h-6 bg-purple-100 text-purple-700 text-center font-semibold rounded-full leading-6 mr-2">1</span>
                  Create an app in Meta Developer Portal and select <strong>"Manage messaging & content on Instagram"</strong>.
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 break-all text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="block text-gray-800">Your Webhook URL:</strong>
                    <button 
                      onClick={() => navigator.clipboard.writeText(webhookUrl)}
                      className="p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1"
                      title="Copy URL"
                    >
                      <span>Copy</span>
                    </button>
                  </div>
                  
                  <span className="text-purple-600 block mb-2">{webhookUrl || 'Loading...'}</span>

                  {webhookUrl.includes('ais-dev') && (
                    <div className="bg-amber-50 text-amber-800 border border-amber-200 p-2 rounded text-[11px] leading-relaxed">
                      <strong>⚠️ Important Note:</strong> You are currently using a secure preview URL (ais-dev-...run.app) which blocks external services like Meta from reaching it. 
                      <br/><strong>To verify in Meta:</strong> You must click the <strong>Share</strong> button (top right) or <strong>Deploy to Cloud Run</strong> to generate a public URL. After deploying, open the new public app URL and copy your Webhook URL from there instead.
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs flex justify-between items-center">
                  <div>
                    <strong className="block text-gray-800 mb-1">Verify Token:</strong>
                    <code className="text-purple-600 font-mono">my_secure_verify_token</code>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText('my_secure_verify_token')}
                    className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                    title="Copy Token"
                  >
                    Copy
                  </button>
                </div>

                <div>
                  <span className="inline-block w-6 h-6 bg-purple-100 text-purple-700 text-center font-semibold rounded-full leading-6 mr-2">2</span>
                  ✅ Awesome! Your webhook is configured. Now, subscribe your webhook to these fields: <code>comments</code>, <code>messages</code>.
                </div>
                
                <div>
                  <span className="inline-block w-6 h-6 bg-purple-100 text-purple-700 text-center font-semibold rounded-full leading-6 mr-2">3</span>
                  Complete "Step 4. Set up Instagram business login" in the Meta dashboard.
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
