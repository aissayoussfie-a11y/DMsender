import React, { useState, useEffect } from 'react';
import { Settings, MessageCircle, Instagram, Code, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch initial config state
    axios.get('/api/config').then(res => {
      setMessage(res.data.messageTemplate);
      setIsActive(res.data.isActive);
      setIsConnected(res.data.instagramConnected);
      setAccessToken(res.data.accessToken || '');
      
      // Calculate derived webhook URL for Meta
      const currentUrl = window.location.origin;
      setWebhookUrl(`${currentUrl}/api/webhook`);
    }).catch(err => console.error("Error fetching config:", err));
  }, []);

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/config', {
        messageTemplate: message,
        isActive,
        accessToken
      });
      setIsConnected(Boolean(accessToken));
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

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
              <span className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                ⚠️ Connection Required
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-500" />
                Connection Settings
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Paste your Page Access Token here. You can generate this in the Meta Developer Dashboard under <strong>Step 2. Generate access tokens</strong>.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Page Access Token
                </label>
                <input 
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                  placeholder="EAAB..."
                />
              </div>

              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 pt-4 border-t border-gray-100">
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

              <div className="mt-8 flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
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

                <button 
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
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
                  <div className="bg-gray-50 p-3 mt-2 rounded-lg border border-gray-200 break-all text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="block text-gray-800">Your Redirect URL for Login:</strong>
                      <button 
                        onClick={() => navigator.clipboard.writeText(webhookUrl.replace('/api/webhook', '') + '/')}
                        className="p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1"
                        title="Copy Redirect URL"
                      >
                        <span>Copy</span>
                      </button>
                    </div>
                    <span className="text-purple-600 block">{webhookUrl ? webhookUrl.replace('/api/webhook', '') + '/' : 'Loading...'}</span>
                  </div>
                  <div className="bg-amber-50 text-amber-800 p-3 mt-2 rounded-lg border border-amber-200 text-xs">
                    <strong>Note about Login Popups & "Insufficient Developer Role" error:</strong> 
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>If the popup is blank/black, try disabling adblockers or use an Incognito window.</li>
                      <li>If you get <strong>"Insufficient Developer Role"</strong> or a similar error, your Instagram account needs to be added as a tester.</li>
                      <li>Go to <strong>App Roles {'>'} Roles</strong> in the sidebar, click <strong>Add People</strong> and select <strong>Instagram Tester</strong>. Enter your IG username.</li>
                      <li><strong>CRITICAL:</strong> You must then accept the invite! Go directly to <a href="https://www.instagram.com/accounts/manage_access/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-blue-600">https://www.instagram.com/accounts/manage_access/</a> (make sure you are logged into the correct Instagram account on your browser) and look for the "Tester invites" tab there to accept it.</li>
                      <li>Alternatively, on the Instagram mobile app: Go to Settings and activity {'>'} Website permissions {'>'} Apps and websites {'>'} Tester Invites.</li>
                      <li><strong>Note on Permissions:</strong> When prompted, the "View profile and access media" permission actually includes the ability to read your reel comments. Just click <strong>Allow</strong> on all requested permissions!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
