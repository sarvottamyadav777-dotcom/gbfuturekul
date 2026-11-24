import { Course } from '../data/coursesData';
import { LectureItem, PdfItem } from '../data/courseDetailsData';

export interface HistoryItem {
  _id: string;
  type: 'lecture' | 'note';
  contentId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  teacher?: string;
  subject?: string;
  link: string;
  thumb?: string;
  watchedAt: string;
}

const ENROLLED_KEY = 'enrolledBatches';
const SELECTED_BATCH_KEY = 'selectedBatch';
const HISTORY_KEY = 'studyHistory';
const THEME_KEY = 'USER_THEME';

export type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';

export function getSavedTheme(): ThemeMode {
  try {
    const val = localStorage.getItem(THEME_KEY);
    if (val === 'LIGHT' || val === 'DARK' || val === 'SYSTEM') return val;
  } catch {
    // ignore
  }
  return 'SYSTEM';
}

export function saveTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // ignore
  }
}

export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  if (mode === 'DARK') {
    root.classList.add('dark');
  } else if (mode === 'LIGHT') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}

export function getEnrolledBatches(): Course[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ENROLLED_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function isBatchEnrolled(courseId: string): boolean {
  try {
    if (localStorage.getItem(`enrolled_${courseId}`) === 'true') return true;
    return getEnrolledBatches().some((b) => String(b.id) === String(courseId));
  } catch {
    return false;
  }
}

export function enrollBatch(course: Course): void {
  try {
    localStorage.setItem(`enrolled_${course.id}`, 'true');
    const existing = getEnrolledBatches();
    if (!existing.some((b) => String(b.id) === String(course.id))) {
      const updated = [course, ...existing];
      localStorage.setItem(ENROLLED_KEY, JSON.stringify(updated));
    }
    window.dispatchEvent(new Event('batchesUpdated'));
  } catch {
    // ignore
  }
}

export function unenrollBatch(courseId: string): void {
  try {
    localStorage.removeItem(`enrolled_${courseId}`);
    const filtered = getEnrolledBatches().filter((b) => String(b.id) !== String(courseId));
    localStorage.setItem(ENROLLED_KEY, JSON.stringify(filtered));
    const selected = getSelectedStudyBatch();
    if (selected && String(selected.id) === String(courseId)) {
      localStorage.removeItem(SELECTED_BATCH_KEY);
    }
    window.dispatchEvent(new Event('batchesUpdated'));
  } catch {
    // ignore
  }
}

export function getSelectedStudyBatch(): Course | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SELECTED_BATCH_KEY) || 'null');
    return raw && raw.id ? raw : null;
  } catch {
    return null;
  }
}

export function setSelectedStudyBatch(course: Course): void {
  try {
    localStorage.setItem(SELECTED_BATCH_KEY, JSON.stringify(course));
  } catch {
    // ignore
  }
}

export function getStudyHistory(): HistoryItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function addLectureToHistory(course: Course, lecture: LectureItem): void {
  try {
    const entry: HistoryItem = {
      _id: `lecture:${lecture.id}`,
      type: 'lecture',
      contentId: lecture.id,
      courseId: course.id,
      courseTitle: course.title,
      title: lecture.title,
      teacher: lecture.teacher,
      subject: lecture.subject,
      link: lecture.link,
      thumb: lecture.thumb || course.banner,
      watchedAt: new Date().toISOString(),
    };
    const existing = getStudyHistory().filter(
      (item) => !(item.type === 'lecture' && item.contentId === lecture.id)
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...existing].slice(0, 200)));
    window.dispatchEvent(new Event('studyHistoryUpdated'));
  } catch {
    // ignore
  }
}

export function addNoteToHistory(course: Course, note: PdfItem): void {
  try {
    const entry: HistoryItem = {
      _id: `note:${note.id}`,
      type: 'note',
      contentId: note.id,
      courseId: course.id,
      courseTitle: course.title,
      title: note.title,
      teacher: note.teacher,
      subject: note.subject,
      link: note.link,
      watchedAt: new Date().toISOString(),
    };
    const existing = getStudyHistory().filter(
      (item) => !(item.type === 'note' && item.contentId === note.id)
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...existing].slice(0, 200)));
    window.dispatchEvent(new Event('studyHistoryUpdated'));
  } catch {
    // ignore
  }
}

export function clearStudyHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('studyHistoryUpdated'));
  } catch {
    // ignore
  }
}
