import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, FileText, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Queries
  const overviewQuery = trpc.dashboard.overview.useQuery();
  const staffStatsQuery = trpc.staff.stats.useQuery();
  const attendanceStatsQuery = trpc.attendance.stats.useQuery();
  const reportStatsQuery = trpc.reports.stats.useQuery();

  const overview = overviewQuery.data;
  const staffStats = staffStatsQuery.data;
  const attendanceStats = attendanceStatsQuery.data;
  const reportStats = reportStatsQuery.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {overview?.company.name} • {overview?.company.plan} Plan
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overview?.stats.totalStaff || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Active employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Today Check-Ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overview?.stats.todayCheckIns || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Clocked in today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overview?.stats.pendingReports || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold capitalize">
                {overview?.company.subscriptionStatus || "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {overview?.subscription?.renewalDate
                  ? new Date(overview.subscription.renewalDate).toLocaleDateString()
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Staff Management</CardTitle>
            <Link href="/staff/add">
              <Button size="sm">Add Staff</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{staffStats?.total || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{staffStats?.active || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{staffStats?.inactive || 0}</p>
              </div>
            </div>
            <Link href="/staff">
              <Button variant="outline" className="w-full mt-4">
                View All Staff
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Attendance Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Today Check-Ins</p>
                <p className="text-2xl font-bold">{attendanceStats?.todayCheckIns || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{attendanceStats?.totalRecords || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Hours/Day</p>
                <p className="text-2xl font-bold">{attendanceStats?.averageHoursWorked || 0}h</p>
              </div>
            </div>
            <Link href="/attendance">
              <Button variant="outline" className="w-full mt-4">
                View Attendance Logs
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Reports Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Reports Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{reportStats?.total || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-yellow-600">{reportStats?.submitted || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-blue-600">{reportStats?.reviewed || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{reportStats?.approved || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{reportStats?.draft || 0}</p>
              </div>
            </div>
            <Link href="/reports">
              <Button variant="outline" className="w-full mt-4">
                View All Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {overview?.recentAttendance && overview.recentAttendance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overview.recentAttendance.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="text-sm">
                      <p className="font-medium">
                        {new Date(record.clockInTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{record.totalHours || 0}h</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
