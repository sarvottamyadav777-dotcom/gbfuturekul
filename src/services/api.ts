import { Course, INITIAL_COURSES } from '../data/coursesData';
import { CACHED_COURSE_DETAILS, CourseDetail, LectureItem, PdfItem } from '../data/courseDetailsData';

export const BRAND_LOGO = 'https://i.ibb.co/0R7qc34v/1093.jpg';
export const TELEGRAM_URL = 'https://t.me/GBFreestudy';
export const BRAND_NAME = 'GB STUDY';

export function cleanHTML(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .replace(/\s+/g, ' ');
}

export function absoluteUrl(url: string | undefined | null): string {
  if (!url) return '';
  let s = String(url).trim();
  if (!s) return '';
  if (s.startsWith('http://')) s = 'https://' + s.slice(7);
  if (s.startsWith('//')) return 'https:' + s;
  if (s.startsWith('https://')) return s;
  if (s.startsWith('/')) return 'https://www.futurekul.com' + s;
  return 'https://www.futurekul.com/admin/' + s.replace(/^admin\//, '');
}

export function getYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&color=white`;
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&color=white`;
    }
  } catch {
    // not youtube URL
  }
  return null;
}

export async function fetchAllCourses(): Promise<Course[]> {
  try {
    const endpoints = [
      'https://www.futurekul.com/admin/api/course/135/1/',
      'https://www.futurekul.com/admin/api/course/135/0/',
    ];

    const proxyEndpoints = [
      '/api/futurekul/admin/api/course/135/1/',
      '/api/futurekul/admin/api/course/135/0/',
    ];

    let responses: Response[] | null = null;

    // Use a quick timeout to avoid hanging if deployed on Vercel
    const fetchWithTimeout = async (url: string, timeoutMs = 2500) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(id);
        return res;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    try {
      responses = await Promise.all(endpoints.map((url) => fetchWithTimeout(url)));
    } catch {
      try {
        responses = await Promise.all(proxyEndpoints.map((url) => fetchWithTimeout(url)));
      } catch {
        responses = null;
      }
    }

    if (responses && responses[0].ok && responses[1].ok) {
      const [j1, j2] = await Promise.all([responses[0].json(), responses[1].json()]);
      const list1 = Array.isArray(j1?.data) ? j1.data : [];
      const list2 = Array.isArray(j2?.data) ? j2.data : [];

      const map = new Map<string, Course>();

      [...list1, ...list2].forEach((c: any) => {
        const id = String(c.id || c.course_id || '');
        if (!id) return;
        if (!map.has(id)) {
          map.set(id, {
            id,
            title: cleanHTML(c.title || c.course_name || c.name || 'GB STUDY Course'),
            banner: absoluteUrl(c.banner || c.image || c.image2 || c.banner_2 || '') || BRAND_LOGO,
            category: c.main_cat_name || c.category || 'Railways & General',
            header_name: c.header_name || '',
            short_description: cleanHTML(c.short_description || c.description || 'Comprehensive exam preparation batch by GB STUDY'),
            start_date: c.start_date || '',
            end_date: c.end_date || '',
            price: c.price || 'Free',
            discount_price: c.discount_price || '',
            exams_covered: cleanHTML(c.exams_covered || c.header_name || 'All Competitive Exams'),
            language: cleanHTML(c.language || 'Hindi + Hinglish'),
            duration: cleanHTML(c.course_duration || '1 Year Validity'),
            validity: cleanHTML(c.validity || '365 Days'),
          });
        }
      });

      if (map.size > 0) {
        return Array.from(map.values());
      }
    }
  } catch (err) {
    console.warn('Using offline bundled course catalog:', err);
  }

  return INITIAL_COURSES;
}

export async function fetchCourseDetails(courseId: string): Promise<CourseDetail> {
  try {
    const directUrl = `https://www.futurekul.com/admin/api/getCourseDataByTopic-v2/${courseId}/`;
    const proxyUrl = `/api/futurekul/admin/api/getCourseDataByTopic-v2/${courseId}/`;

    const fetchWithTimeout = async (url: string, timeoutMs = 2500) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return res;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    let res: Response | null = null;
    try {
      res = await fetchWithTimeout(directUrl);
    } catch {
      try {
        res = await fetchWithTimeout(proxyUrl);
      } catch {
        res = null;
      }
    }

    if (res && res.ok) {
      const json = await res.json();
      const d = json?.data || {};

      const freeClasses: LectureItem[] = [];
      if (Array.isArray(d.free_class)) {
        d.free_class.forEach((item: any) => {
          freeClasses.push({
            id: String(item.id || item.class_id || Math.random()),
            title: cleanHTML(item.class_name || item.title || item.name || 'Demo Class'),
            teacher: cleanHTML(item.teacher_name || item.teacher || 'GB STUDY Faculty'),
            subject: cleanHTML(item.custom_tag_1 || 'Preview Class'),
            link: absoluteUrl(item.link || item.video_link || item.url || ''),
            thumb: absoluteUrl(item.banner || item.thumbnail || item.image || '') || BRAND_LOGO,
            is_live: String(item.is_live || '0') === '1',
            start_date: item.start_date || '',
            priority: Number(item.priority || 999),
          });
        });
      }

      const paidClasses: LectureItem[] = [];
      if (Array.isArray(d.paid_class)) {
        d.paid_class.forEach((topic: any) => {
          const topicName = cleanHTML(topic.topic || topic.topic_name || 'Curriculum');
          const arr = Array.isArray(topic.class) ? topic.class : Array.isArray(topic.classes) ? topic.classes : [];
          arr.forEach((item: any) => {
            paidClasses.push({
              id: String(item.id || item.class_id || Math.random()),
              title: cleanHTML(item.class_name || item.title || item.name || 'Lecture'),
              teacher: cleanHTML(item.teacher_name || item.teacher || 'GB STUDY Faculty'),
              subject: cleanHTML(item.custom_tag_1 || topicName),
              link: absoluteUrl(item.link || item.video_link || item.url || ''),
              thumb: absoluteUrl(item.banner || item.thumbnail || item.image || '') || BRAND_LOGO,
              is_live: String(item.is_live || '0') === '1',
              start_date: item.start_date || '',
              priority: Number(item.priority || 999),
            });
          });
        });
      }

      const pdfs: PdfItem[] = [];
      if (Array.isArray(d.pdf)) {
        d.pdf.forEach((topic: any) => {
          const topicName = cleanHTML(topic.topic || topic.topic_name || 'Study Notes');
          const arr = Array.isArray(topic.pdf) ? topic.pdf : [];
          arr.forEach((p: any) => {
            const pUrl = absoluteUrl(p.pdf_mobile || p.pdf_url || p.link || '');
            pdfs.push({
              id: String(p.id || p.pdf_id || Math.random()),
              title: cleanHTML(p.pdf_name || p.title || p.name || 'Study Notes PDF'),
              teacher: cleanHTML(p.teacher_name || p.teacher || 'GB STUDY Team'),
              subject: cleanHTML(p.custom_tag_1 || topicName),
              link: pUrl,
            });
          });
        });
      }

      // If we got valid items, return them
      if (freeClasses.length > 0 || paidClasses.length > 0 || pdfs.length > 0) {
        return {
          freeClasses,
          paidClasses,
          pdfs,
        };
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch online details for course ${courseId}:`, err);
  }

  // Fallback to pre-bundled cache if available
  if (CACHED_COURSE_DETAILS[courseId]) {
    return CACHED_COURSE_DETAILS[courseId];
  }

  return {
    freeClasses: [],
    paidClasses: [],
    pdfs: [],
  };
}
