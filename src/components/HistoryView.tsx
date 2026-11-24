import React, { useEffect, useState } from 'react';
import {
  History,
  Play,
  FileText,
  ExternalLink,
  Trash2,
  GraduationCap,
  Sparkles,
  Clock3,
} from 'lucide-react';
import {
  HistoryItem,
  getStudyHistory,
  clearStudyHistory,
} from '../services/storage';
import { BRAND_LOGO } from '../services/api';
import { toast } from './ToastContainer';

interface HistoryViewProps {
  onResumeLecture: (item: HistoryItem) => void;
  onOpenCourseById: (courseId: string) => void;
  onBrowseBatches: () => void;
}

function formatWatchedTime(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onResumeLecture,
  onOpenCourseById,
  onBrowseBatches,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => getStudyHistory());

  useEffect(() => {
    const refresh = () => setHistory(getStudyHistory());
    window.addEventListener('studyHistoryUpdated', refresh);
    return () => window.removeEventListener('studyHistoryUpdated', refresh);
  }, []);

  const handleClear = () => {
    clearStudyHistory();
    setHistory([]);
    toast.info('Study history cleared');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-sm text-muted-foreground">
            Recently watched lectures and opened PDF notes
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3.5 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-background p-10 text-center divshadow">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
            <History className="h-7 w-7" />
          </div>
          <h2 className="mb-1.5 text-lg font-bold text-foreground">
            No study history yet
          </h2>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Lectures you watch and PDF notes you open will appear here automatically so you can resume anytime.
          </p>
          <button
            type="button"
            onClick={onBrowseBatches}
            className="inline-flex items-center gap-2 rounded-md bg-green-400 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 transition-colors cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Explore Batches</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="flex flex-col justify-between gap-4 rounded-xl border bg-background p-4 divshadow transition-shadow hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {item.type === 'lecture' ? (
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border bg-black">
                    <img
                      src={item.thumb || BRAND_LOGO}
                      alt={item.title}
                      className="h-full w-full object-cover opacity-85"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = BRAND_LOGO;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-black/65 text-white">
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                    <FileText className="h-6 w-6" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#7567ee]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
                      {item.type === 'lecture' ? 'Lecture' : 'PDF Note'}
                    </span>
                    {item.subject && (
                      <span className="text-xs font-medium text-muted-foreground truncate">
                        {item.subject}
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground sm:text-base">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="truncate font-medium text-foreground/80">
                      {item.courseTitle}
                    </span>
                    {item.watchedAt && (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatWatchedTime(item.watchedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {item.type === 'lecture' ? (
                  <button
                    type="button"
                    onClick={() => onResumeLecture(item)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-400 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 transition-colors cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(item.link)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-400 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Note</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onOpenCourseById(item.courseId)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3.5 py-2 text-xs sm:text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Open Course</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
