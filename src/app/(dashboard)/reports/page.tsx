// src/app/(dashboard)/reports/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, TrendingUp, Calendar, Users } from 'lucide-react';
import type { Deferral } from '@/types';

export default function ReportsPage() {
  const [deferrals, setDeferrals] = useState<Deferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeferrals();
  }, []);

  const fetchDeferrals = async () => {
    try {
      const response = await fetch('/api/deferrals');
      const result = await response.json();
      
      if (result.success) {
        setDeferrals(result.data);
      }
    } catch (error) {
      console.error('Error fetching deferrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics calculations
  const byStatus = deferrals.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byDepartment = deferrals.reduce((acc, d) => {
    acc[d.department] = (acc[d.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCriticality = deferrals.reduce((acc, d) => {
    const crit = d.equipmentSafetyCriticality || 'Unknown';
    acc[crit] = (acc[crit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Insights and statistics about deferral requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deferrals</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deferrals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deferrals.filter(d => {
                const date = new Date(d.createdAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deferrals.length > 0 
                ? Math.round((byStatus['fully_approved'] || 0) / deferrals.length * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(byDepartment).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="criticality">By Criticality</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Deferrals by Status</CardTitle>
              <CardDescription>Distribution of deferral statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(byStatus).map(([status, count]) => (
                    <TableRow key={status}>
                      <TableCell className="font-medium capitalize">{status.replace('_', ' ')}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 max-w-[200px]">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(count / deferrals.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((count / deferrals.length) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="department">
          <Card>
            <CardHeader>
              <CardTitle>Deferrals by Department</CardTitle>
              <CardDescription>Which departments submit the most deferrals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(byDepartment)
                    .sort((a, b) => b[1] - a[1])
                    .map(([dept, count]) => (
                      <TableRow key={dept}>
                        <TableCell className="font-medium">{dept}</TableCell>
                        <TableCell>{count}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-[200px]">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${(count / deferrals.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round((count / deferrals.length) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criticality">
          <Card>
            <CardHeader>
              <CardTitle>Deferrals by Criticality</CardTitle>
              <CardDescription>Safety criticality distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criticality</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(byCriticality)
                    .sort((a, b) => b[1] - a[1])
                    .map(([crit, count]) => (
                      <TableRow key={crit}>
                        <TableCell>
                          <Badge variant={
                            crit === 'Critical' ? 'destructive' : 
                            crit === 'High' ? 'default' : 
                            'secondary'
                          }>
                            {crit}
                          </Badge>
                        </TableCell>
                        <TableCell>{count}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-[200px]">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${(count / deferrals.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round((count / deferrals.length) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
