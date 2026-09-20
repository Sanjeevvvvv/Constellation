import {
  Music, ShoppingBag, Film, Calendar, MapPin, Camera, MessageCircle, Search, StickyNote,
} from 'lucide-react';
import type { ReceiptCategory } from '../types/receipt';

export const CATEGORY_META: Record<ReceiptCategory, { icon: any; bg: string; text: string; border: string; label: string }> = {
  music:   { icon: Music,        bg: 'bg-fuchsia-500/10',   text: 'text-fuchsia-400',   border: 'border-fuchsia-500/30',   label: 'Music' },
  purchase:{ icon: ShoppingBag,  bg: 'bg-sky-500/10',       text: 'text-sky-400',       border: 'border-sky-500/30',       label: 'Purchase' },
  movie:   { icon: Film,         bg: 'bg-amber-500/10',     text: 'text-amber-400',     border: 'border-amber-500/30',     label: 'Movie' },
  event:   { icon: Calendar,     bg: 'bg-rose-500/10',      text: 'text-rose-400',      border: 'border-rose-500/30',      label: 'Event' },
  place:   { icon: MapPin,       bg: 'bg-emerald-500/10',   text: 'text-emerald-400',   border: 'border-emerald-500/30',   label: 'Place' },
  photo:   { icon: Camera,       bg: 'bg-violet-500/10',    text: 'text-violet-400',    border: 'border-violet-500/30',    label: 'Photo' },
  message: { icon: MessageCircle,bg: 'bg-teal-500/10',      text: 'text-teal-400',      border: 'border-teal-500/30',      label: 'Message' },
  search:  { icon: Search,       bg: 'bg-indigo-500/10',    text: 'text-indigo-400',    border: 'border-indigo-500/30',    label: 'Search' },
  note:    { icon: StickyNote,   bg: 'bg-lime-500/10',      text: 'text-lime-400',      border: 'border-lime-500/30',      label: 'Note' },
};

export function categoryMeta(cat: ReceiptCategory) {
  return CATEGORY_META[cat];
}

export const ALL_CATEGORIES: ReceiptCategory[] = ['music','purchase','movie','event','place','photo','message','search','note'];
