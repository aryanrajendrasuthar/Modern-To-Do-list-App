import { parseISO } from 'date-fns';

// MongoDB stores dates as UTC midnight. Parsing the full ISO string in a timezone
// behind UTC shifts the date back by one day. Strip the time portion first so
// date-fns interprets it as local midnight instead.
export function parseLocalDate(isoString: string): Date {
  return parseISO(isoString.split('T')[0]);
}
