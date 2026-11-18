export interface SeriesInfo {
  editionNumber: number | null;
  years: number[];
  seriesEvents: Array<{
    id: string;
    title: string;
    date: string | null;
    series?: string;
  }>;
}

export interface ParsedEventDate {
  iso: string;
  timestamp: number;
  day: string;
  month: string;
  year: string;
  weekday: string;
  formatted: string;
  time: string;
  isUpcoming: boolean;
  icsUrl: string;
}

/**
 * Safely parses a Date or date string (YYYY-MM-DD or ISO) into a local Date instance
 * anchored at noon (12:00:00) to prevent any timezone-induced day shifts.
 */
export function parseDateSafe(d: string | Date | unknown): Date {
  if (d instanceof Date) {
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0);
  }
  const s = String(d || '').trim();
  const dateOnlyMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnlyMatch) {
    const year = parseInt(dateOnlyMatch[1], 10);
    const month = parseInt(dateOnlyMatch[2], 10) - 1;
    const day = parseInt(dateOnlyMatch[3], 10);
    return new Date(year, month, day, 12, 0, 0);
  }
  return new Date(s);
}

/**
 * Resolves the primary date for an event (YYYY-MM-DD):
 * Uses the first date in `dates` array, or fallback to single `date`.
 */
export function getEventPrimaryDate(ev: any): string | null {
  const dates = ev?.dates || ev?.data?.dates;
  if (Array.isArray(dates) && dates.length > 0) {
    const first = dates[0];
    return typeof first === 'string'
      ? first.split('T')[0]
      : first instanceof Date
        ? first.toISOString().split('T')[0]
        : String(first).split('T')[0];
  }
  const single = ev?.date || ev?.data?.date;
  if (single) {
    return typeof single === 'string'
      ? single.split('T')[0]
      : single instanceof Date
        ? single.toISOString().split('T')[0]
        : String(single).split('T')[0];
  }
  return null;
}

/**
 * Returns effective date for sorting/calendar:
 * For recurring events or series with upcoming dates, finds the nearest upcoming date (>= today).
 * Otherwise falls back to the primary (first) date or latest date.
 */
export function getEffectiveEventDate(ev: any): string | null {
  const dates = ev?.dates || ev?.data?.dates;
  if (Array.isArray(dates) && dates.length > 0) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const sorted = [...dates]
      .map((d) =>
        typeof d === 'string'
          ? d.split('T')[0]
          : d instanceof Date
            ? d.toISOString().split('T')[0]
            : String(d).split('T')[0]
      )
      .sort();
    const upcoming = sorted.find((d) => parseDateSafe(d).getTime() >= now.getTime());
    return upcoming || sorted[0];
  }
  return getEventPrimaryDate(ev);
}

/**
 * Derives day and month badges from event dates:
 * - day: "14" or "—"
 * - month: "MÄR" or "TERM"
 */
export function getEventDayMonth(ev: any): { day: string; month: string } {
  const dateStr = getEffectiveEventDate(ev) || getEventPrimaryDate(ev);
  if (!dateStr) return { day: '—', month: 'TERM' };
  const d = parseDateSafe(dateStr);
  if (isNaN(d.getTime())) return { day: '—', month: 'TERM' };
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('de-DE', { month: 'short' }).replace('.', '').toUpperCase();
  return { day, month };
}

/**
 * Formats event dates into a human-readable German string:
 * - Single date: "26. Juli 2026"
 * - Multi-day same month: "14. – 15. März 2026"
 * - Multi-day different months: "31. März – 02. April 2026"
 * - Recurring with rhythm: "Jeden 2. Dienstag im Monat ab 19:00 Uhr"
 * - Empty: fallback or "Termin folgt"
 */
