import React from 'react';
import {
  UserCheck,
  CalendarCheck2,
  GraduationCap,
  BookmarkPlus,
  PinOff,
} from 'lucide-react';
import { Course } from '../data/coursesData';
import { BRAND_LOGO } from '../services/api';

interface CourseCardProps {
  course: Course;
  enrolled: boolean;
  onSelect: (course: Course) => void;
  onEnroll: (course: Course) => void;
  onUnenroll: (course: Course) => void;
  index?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  enrolled,
  onSelect,
  onEnroll,
  onUnenroll,
  index = 0,
}) => {
  return (
    <article
      className="flex flex-wrap overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      {/* Top Row: Title + New Badge */}
      <div className="relative flex w-full items-center justify-between gap-4 p-4 pb-0">
        <h3 className="line-clamp-2 text-lg font-bold text-foreground">
          {course.title}
        </h3>
        <span className="!m-0 shrink-0 rounded bg-yellow-400 px-2 py-1 text-xs font-medium text-black">
          {index < 6 ? 'New' : 'Batch'}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-wrap justify-between p-4">
        {/* Thumbnail */}
        <div
          onClick={() => onSelect(course)}
          className="relative w-full overflow-hidden rounded-lg bg-muted/30 cursor-pointer"
        >
          <img
            src={course.banner || BRAND_LOGO}
            alt={course.title}
            className="aspect-video w-full object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = BRAND_LOGO;
            }}
          />
          <div className="absolute bottom-2 left-2 z-10">
            <span className="rounded-md bg-pink-500/70 px-2 py-1 text-xs font-medium text-white ring-1 ring-pink-700/10 ring-inset dark:bg-green-500/80">
              {course.category || 'GB STUDY'}
            </span>
          </div>
        </div>

        {/* Details & Buttons */}
        <div className="w-full space-y-3 pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold text-foreground line-clamp-1">
              {course.exams_covered || 'Free learning batch'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarCheck2 className="h-4 w-4 shrink-0" />
            <span>Valid till</span>{' '}
            <span className="font-semibold text-foreground">
              {course.duration || '1 Year Validity'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-bold text-green-600 sm:text-lg dark:text-green-400">
              ₹ FREE
            </span>
            <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-600 dark:bg-green-500 dark:text-white">
              100% Free For Students
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelect(course)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 min-w-[120px] flex-1 cursor-pointer"
            >
              <GraduationCap className="mr-1 h-4 w-4" />
              <span>Study</span>
            </button>

            {enrolled ? (
              <button
                type="button"
                onClick={() => onUnenroll(course)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 min-w-[120px] flex-1 bg-red-600 text-xs text-white hover:bg-red-700 sm:text-sm cursor-pointer"
              >
                <PinOff className="mr-1 h-4 w-4" />
                <span>Unenroll</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onEnroll(course)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 min-w-[120px] flex-1 bg-green-400 text-xs text-white hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 dark:hover:text-white sm:text-sm cursor-pointer"
              >
                <span>Enroll Now</span>
                <BookmarkPlus className="ml-1 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
