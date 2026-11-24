import React, { useEffect, useState } from 'react';
import { Send, X, ExternalLink } from 'lucide-react';
import { BRAND_LOGO, TELEGRAM_URL } from '../services/api';

interface TelegramModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceShow?: boolean;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  forceShow = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
      return;
    }

    const seen = sessionStorage.getItem('gb_telegram_popup_seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [controlledIsOpen, forceShow]);

  const handleClose = () => {
    sessionStorage.setItem('gb_telegram_popup_seen', 'true');
    setIsOpen(false);
    if (controlledOnClose) controlledOnClose();
  };

  const markSeenAndClose = () => {
    sessionStorage.setItem('gb_telegram_popup_seen', 'true');
    setIsOpen(false);
    if (controlledOnClose) controlledOnClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-2xl divshadow"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tg-modal-title"
      >
        <button
          type="button"
          onClick={markSeenAndClose}
          className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border bg-muted mb-4">
            <img
              src={BRAND_LOGO}
              alt="GB STUDY"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 id="tg-modal-title" className="text-xl font-bold text-foreground mb-2">
            Join GB STUDY Telegram Channel
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Get daily free lecture alerts, handwritten class PDF notes, and instant updates directly on Telegram.
          </p>

          <div className="w-full flex flex-col sm:flex-row gap-2.5">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={markSeenAndClose}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-green-400 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium text-sm h-10 px-4 py-2 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Join Telegram</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <button
              type="button"
              onClick={markSeenAndClose}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium text-sm h-10 px-4 py-2 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
