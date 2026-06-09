import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, Calendar, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StaffDashboard() {
  const { user } = useAuth();
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);

  // Queries
  const todayStatusQuery = trpc.attendance.todayStatus.useQuery();
  const staffSummaryQuery = trpc.dashboard.staffSummary.useQuery();
  const attendanceHistoryQuery = trpc.attendance.history.useQuery({ limit: 7 });

  // Mutations
  const clockInMutation = trpc.attendance.clockIn.useMutation({
    onSuccess: () => {
      toast.success("Clocked in successfully!");
      todayStatusQuery.refetch();
      staffSummaryQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clock in");
    },
  });

  const clockOutMutation = trpc.attendance.clockOut.useMutation({
    onSuccess: () => {
      toast.success("Clocked out successfully!");
      todayStatusQuery.refetch();
      staffSummaryQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clock out");
    },
  });

  const handleClockIn = async () => {
    setIsClockingIn(true);
    try {
      // Get GPS coordinates if available
      let gpsLat, gpsLng;
      if ("geolocation" in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }) as GeolocationPosition;
        gpsLat = position.coords.latitude;
        gpsLng = position.coords.longitude;
      }

      await clockInMutation.mutateAsync({ gpsLat, gpsLng });
    } catch (error) {
      console.error("Clock in error:", error);
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setIsClockingOut(true);
    try {
      let gpsLat, gpsLng;
      if ("geolocation" in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }) as GeolocationPosition;
        gpsLat = position.coords.latitude;
        gpsLng = position.coords.longitude;
      }

      await clockOutMutation.mutateAsync({ gpsLat, gpsLng });
    } catch (error) {
      console.error("Clock out error:", error);
    } finally {
      setIsClockingOut(false);
    }
  };

  const todayStatus = todayStatusQuery.data;
  const summary = staffSummaryQuery.data;
  const history = attendanceHistoryQuery.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-500 mt-1">Your daily work summary</p>
        </div>

        {/* Clock In/Out Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold text-blue-600">
                  {todayStatus?.status === "clocked_in" ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Clock In Time</p>
                <p className="text-lg font-semibold">
                  {todayStatus?.clockInTime
                    ? new Date(todayStatus.clockInTime).toLocaleTimeString()
                    : "—"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Hours Worked</p>
                <p className="text-lg font-semibold">
                  {todayStatus?.totalHours ? `${todayStatus.totalHours}h` : "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClockIn}
                disabled={
                  todayStatus?.status === "clocked_in" ||
                  isClockingIn ||
                  clockInMutation.isPending
                }
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isClockingIn || clockInMutation.isPending ? "Clocking In..." : "Clock In"}
              </Button>
              <Button
                onClick={handleClockOut}
                disabled={
                  todayStatus?.status !== "clocked_in" ||
                  isClockingOut ||
                  clockOutMutation.isPending
                }
                variant="destructive"
                className="flex-1"
              >
                {isClockingOut || clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Week Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Days Worked</p>
                <p className="text-2xl font-bold">{summary?.weekStats.daysWorked || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{summary?.weekStats.totalHours || 0}h</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average/Day</p>
                <p className="text-2xl font-bold">{summary?.weekStats.averageHours || 0}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(record.clockInTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(record.clockInTime).toLocaleTimeString()} -{" "}
                        {record.clockOutTime
                          ? new Date(record.clockOutTime).toLocaleTimeString()
                          : "—"}
                      </p>
                    </div>
                    <p className="font-semibold">{record.totalHours || 0}h</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No attendance records yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold">{summary?.pendingReports || 0}</p>
              </div>
              <Button variant="outline">View Reports</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
