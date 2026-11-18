import { describe, it, expect } from 'vitest';
import {
  parseDateSafe,
  formatEventDates,
  createIcsDownload,
  getSeriesInfo,
  getEventPrimaryDate,
  computeSeriesGrouped,
  parseEventDatesList,
  formatEventTime,
  parseEventTimeRange,
} from './events';

describe('events utils', () => {
  describe('parseDateSafe', () => {
    it('anchors date-only string at noon so day does not shift', () => {
      const d = parseDateSafe('2026-03-14');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(2); // 0-indexed: March
      expect(d.getDate()).toBe(14);
      expect(d.getHours()).toBe(12);
    });

    it('anchors UTC Date instance at local noon so day does not shift', () => {
      const dUtc = new Date(Date.UTC(2026, 2, 14, 0, 0, 0));
      const d = parseDateSafe(dUtc);
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(2);
      expect(d.getDate()).toBe(14);
      expect(d.getHours()).toBe(12);
    });
  });

  describe('getEventPrimaryDate', () => {
    it('returns first date from dates array', () => {
      expect(getEventPrimaryDate({ dates: ['2026-03-14', '2026-03-15'] })).toBe('2026-03-14');
    });

    it('falls back to single date field', () => {
      expect(getEventPrimaryDate({ date: '2026-05-20' })).toBe('2026-05-20');
    });

    it('returns null if no dates available', () => {
      expect(getEventPrimaryDate({})).toBeNull();
    });
  });

  describe('formatEventDates', () => {
    it('formats single date in German format', () => {
      const ev = { dates: ['2026-07-26'] };
      expect(formatEventDates(ev)).toBe('26. Juli 2026');
    });

    it('formats multi-day event in same month', () => {
      const ev = { dates: ['2026-03-14', '2026-03-15'] };
      expect(formatEventDates(ev)).toBe('14. – 15. März 2026');
    });

    it('formats multi-day event spanning different months in same year', () => {
      const ev = { dates: ['2026-03-31', '2026-04-02'] };
      expect(formatEventDates(ev)).toBe('31. Mär – 02. Apr. 2026');
    });

    it('returns rhythm if multiple dates and rhythm defined', () => {
      const ev = {
        dates: ['2026-01-10', '2026-02-10', '2026-03-10'],
        rhythm: 'Jeden 2. Dienstag im Monat',
      };
      expect(formatEventDates(ev)).toBe('Jeden 2. Dienstag im Monat');
    });

    it('returns fallback or "Termin folgt" if dates are empty', () => {
      expect(formatEventDates({})).toBe('Termin folgt');
      expect(formatEventDates({}, 'Bald verfügbar')).toBe('Bald verfügbar');
    });
  });

  describe('createIcsDownload', () => {
    it('generates a valid data:text/calendar URI with explicit end time when provided', () => {
      const icsUri = createIcsDownload(
        'Radverkehr Workshop',
        'Offener Workshop',
        'Kaiserstraße 97',
        '2026-06-01',
        '14:00',
        '17:30'
      );
      const decoded = decodeURIComponent(icsUri.replace('data:text/calendar;charset=utf-8,', ''));
      expect(decoded).toContain('DTSTART:20260601T140000');
      expect(decoded).toContain('DTEND:20260601T173000');
    });

    it('generates a valid data:text/calendar URI', () => {
      const icsUri = createIcsDownload(
        'Lab-Treffen',
        'Monatliches Arbeitstreffen, Austausch & Orga',
        'Impact Hub Karlsruhe, Kaiserstraße 97',
        '2026-03-14',
        '19:00'
      );

      expect(icsUri.startsWith('data:text/calendar;charset=utf-8,')).toBe(true);
      const decoded = decodeURIComponent(icsUri.replace('data:text/calendar;charset=utf-8,', ''));

      expect(decoded).toContain('BEGIN:VCALENDAR');
      expect(decoded).toContain('VERSION:2.0');
      expect(decoded).toContain('SUMMARY:Lab-Treffen');
      expect(decoded).toContain('LOCATION:Impact Hub Karlsruhe\\, Kaiserstraße 97');
      expect(decoded).toContain('DTSTART:20260314T190000');
      expect(decoded).toContain('DTEND:20260314T210000');
      expect(decoded).toContain('END:VCALENDAR');
    });
  });

  describe('getSeriesInfo', () => {
    const mockEvents = [
      { id: 'fest-26', series: 'das-fest', dates: ['2026-07-26'], title: 'Das Fest 2026' },
      { id: 'fest-25', series: 'das-fest', dates: ['2025-07-25'], title: 'Das Fest 2025' },
      { id: 'fest-24', series: 'das-fest', dates: ['2024-07-24'], title: 'Das Fest 2024' },
      { id: 'other', series: 'unrelated', dates: ['2026-01-01'], title: 'Other' },
    ];

    it('calculates edition number correctly based on chronological order', () => {
      const info26 = getSeriesInfo('fest-26', mockEvents);
      expect(info26?.editionNumber).toBe(3);
      expect(info26?.years).toEqual([2026, 2025, 2024]);

      const info24 = getSeriesInfo('fest-24', mockEvents);
      expect(info24?.editionNumber).toBe(1);
    });

    it('returns null if event is not in a series', () => {
      const info = getSeriesInfo('other', [{ id: 'other', dates: ['2026-01-01'] }]);
      expect(info).toBeNull();
    });

    it('returns null if event id is not found', () => {
      const info = getSeriesInfo('nonexistent', mockEvents);
      expect(info).toBeNull();
    });
  });

  describe('computeSeriesGrouped', () => {
    it('groups events by series and identifies representatives with count', () => {
      const mockEvents = [
        { id: 'odd-26', series: 'odd', dates: ['2026-03-07'] },
        { id: 'odd-25', series: 'odd', dates: ['2025-03-01'] },
        { id: 'single', series: 'single-series', dates: ['2026-05-01'] },
        { id: 'no-series', dates: ['2026-06-01'] },
      ];

      const repMap = computeSeriesGrouped(mockEvents);
      expect(repMap.has('odd')).toBe(true);
      expect(repMap.get('odd')?.moreCount).toBe(1);
      expect(repMap.get('single-series')?.moreCount).toBe(0);
      expect(repMap.has('no-series')).toBe(false);
    });
  });

  describe('parseEventDatesList', () => {
    it('falls back to "TBA" when startTime is undefined or empty', () => {
      expect(parseEventDatesList({ dates: ['2026-06-01'] })[0].time).toBe('TBA');
      expect(parseEventDatesList({ dates: ['2026-06-01'], startTime: '   ' })[0].time).toBe('TBA');
      expect(parseEventDatesList({ data: { dates: ['2026-06-01'], startTime: '' } })[0].time).toBe(
        'TBA'
      );
      expect(
        parseEventDatesList({ dates: ['2026-06-01'], startTime: '14:00', endTime: '17:30' })[0].time
      ).toBe('14:00 – 17:30');
    });
  });

  describe('formatEventTime & parseEventTimeRange', () => {
    it('formats startTime and endTime cleanly with TBA fallback', () => {
      expect(formatEventTime('14:00', '17:30')).toBe('14:00 – 17:30');
      expect(formatEventTime('19:00', undefined)).toBe('19:00 Uhr');
      expect(formatEventTime('TBA', undefined)).toBe('TBA');
      expect(formatEventTime('', '')).toBe('TBA');
    });

    it('parses separate startTime and endTime strings', () => {
      expect(parseEventTimeRange('14:00', '17:30')).toEqual({
        start: { h: 14, m: 0, hhmm: '14:00' },
        end: { h: 17, m: 30, hhmm: '17:30' },
      });
      expect(parseEventTimeRange('TBA', undefined)).toEqual({ start: undefined, end: undefined });
    });
  });
});
