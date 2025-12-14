'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Bell } from 'lucide-react';
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

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) setItems(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // mark all read when visiting this page
    fetch('/api/notifications', { method: 'POST' }).catch(() => {});
  }, []);

  const pillColor = (type: string) => {
    if (type.includes('returned')) return 'bg-red-100 text-red-800';
    if (type.includes('approved')) return 'bg-emerald-100 text-emerald-800';
    if (type.includes('signature')) return 'bg-blue-100 text-blue-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Activity on your deferral requests and approvals
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(n => (
                <Link
                  key={n.id}
                  href={n.deferralId ? `/deferrals/${n.deferralId}` : '#'}
                  className={`flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm hover:bg-accent ${
                    !n.read ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge className={pillColor(n.type)}>
                        {n.deferralCode || 'Deferral'}
                      </Badge>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-slate-800">{n.message}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
