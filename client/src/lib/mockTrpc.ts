import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from "../../server/routers";
import { TRPCClientError } from '@trpc/client';
import { UNAUTHED_ERR_MSG } from '@shared/const';

// Mock data storage
const mockDb = {
  users: [],
  companies: [],
  subscriptions: [],
  attendance: [],
  reports: [],
  locations: [],
  plans: [
    { id: 'starter', name: 'Starter', description: 'For small teams', amount: 2900 },
    { id: 'professional', name: 'Professional', description: 'Most popular', amount: 7900 },
    { id: 'enterprise', name: 'Enterprise', description: 'For large organizations', amount: 0 },
  ],
  // Add initial data for testing
  init: () => {
    if (localStorage.getItem('mockDbInitialized') === 'true') return;

    const now = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(now.getMonth() + 1);

    mockDb.companies.push({
      id: 1,
      name: 'Mock Company',
      email: 'company@example.com',
      plan: 'professional',
      subscriptionStatus: 'active',
      createdAt: now,
      updatedAt: now,
    });

    mockDb.users.push({
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'company_admin',
      companyId: 1,
      openId: 'mock-admin-openid',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    mockDb.users.push({
      id: 2,
      name: 'Staff User',
      email: 'staff@example.com',
      role: 'staff',
      companyId: 1,
      openId: 'mock-staff-openid',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    mockDb.subscriptions.push({
      id: 1,
      companyId: 1,
      plan: 'professional',
      planType: 'monthly',
      status: 'active',
      paystackReference: 'mock-paystack-ref',
      startDate: now,
      endDate: oneMonthLater,
      renewalDate: oneMonthLater,
      amount: 7900,
      createdAt: now,
      updatedAt: now,
    });

    localStorage.setItem('mockDbInitialized', 'true');
    localStorage.setItem('mockDb', JSON.stringify(mockDb));
  },
  save: () => {
    localStorage.setItem('mockDb', JSON.stringify(mockDb));
  },
  load: () => {
    const data = localStorage.getItem('mockDb');
    if (data) {
      Object.assign(mockDb, JSON.parse(data));
    }
  }
};

mockDb.load();
mockDb.init();

// Helper to simulate authentication
let currentUser = null;

export const simulateLogin = (user: any) => {
  currentUser = user;
  localStorage.setItem('mockCurrentUser', JSON.stringify(user));
};

export const simulateLogout = () => {
  currentUser = null;
  localStorage.removeItem('mockCurrentUser');
};

const getMockCurrentUser = () => {
  if (currentUser) return currentUser;
  const storedUser = localStorage.getItem('mockCurrentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser;
  }
  return null;
};

// Mock tRPC procedures
const mockTrpc = createTRPCReact<AppRouter>();

export const trpc = {
  ...mockTrpc,
  auth: {
    me: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: UNAUTHED_ERR_MSG });
      }
      // Attach company data to user for subscription check
      const company = mockDb.companies.find(c => c.id === user.companyId);
      return { ...user, company };
    }),
    logout: mockTrpc.procedure.mutation(() => {
      simulateLogout();
      return { success: true };
    }),
  },
  payment: {
    getPlans: mockTrpc.procedure.query(() => {
      return {
        plans: mockDb.plans,
      };
    }),
    getSubscription: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: UNAUTHED_ERR_MSG });
      }
      const subscription = mockDb.subscriptions.find(s => s.companyId === user.companyId);
      const company = mockDb.companies.find(c => c.id === user.companyId);
      return { subscription, company };
    }),
    initiatePayment: mockTrpc.procedure.mutation(async ({ input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: UNAUTHED_ERR_MSG });
      }

      const plan = mockDb.plans.find(p => p.id === input.plan);
      if (!plan) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid plan' });
      }

      // Simulate Paystack redirect and callback
      const reference = `mock_paystack_${Date.now()}`;
      const authorizationUrl = `https://mock-paystack.com/pay?reference=${reference}&plan=${input.plan}`;

      // For mock, we'll just update the subscription directly after a simulated delay
      setTimeout(() => {
        const company = mockDb.companies.find(c => c.id === user.companyId);
        if (company) {
          company.subscriptionStatus = 'active';
          company.plan = plan.id;
        }
        const existingSub = mockDb.subscriptions.find(s => s.companyId === user.companyId);
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(now.getMonth() + 1);

        if (existingSub) {
          existingSub.plan = plan.id;
          existingSub.planType = 'monthly';
          existingSub.status = 'active';
          existingSub.paystackReference = reference;
          existingSub.startDate = now;
          existingSub.endDate = endDate;
          existingSub.renewalDate = endDate;
          existingSub.amount = plan.amount;
          existingSub.updatedAt = now;
        } else {
          mockDb.subscriptions.push({
            id: mockDb.subscriptions.length + 1,
            companyId: user.companyId,
            plan: plan.id,
            planType: 'monthly',
            status: 'active',
            paystackReference: reference,
            startDate: now,
            endDate: endDate,
            renewalDate: endDate,
            amount: plan.amount,
            createdAt: now,
            updatedAt: now,
          });
        }
        mockDb.save();
      }, 1000);

      return { success: true, data: { authorizationUrl } };
    }),
    cancelSubscription: mockTrpc.procedure.mutation(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: UNAUTHED_ERR_MSG });
      }
      const company = mockDb.companies.find(c => c.id === user.companyId);
      if (company) {
        company.subscriptionStatus = 'inactive';
        company.plan = 'free';
      }
      const existingSub = mockDb.subscriptions.find(s => s.companyId === user.companyId);
      if (existingSub) {
        existingSub.status = 'cancelled';
        existingSub.updatedAt = new Date();
      }
      mockDb.save();
      return { success: true };
    }),
  },
  staff: {
    list: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      return mockDb.users.filter(u => u.companyId === user.companyId && (u.role === 'staff' || u.role === 'company_admin'));
    }),
    get: mockTrpc.procedure.query(({ input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const staffMember = mockDb.users.find(u => u.id === input.id && u.companyId === user.companyId);
      if (!staffMember) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Staff member not found' });
      }
      return staffMember;
    }),
    create: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || user.role !== 'company_admin' && user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      if (!user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const newStaff = {
        id: mockDb.users.length + 1,
        companyId: user.companyId,
        name: input.name,
        email: input.email,
        locationId: input.locationId,
        role: input.role || 'staff',
        openId: `mock-user-${Date.now()}`,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.users.push(newStaff);
      mockDb.save();
      return { success: true, data: newStaff };
    }),
    update: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || user.role !== 'company_admin' && user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      if (!user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const staffIndex = mockDb.users.findIndex(u => u.id === input.id && u.companyId === user.companyId);
      if (staffIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Staff member not found' });
      }
      const updatedStaff = { ...mockDb.users[staffIndex], ...input, updatedAt: new Date() };
      mockDb.users[staffIndex] = updatedStaff;
      mockDb.save();
      return { success: true, data: updatedStaff };
    }),
    delete: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || user.role !== 'company_admin' && user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      if (!user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const initialLength = mockDb.users.length;
      mockDb.users = mockDb.users.filter(u => !(u.id === input.id && u.companyId === user.companyId));
      if (mockDb.users.length === initialLength) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Staff member not found' });
      }
      mockDb.save();
      return { success: true };
    }),
    stats: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const staff = mockDb.users.filter(u => u.companyId === user.companyId && (u.role === 'staff' || u.role === 'company_admin'));
      const active = staff.filter(s => s.status === 'active').length;
      const inactive = staff.filter(s => s.status === 'inactive').length;
      return { total: staff.length, active, inactive };
    }),
  },
  attendance: {
    clockIn: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'company_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only staff can clock in' });
      }
      const now = new Date();
      const existingAttendance = mockDb.attendance.find(a =>
        a.userId === user.id &&
        a.companyId === user.companyId &&
        new Date(a.clockInTime).toDateString() === now.toDateString() &&
        !a.clockOutTime
      );
      if (existingAttendance) {
        throw new TRPCError({ code: 'CONFLICT', message: 'You are already clocked in' });
      }
      const newAttendance = {
        id: mockDb.attendance.length + 1,
        companyId: user.companyId,
        userId: user.id,
        locationId: input.locationId || user.locationId || null,
        clockInTime: now,
        clockInGpsLat: input.gpsLat || null,
        clockInGpsLng: input.gpsLng || null,
        clockOutTime: null,
        clockOutGpsLat: null,
        clockOutGpsLng: null,
        totalHours: null,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      mockDb.attendance.push(newAttendance);
      mockDb.save();
      return { success: true, data: newAttendance };
    }),
    clockOut: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'company_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only staff can clock out' });
      }
      const now = new Date();
      const attendanceIndex = mockDb.attendance.findIndex(a =>
        a.userId === user.id &&
        a.companyId === user.companyId &&
        new Date(a.clockInTime).toDateString() === now.toDateString() &&
        !a.clockOutTime
      );
      if (attendanceIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No active clock-in found' });
      }
      const existingAttendance = mockDb.attendance[attendanceIndex];
      if (existingAttendance.clockOutTime) {
        throw new TRPCError({ code: 'CONFLICT', message: 'You have already clocked out' });
      }

      const clockInTime = new Date(existingAttendance.clockInTime);
      const totalMs = now.getTime() - clockInTime.getTime();
      const totalHours = (totalMs / (1000 * 60 * 60));

      const updatedAttendance = {
        ...existingAttendance,
        clockOutTime: now,
        clockOutGpsLat: input.gpsLat || null,
        clockOutGpsLng: input.gpsLng || null,
        totalHours: parseFloat(totalHours.toFixed(2)),
        status: 'completed',
        updatedAt: now,
      };
      mockDb.attendance[attendanceIndex] = updatedAttendance;
      mockDb.save();
      return { success: true, data: { totalHours: updatedAttendance.totalHours } };
    }),
    todayStatus: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const today = new Date();
      const attendance = mockDb.attendance.find(a =>
        a.userId === user.id &&
        a.companyId === user.companyId &&
        new Date(a.clockInTime).toDateString() === today.toDateString()
      );

      if (!attendance) {
        return { status: 'not_clocked_in', clockInTime: null, clockOutTime: null, totalHours: null };
      }

      return {
        status: attendance.clockOutTime ? 'clocked_out' : 'clocked_in',
        clockInTime: attendance.clockInTime,
        clockOutTime: attendance.clockOutTime,
        totalHours: attendance.totalHours,
      };
    }),
    history: mockTrpc.procedure.query(({ input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      return mockDb.attendance
        .filter(a => a.userId === user.id && a.companyId === user.companyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, input.limit);
    }),
    stats: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const logs = mockDb.attendance.filter(a => a.companyId === user.companyId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLogs = logs.filter(log => {
        const logDate = new Date(log.clockInTime);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });
      const completedLogs = logs.filter(log => log.totalHours);
      const avgHours = completedLogs.length > 0
        ? (completedLogs.reduce((sum, log) => sum + (log.totalHours || 0), 0) / completedLogs.length)
        : 0;
      return { todayCheckIns: todayLogs.length, totalRecords: logs.length, averageHoursWorked: avgHours.toFixed(2) };
    }),
  },
  reports: {
    create: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const now = new Date();
      const newReport = {
        id: mockDb.reports.length + 1,
        companyId: user.companyId,
        userId: user.id,
        type: input.type,
        title: input.title,
        content: input.content,
        attachmentUrl: input.attachmentUrl || null,
        status: 'draft',
        reportDate: input.reportDate ? new Date(input.reportDate) : now,
        createdAt: now,
        updatedAt: now,
        submittedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
      };
      mockDb.reports.push(newReport);
      mockDb.save();
      return { success: true, data: newReport };
    }),
    get: mockTrpc.procedure.query(({ input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const report = mockDb.reports.find(r => r.id === input.id && r.companyId === user.companyId);
      if (!report) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
      }
      if (report.userId !== user.id && user.role === 'staff') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot access other users\' reports' });
      }
      return report;
    }),
    listMy: mockTrpc.procedure.query(({ input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      return mockDb.reports
        .filter(r => r.userId === user.id && r.companyId === user.companyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, input.limit);
    }),
    listCompany: mockTrpc.procedure.query(({ input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'staff') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return mockDb.reports
        .filter(r => r.companyId === user.companyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, input.limit);
    }),
    update: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const reportIndex = mockDb.reports.findIndex(r => r.id === input.id && r.companyId === user.companyId);
      if (reportIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
      }
      const existingReport = mockDb.reports[reportIndex];
      if (user.role === 'staff') {
        if (existingReport.userId !== user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot edit other users\' reports' });
        }
        if (existingReport.status !== 'draft') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot edit submitted reports' });
        }
      }
      const updatedReport = { ...existingReport, ...input, updatedAt: new Date() };
      mockDb.reports[reportIndex] = updatedReport;
      mockDb.save();
      return { success: true, data: updatedReport };
    }),
    submit: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'company_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only staff can submit reports' });
      }
      const reportIndex = mockDb.reports.findIndex(r => r.id === input.id && r.companyId === user.companyId);
      if (reportIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
      }
      const existingReport = mockDb.reports[reportIndex];
      if (existingReport.userId !== user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot submit other users\' reports' });
      }
      if (existingReport.status !== 'draft') {
        throw new TRPCError({ code: 'CONFLICT', message: 'Only draft reports can be submitted' });
      }
      const updatedReport = { ...existingReport, status: 'submitted', submittedAt: new Date(), updatedAt: new Date() };
      mockDb.reports[reportIndex] = updatedReport;
      mockDb.save();
      return { success: true, data: updatedReport };
    }),
    review: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'staff') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const reportIndex = mockDb.reports.findIndex(r => r.id === input.id && r.companyId === user.companyId);
      if (reportIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
      }
      const existingReport = mockDb.reports[reportIndex];
      if (existingReport.status === 'draft') {
        throw new TRPCError({ code: 'CONFLICT', message: 'Cannot review draft reports' });
      }
      const updatedReport = {
        ...existingReport,
        status: input.status,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNotes: input.notes || null,
        updatedAt: new Date(),
      };
      mockDb.reports[reportIndex] = updatedReport;
      mockDb.save();
      return { success: true, data: updatedReport };
    }),
    delete: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const initialLength = mockDb.reports.length;
      mockDb.reports = mockDb.reports.filter(r => !(r.id === input.id && r.companyId === user.companyId));
      if (mockDb.reports.length === initialLength) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
      }
      mockDb.save();
      return { success: true };
    }),
    stats: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const reports = mockDb.reports.filter(r => r.companyId === user.companyId);
      const submitted = reports.filter(r => r.status === 'submitted').length;
      const reviewed = reports.filter(r => r.status === 'reviewed').length;
      const approved = reports.filter(r => r.status === 'approved').length;
      const draft = reports.filter(r => r.status === 'draft').length;
      return { total: reports.length, submitted, reviewed, approved, draft };
    }),
  },
  locations: {
    list: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      return mockDb.locations.filter(l => l.companyId === user.companyId);
    }),
    get: mockTrpc.procedure.query(({ input }) => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const location = mockDb.locations.find(l => l.id === input.id && l.companyId === user.companyId);
      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }
      return location;
    }),
    create: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || user.role !== 'company_admin' && user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      if (!user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const now = new Date();
      const newLocation = {
        id: mockDb.locations.length + 1,
        companyId: user.companyId,
        name: input.name,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        country: input.country || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        timezone: input.timezone || 'UTC',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      mockDb.locations.push(newLocation);
      mockDb.save();
      return { success: true, data: newLocation };
    }),
    update: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || user.role !== 'company_admin' && user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      if (!user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const locationIndex = mockDb.locations.findIndex(l => l.id === input.id && l.companyId === user.companyId);
      if (locationIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }
      const updatedLocation = { ...mockDb.locations[locationIndex], ...input, updatedAt: new Date() };
      mockDb.locations[locationIndex] = updatedLocation;
      mockDb.save();
      return { success: true, data: updatedLocation };
    }),
    delete: mockTrpc.procedure.mutation(({ ctx, input }) => {
      const user = getMockCurrentUser();
      if (!user || user.role !== 'company_admin' && user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      if (!user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const initialLength = mockDb.locations.length;
      mockDb.locations = mockDb.locations.filter(l => !(l.id === input.id && l.companyId === user.companyId));
      if (mockDb.locations.length === initialLength) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }
      mockDb.save();
      return { success: true };
    }),
  },
  dashboard: {
    overview: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'staff') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const company = mockDb.companies.find(c => c.id === user.companyId);
      const subscription = mockDb.subscriptions.find(s => s.companyId === user.companyId);
      const staff = mockDb.users.filter(u => u.companyId === user.companyId && (u.role === 'staff' || u.role === 'company_admin'));
      const attendanceLogs = mockDb.attendance.filter(a => a.companyId === user.companyId);
      const reports = mockDb.reports.filter(r => r.companyId === user.companyId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAttendance = attendanceLogs.filter(log => {
        const logDate = new Date(log.clockInTime);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });
      const pendingReports = reports.filter(r => r.status === 'submitted');

      return {
        company: {
          id: company?.id || 0,
          name: company?.name || 'N/A',
          email: company?.email || 'N/A',
          plan: company?.plan || 'free',
          subscriptionStatus: company?.subscriptionStatus || 'inactive',
        },
        stats: {
          totalStaff: staff.length,
          activeStaff: staff.filter(s => s.status === 'active').length,
          todayCheckIns: todayAttendance.length,
          pendingReports: pendingReports.length,
        },
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          renewalDate: subscription.renewalDate,
        } : null,
        recentReports: reports.slice(0, 5),
        recentAttendance: todayAttendance.slice(0, 10),
      };
    }),
    staffPerformance: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'staff') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const staff = mockDb.users.filter(u => u.companyId === user.companyId && u.role === 'staff');
      const attendance = mockDb.attendance.filter(a => a.companyId === user.companyId);

      const performance = staff.map(s => {
        const staffAttendance = attendance.filter(a => a.userId === s.id);
        const completedDays = staffAttendance.filter(a => a.clockOutTime).length;
        const totalHours = staffAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
        const avgHours = completedDays > 0 ? (totalHours / completedDays) : 0;

        return {
          id: s.id,
          name: s.name,
          email: s.email,
          totalDaysWorked: completedDays,
          totalHours: totalHours.toFixed(2),
          averageHoursPerDay: avgHours.toFixed(2),
          status: s.status,
        };
      });
      return performance;
    }),
    attendanceAnalytics: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'staff') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const attendance = mockDb.attendance.filter(a => a.companyId === user.companyId);
      const byDate: Record<string, any> = {};
      attendance.forEach(record => {
        const date = new Date(record.clockInTime).toISOString().split('T')[0];
        if (!byDate[date]) {
          byDate[date] = { checkIns: 0, avgHours: 0, totalHours: 0, count: 0 };
        }
        byDate[date].checkIns++;
        if (record.totalHours) {
          byDate[date].totalHours += record.totalHours;
          byDate[date].count++;
        }
      });
      const analytics = Object.entries(byDate).map(([date, data]) => ({
        date,
        checkIns: data.checkIns,
        averageHours: data.count > 0 ? (data.totalHours / data.count).toFixed(2) : 0,
        totalHours: data.totalHours.toFixed(2),
      }));
      return analytics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }),
    reportsSummary: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      if (user.role === 'staff') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const reports = mockDb.reports.filter(r => r.companyId === user.companyId);
      const staff = mockDb.users.filter(u => u.companyId === user.companyId && u.role === 'staff');

      const byUser: Record<number, any> = {};
      staff.forEach(s => {
        byUser[s.id] = {
          name: s.name,
          email: s.email,
          submitted: 0,
          reviewed: 0,
          approved: 0,
          draft: 0,
        };
      });

      reports.forEach(report => {
        if (byUser[report.userId]) {
          byUser[report.userId][report.status]++;
        }
      });

      const summary = Object.values(byUser).map((user: any) => ({
        ...user,
        total: user.submitted + user.reviewed + user.approved + user.draft,
        submissionRate: user.total > 0 ? ((user.submitted + user.reviewed + user.approved) / user.total * 100).toFixed(1) : 0,
      }));

      return {
        totalReports: reports.length,
        submitted: reports.filter(r => r.status === 'submitted').length,
        reviewed: reports.filter(r => r.status === 'reviewed').length,
        approved: reports.filter(r => r.status === 'approved').length,
        draft: reports.filter(r => r.status === 'draft').length,
        byStaff: summary,
      };
    }),
    staffSummary: mockTrpc.procedure.query(() => {
      const user = getMockCurrentUser();
      if (!user || !user.companyId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Company context required' });
      }
      const today = new Date();
      const todayAttendance = mockDb.attendance.find(a =>
        a.userId === user.id &&
        a.companyId === user.companyId &&
        new Date(a.clockInTime).toDateString() === today.toDateString()
      );

      const recentAttendance = mockDb.attendance
        .filter(a => a.userId === user.id && a.companyId === user.companyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 7);

      const myReports = mockDb.reports
        .filter(r => r.userId === user.id && r.companyId === user.companyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      const totalHoursThisWeek = recentAttendance
        .filter(a => a.totalHours)
        .reduce((sum, a) => sum + (a.totalHours || 0), 0);

      const daysWorkedThisWeek = recentAttendance.filter(a => a.clockOutTime).length;

      return {
        todayStatus: todayAttendance ? {
          clockedIn: !todayAttendance.clockOutTime,
          clockInTime: todayAttendance.clockInTime,
          clockOutTime: todayAttendance.clockOutTime,
          totalHours: todayAttendance.totalHours,
        } : {
          clockedIn: false,
          clockInTime: null,
          clockOutTime: null,
          totalHours: null,
        },
        weekStats: {
          daysWorked: daysWorkedThisWeek,
          totalHours: totalHoursThisWeek.toFixed(2),
          averageHours: daysWorkedThisWeek > 0 ? (totalHoursThisWeek / daysWorkedThisWeek).toFixed(2) : 0,
        },
        recentAttendance: recentAttendance.slice(0, 5),
        recentReports: myReports.slice(0, 5),
        pendingReports: myReports.filter(r => r.status === 'draft').length,
      };
    }),
  },
};
