'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

type NotificationItem = {
  id: string;
  deferralId: string | null;
  deferralCode: string | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAll = async () => {
    try {
      setMarkingAll(true);
      await fetch('/api/notifications', { method: 'POST' });
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all read', e);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      loadNotifications();
    }
  };

  const pillColor = (type: string) => {
    if (type.includes('returned')) return 'bg-red-100 text-red-800';
    if (type.includes('approved')) return 'bg-emerald-100 text-emerald-800';
    if (type.includes('signature')) return 'bg-blue-100 text-blue-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-4 min-w-4 px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <p className="font-semibold text-sm">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'You are all caught up'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={unreadCount === 0 || markingAll}
            onClick={handleMarkAll}
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            items.map(n => (
              <Link
                key={n.id}
                href={n.deferralId ? `/deferrals/${n.deferralId}` : '#'}
                className={`flex flex-col gap-1 px-4 py-3 text-sm hover:bg-accent ${
                  !n.read ? 'bg-slate-50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={pillColor(n.type)}>
                      {n.deferralCode || 'Deferral'}
                    </Badge>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-2">
                  {n.message}
                </p>
              </Link>
            ))
          )}
        </div>

        <div className="border-t px-4 py-2 text-right">
          <Link
            href="/notifications"
            className="text-xs text-muted-foreground hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
