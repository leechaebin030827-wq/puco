import { formatDistanceToNow as fns } from "date-fns";
import { ko } from "date-fns/locale";

export function formatDistanceToNow(dateStr: string): string {
  try {
    return fns(new Date(dateStr), { addSuffix: true, locale: ko });
  } catch {
    return dateStr;
  }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