export function formatEventDates(ev: any, fallback?: string): string {
  const dates = ev?.dates || ev?.data?.dates;
  const rhythm = ev?.rhythm || ev?.data?.rhythm;

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return rhythm || fallback || 'Termin folgt';
  }

  const parsed = dates
    .map((d: any) => parseDateSafe(d))
    .filter((d: Date) => !isNaN(d.getTime()))
    .sort((a: Date, b: Date) => a.getTime() - b.getTime());

  if (parsed.length === 0) {
    return rhythm || fallback || 'Termin folgt';
  }

  if (parsed.length === 1) {
    return parsed[0].toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  // If recurring event with a rhythm and multiple dates
  if (rhythm && parsed.length > 2) {
    return rhythm;
  }

  // Multi-day event (e.g. 2-3 consecutive days)
  const dStart = parsed[0];
  const dEnd = parsed[parsed.length - 1];

  const sameYear = dStart.getFullYear() === dEnd.getFullYear();
  const sameMonth = sameYear && dStart.getMonth() === dEnd.getMonth();

  if (sameMonth) {
    const monthYear = dStart.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    return `${String(dStart.getDate()).padStart(2, '0')}. – ${String(dEnd.getDate()).padStart(2, '0')}. ${monthYear}`;
  }

  if (sameYear) {
    const startStr = `${String(dStart.getDate()).padStart(2, '0')}. ${dStart.toLocaleDateString('de-DE', { month: 'short' })}`;
    const endStr = `${String(dEnd.getDate()).padStart(2, '0')}. ${dEnd.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}`;
    return `${startStr} – ${endStr}`;
  }

  const startStr = dStart.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const endStr = dEnd.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return `${startStr} – ${endStr}`;
}

/**
 * Escapes characters for RFC 5545 iCalendar values.
 */
function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, ' ');
}

export interface ParsedTimePoint {
  h: number;
  m: number;
  hhmm: string;
}

export interface ParsedTimeRange {
  start?: ParsedTimePoint;
  end?: ParsedTimePoint;
}

