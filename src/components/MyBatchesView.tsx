import React, { useMemo, useState } from 'react';
import { Layers3, Search, Sparkles } from 'lucide-react';
import { Course } from '../data/coursesData';
import { CourseCard } from './CourseCard';

interface MyBatchesViewProps {
  courses: Course[];
  enrolledIds: Set<string>;
  onSelectCourse: (course: Course) => void;
  onEnroll: (course: Course) => void;
  onUnenroll: (course: Course) => void;
  onBrowseBatches: () => void;
}

export const MyBatchesView: React.FC<MyBatchesViewProps> = ({
  courses,
  enrolledIds,
  onSelectCourse,
  onEnroll,
  onUnenroll,
  onBrowseBatches,
}) => {
  const [search, setSearch] = useState('');

  const myBatches = useMemo(() => {
    const enrolled = courses.filter((c) => enrolledIds.has(c.id));
    const q = search.trim().toLowerCase();
    if (!q) return enrolled;
    return enrolled.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.exams_covered && c.exams_covered.toLowerCase().includes(q))
    );
  }, [courses, enrolledIds, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Batches</h1>
          <p className="text-sm text-muted-foreground">
            Quick access to all batches you have enrolled in
          </p>
        </div>
        <span className="rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground">
          {enrolledIds.size} {enrolledIds.size === 1 ? 'Batch' : 'Batches'} Enrolled
        </span>
      </div>

      {enrolledIds.size > 0 && (
        <div className="divshadow relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Your Enrolled Batch"
            className="w-full rounded-md border bg-foreground/10 p-3.5 ps-10 text-sm outline-none focus:ring-2 focus:ring-[#5a4bda]/40 dark:focus:ring-[#29ff94]/40"
          />
        </div>
      )}

      {enrolledIds.size === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-background p-10 text-center divshadow">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7567ee]/10 text-[#5a4bda] dark:bg-[#3dc280]/10 dark:text-[#29ff94]">
            <Layers3 className="h-7 w-7" />
          </div>
          <h2 className="mb-1.5 text-lg font-bold text-foreground">
            No enrolled batches yet
          </h2>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Click &quot;Enroll Now&quot; on any batch from the Batches page to save it here for quick daily access.
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
      ) : myBatches.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center divshadow">
          <p className="text-sm font-medium text-muted-foreground">
            No enrolled batch matches &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myBatches.map((course, idx) => (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={true}
              onSelect={onSelectCourse}
              onEnroll={onEnroll}
              onUnenroll={onUnenroll}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};
