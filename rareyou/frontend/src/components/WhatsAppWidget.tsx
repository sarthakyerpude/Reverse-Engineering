import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim() || 'Hi Rare You team! I need assistance with handcrafted products.';
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/919999999999?text=${encoded}`, '_blank');
    setMessage('');
    setChatOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center font-sans">
      {/* Speech Bubble Tooltip matching Screenshot 6 */}
      {!tooltipDismissed && !chatOpen && (
        <div className="relative mr-3 bg-white text-[#121212] px-3.5 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2 text-xs font-normal animate-fade-in select-none">
          <span>Hey, how can we help you?</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTooltipDismissed(true);
            }}
            className="text-gray-400 hover:text-gray-700 ml-1 p-0.5"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Triangle pointer */}
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white" />
        </div>
      )}

      {/* Floating Action Button with WhatsApp SVG */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer focus:outline-none"
        title="Chat on WhatsApp"
        aria-label="WhatsApp Chat"
      >
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.086-2.025-.467-1.425-.593-2.336-2.036-2.408-2.132-.072-.095-.573-.762-.573-1.454 0-.692.361-1.033.489-1.174.128-.142.28-.178.373-.178.094 0 .188.001.27.005.087.004.204-.033.319.243.119.288.406.99.442 1.063.036.073.06.159.012.255-.048.096-.072.156-.144.24-.072.084-.152.188-.217.253-.072.072-.148.15-.064.294.084.144.373.616.802.998.552.492 1.017.644 1.161.716.144.072.228.06.312-.036.084-.096.36-419.456-.563.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.353-.108.758zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.982-1.307C8.423 21.534 10.15 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.63 0-3.14-.492-4.406-1.332l-.316-.21-2.964.778.791-2.89-.229-.364C3.96 14.67 3.5 13.385 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z" />
        </svg>
      </button>

      {/* WhatsApp Quick Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col font-sans animate-fade-in">
          {/* Chat Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                RY
              </div>
              <div>
                <h4 className="font-semibold text-sm">Rare You Support</h4>
                <p className="text-[11px] text-emerald-200">Usually replies in minutes</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#E5DDD5] min-h-[160px] flex flex-col justify-end">
            <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-xs text-xs max-w-[85%] self-start text-[#121212]">
              <p className="font-semibold text-[10px] text-gray-500 mb-1">Rare You Artisan Team</p>
              Hi there! How can we assist you with our forever flowers, custom dresses, or swings today?
              <span className="block text-[9px] text-gray-400 text-right mt-1">Just now</span>
            </div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded-full px-3.5 py-2 focus:outline-none focus:border-[#075E54]"
              autoFocus
            />
            <button
              type="submit"
              className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#20ba5a] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default WhatsAppWidget;

