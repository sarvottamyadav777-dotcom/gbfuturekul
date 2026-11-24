import React from 'react';
import {
  Send,
  ShieldCheck,
  Zap,
  Smartphone,
  ExternalLink,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { BRAND_LOGO, BRAND_NAME, TELEGRAM_URL } from '../services/api';

export const ContactView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Contact Us</h1>
        <p className="text-sm text-muted-foreground">
          Connect with the {BRAND_NAME} community for batch updates and study notes
        </p>
      </div>

      {/* Card 1: About GB STUDY */}
      <div className="rounded-xl border bg-background p-6 divshadow">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border bg-muted">
            <img
              src={BRAND_LOGO}
              alt={`${BRAND_NAME} logo`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{BRAND_NAME}</h2>
              <GraduationCap className="h-5 w-5 text-[#5a4bda] dark:text-[#29ff94]" />
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {BRAND_NAME} is a student-first online study platform offering 100% free access to batches, full HD video lectures, and chapter-wise handwritten PDF notes — with zero login or signup barriers.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-foreground/[0.03] px-3 py-1 text-xs font-medium text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-[#5a4bda] dark:text-[#29ff94]" />
                Secure
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-foreground/[0.03] px-3 py-1 text-xs font-medium text-foreground">
                <Zap className="h-3.5 w-3.5 text-[#5a4bda] dark:text-[#29ff94]" />
                Reliable
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-foreground/[0.03] px-3 py-1 text-xs font-medium text-foreground">
                <Smartphone className="h-3.5 w-3.5 text-[#5a4bda] dark:text-[#29ff94]" />
                Responsive
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Official Telegram Channel */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-between gap-5 rounded-xl border bg-background p-6 divshadow">
          <div className="space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
              <Send className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Join GB STUDY Telegram Channel
            </h3>
            <p className="text-sm text-muted-foreground">
              Stay connected for newly added batches, daily class schedules, handwritten PDF updates, and direct support.
            </p>
          </div>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-fit items-center justify-center gap-2 rounded-md bg-green-400 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Join Telegram</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>
        </div>

        {/* Card 3: Quick Platform Info */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border bg-background p-6 divshadow">
          <div className="space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Free Access Guarantee
            </h3>
            <p className="text-sm text-muted-foreground">
              Every batch, lecture video stream, and class PDF on {BRAND_NAME} is completely free for students across Android phones, tablets, laptops, and desktop browsers.
            </p>
          </div>
          <div className="rounded-lg border bg-foreground/[0.03] px-4 py-3 text-xs font-medium text-muted-foreground">
            Channel: <span className="font-semibold text-foreground">{TELEGRAM_URL}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