function parseTimePoint(timeStr?: string | null): ParsedTimePoint | undefined {
  const match = (timeStr || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return undefined;
  return {
    h,
    m,
    hhmm: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
  };
}

/**
 * Formats structured start/end times for display, falling back to "TBA".
 */
export function formatEventTime(startTime?: string | null, endTime?: string | null): string {
  const start = typeof startTime === 'string' ? startTime.trim() : '';
  const end = typeof endTime === 'string' ? endTime.trim() : '';
  if (!start || start.toUpperCase() === 'TBA') return 'TBA';
  if (end && end.toUpperCase() !== 'TBA') return `${start} – ${end}`;
  return start.includes('Uhr') ? start : `${start} Uhr`;
}

/**
 * Extracts structured start and end times from `startTime` and `endTime`.
 */
export function parseEventTimeRange(
  startTime?: string | null,
  endTime?: string | null
): ParsedTimeRange {
  return {
    start: parseTimePoint(startTime),
    end: parseTimePoint(endTime),
  };
}

/**
 * Generates an RFC 5545 compliant data:text/calendar download URL.
 */
export function createIcsDownload(
  title: string,
  desc: string,
  location: string,
  dateStr: string,
  startTime = '19:00',
  endTime?: string | null
): string {
  const cleanDate = dateStr.replace(/[^0-9]/g, '').slice(0, 8);
  const { start, end } = parseEventTimeRange(startTime, endTime);
  const startH = start ? start.h : 19;
  const startM = start ? start.m : 0;

  const year = parseInt(cleanDate.slice(0, 4), 10) || new Date().getFullYear();
  const month = (parseInt(cleanDate.slice(4, 6), 10) || 1) - 1;
  const day = parseInt(cleanDate.slice(6, 8), 10) || 1;

  const startDate = new Date(year, month, day, startH, startM, 0);
  let endDate: Date;
  if (end) {
    endDate = new Date(year, month, day, end.h, end.m, 0);
    if (endDate.getTime() <= startDate.getTime()) {
      endDate.setDate(endDate.getDate() + 1);
    }
  } else {
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
  }

  const formatIcsDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}${m}${dt}T${h}${min}00`;
  };

  const dtStart = formatIcsDate(startDate);
  const dtEnd = formatIcsDate(endDate);

  const safeUid = `${cleanDate}-${(title || 'event').replace(/[^a-zA-Z0-9]/g, '')}@ok-lab-karlsruhe.de`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OK Lab Karlsruhe//Events//DE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${safeUid}`,
    `DTSTAMP:${cleanDate}T000000Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(desc)}`,
    `LOCATION:${escapeIcsText(location)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

/**
 * Parses upcoming & past dates with calendar links for recurring event cards or detail pages.
 */
export function parseEventDatesList(ev: any): ParsedEventDate[] {
  if (!ev) return [];
  const rawList =
    Array.isArray(ev.dates) && ev.dates.length > 0
      ? ev.dates
      : Array.isArray(ev.data?.dates) && ev.data.dates.length > 0
        ? ev.data.dates
        : ev.date || ev.data?.date
          ? [ev.date || ev.data?.date]
          : [];

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const title = ev.title || ev.data?.title || 'Event';
  const desc = ev.teaser || ev.data?.teaser || ev.description || ev.body || '';
  const location = ev.location || ev.data?.location || '';
  const startTime = ev.startTime ?? ev.data?.startTime;
  const endTime = ev.endTime ?? ev.data?.endTime;
  const time = formatEventTime(startTime, endTime);

  return rawList.map((d: any) => {
    const dStr =
      typeof d === 'string'
        ? d.split('T')[0]
        : d instanceof Date
          ? d.toISOString().split('T')[0]
          : String(d).split('T')[0];
    const [year, month, day] = dStr.split('-');
    const dateInst = parseDateSafe(dStr);
    const monthLabel = dateInst
      .toLocaleString('de-DE', { month: 'short' })
      .replace('.', '')
      .toUpperCase();
    const weekday = dateInst.toLocaleDateString('de-DE', { weekday: 'long' });
    const formatted = `${day}.${month}.${year}`;
    const timestamp = dateInst.getTime();

    return {
      iso: dStr,
      timestamp,
      day,
      month: monthLabel,
      year,
      weekday,
      formatted,
      time,
      isUpcoming: timestamp >= todayMidnight,
      icsUrl: createIcsDownload(title, desc, location, dStr, startTime, endTime),
    };
  });
}

/**
 * Utility to get series metadata for an event from a list of events.
 */
export function getSeriesInfo(eventId: string, allEvents: any[]): SeriesInfo | null {
  const event = allEvents.find((e) => (e.id || e.slug) === eventId);
  if (!event) return null;

  const seriesKey = event.series || event.data?.series;
  if (!seriesKey) return null;

  const seriesEvents = allEvents
    .filter((e) => {
      const s = e.series || e.data?.series;
      const d = getEventPrimaryDate(e);
      return s === seriesKey && d;
    })
    .sort((a, b) => {
      const dateA = parseDateSafe(getEventPrimaryDate(a) || 0).getTime();
      const dateB = parseDateSafe(getEventPrimaryDate(b) || 0).getTime();
      return dateB - dateA;
    });

  if (seriesEvents.length === 0) return null;

  const currentIndex = seriesEvents.findIndex((e) => (e.id || e.slug) === eventId);
  if (currentIndex === -1) return null;

  const years = [
    ...new Set(seriesEvents.map((e) => parseDateSafe(getEventPrimaryDate(e) || 0).getFullYear())),
  ];
  const editionNumber = seriesEvents.length - currentIndex;

  return {
    editionNumber: editionNumber > 0 ? editionNumber : null,
    years: years,
    seriesEvents: seriesEvents.map((e) => ({
      id: e.slug || e.id,
      title: e.title || e.data?.title,
      date: getEventPrimaryDate(e),
      series: e.series || e.data?.series,
    })),
  };
}

/**
 * Calculates series grouping metadata to pick a representative event
 * (nearest upcoming event, or latest past event) for series display.
 */
export function computeSeriesGrouped(
  allEvents: any[]
): Map<string, { id: string; moreCount: number }> {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const grouped = new Map<string, any[]>();

  allEvents.forEach((e) => {
    const s = e.series || e.data?.series;
    if (s) {
      if (!grouped.has(s)) {
        grouped.set(s, []);
      }
      grouped.get(s)!.push(e);
    }
  });

  const representativeMap = new Map<string, { id: string; moreCount: number }>();

  grouped.forEach((seriesEvents, seriesKey) => {
    const getEvId = (e: any) => e.id || e.slug;
    if (seriesEvents.length === 1) {
      representativeMap.set(seriesKey, { id: getEvId(seriesEvents[0]), moreCount: 0 });
      return;
    }

    const upcoming = seriesEvents.filter((e) => {
      const eff = getEffectiveEventDate(e);
      const d = eff ? parseDateSafe(eff) : new Date(0);
      return d.getTime() >= now.getTime();
    });

    let selected: any = null;
    if (upcoming.length > 0) {
      upcoming.sort(
        (a, b) =>
          parseDateSafe(getEffectiveEventDate(a) || 0).getTime() -
          parseDateSafe(getEffectiveEventDate(b) || 0).getTime()
      );
      selected = upcoming[0];
    } else {
      seriesEvents.sort(
        (a, b) =>
          parseDateSafe(getEffectiveEventDate(b) || 0).getTime() -
          parseDateSafe(getEffectiveEventDate(a) || 0).getTime()
      );
      selected = seriesEvents[0];
    }

    representativeMap.set(seriesKey, {
      id: getEvId(selected),
      moreCount: seriesEvents.length - 1,
    });
  });

  return representativeMap;
}
