import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Star,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  Scissors,
  ShoppingBag
} from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { useCustomers } from "@/contexts/CustomersContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useTally } from "@/contexts/TallyContext";
import { useStaff } from "@/contexts/StaffContext";
import { mockServices } from "@/data/mockData";
import StatsCard from "@/components/StatsCard";
import { DownloadDataTab } from "@/components/DownloadDataTab";

export default function Dashboard() {
  const { customers } = useCustomers();
  const { appointments } = useAppointments();
  const { tallyItems } = useTally();
  const { employees, availableStaffCount } = useStaff();
  
  // Get today's date in the same format as stored appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Filter today's appointments
  const todaysAppointments = appointments.filter(apt => apt.date === today);
  
  // Filter today's transactions
  const todaysTransactions = tallyItems.filter(item => 
    isToday(parseISO(item.date))
  );
  
  // Calculate stats
  const stats = useMemo(() => {
    const completedToday = todaysAppointments.filter(apt => apt.status === 'completed').length;
    const totalRevenue = todaysTransactions
      .filter(item => item.paymentStatus === 'completed')
      .reduce((sum, item) => sum + item.totalCost, 0);
    
    const totalCustomers = customers.length;
    const loyalCustomers = customers.filter(c => c.visitCount >= 10).length;
    
    return {
      todayAppointments: todaysAppointments.length,
      completedAppointments: completedToday,
      todayRevenue: totalRevenue,
      totalCustomers,
      loyalCustomers,
      availableStaff: availableStaffCount,
      pendingPayments: todaysTransactions.filter(item => item.paymentStatus === 'pending').length
    };
  }, [todaysAppointments, todaysTransactions, customers, availableStaffCount]);

  // Format price with Indian Rupee symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format phone number
  const formatPhoneNumber = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{5})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
  };

  // Get recent customers (last 5)
  const recentCustomers = customers
    .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
    .slice(0, 5);

  // Get upcoming appointments (next 5)
  const upcomingAppointments = todaysAppointments
    .filter(apt => apt.status === 'scheduled')
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 lg:mt-2 text-sm lg:text-base">
            Welcome back! Here's what's happening at your salon today.
          </p>
        </div>
        <div className="text-xs lg:text-sm text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatsCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          description={`${stats.completedAppointments} completed`}
          icon={<Calendar className="h-4 w-4" />}
          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        />
        
        <StatsCard
          title="Today's Revenue"
          value={formatPrice(stats.todayRevenue)}
          description={`${todaysTransactions.length} transactions`}
          icon={<DollarSign className="h-4 w-4" />}
          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        />
        
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          description={`${stats.loyalCustomers} loyal customers`}
          icon={<Users className="h-4 w-4" />}
          className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        />
        
        <StatsCard
          title="Available Staff"
          value={stats.availableStaff}
          description={`${employees.length} total staff`}
          icon={<UserCheck className="h-4 w-4" />}
          className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs lg:text-sm">Appointments</TabsTrigger>
          <TabsTrigger value="customers" className="text-xs lg:text-sm">Customers</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs lg:text-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Today's Schedule */}
            <Card className="bg-gradient-card border-border/50 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg flex items-center">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-primary" />
                  Today's Schedule
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  Upcoming appointments for today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => {
                    const customer = customers.find(c => c.id === appointment.customerId);
                    const employee = employees.find(e => e.id === appointment.employeeId);
                    const service = mockServices.find(s => appointment.serviceIds.includes(s.id));
                    
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-xs lg:text-sm font-medium text-primary">
                            {appointment.time}
                          </div>
                          <div>
                            <div className="font-medium text-sm lg:text-base">{customer?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {service?.name} • {employee?.name}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {appointment.status}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card className="bg-gradient-card border-border/50 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg flex items-center">
                  <Users className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-primary" />
                  Recent Customers
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  Latest customer activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                        <AvatarImage src={customer.photo} alt={customer.name} />
                        <AvatarFallback className="text-xs">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm lg:text-base">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer.visitCount} visits • {formatPrice(customer.totalSpent)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(customer.lastVisit), 'MMM d')}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 text-xs lg:text-sm">
                  <Calendar className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span>New Appointment</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 text-xs lg:text-sm">
                  <Users className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span>Add Customer</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 text-xs lg:text-sm">
                  <Scissors className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span>Manage Services</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 text-xs lg:text-sm">
                  <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span>View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Appointment Status Cards */}
            <Card className="bg-gradient-card border-border/50 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg flex items-center">
                  <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-green-600">
                  {stats.completedAppointments}
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground">appointments today</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg flex items-center">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-blue-500" />
                  Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                  {todaysAppointments.filter(apt => apt.status === 'scheduled').length}
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground">upcoming today</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg flex items-center">
                  <XCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-red-500" />
                  Cancelled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-red-600">
                  {todaysAppointments.filter(apt => apt.status === 'cancelled').length}
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground">cancelled today</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Appointments List */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg">Today's Appointments</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                All appointments scheduled for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map((appointment) => {
                    const customer = customers.find(c => c.id === appointment.customerId);
                    const employee = employees.find(e => e.id === appointment.employeeId);
                    const service = mockServices.find(s => appointment.serviceIds.includes(s.id));
                    
                    return (
                      <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 bg-accent/30 rounded-lg space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm lg:text-base font-medium text-primary min-w-[60px]">
                            {appointment.time}
                          </div>
                          <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                            <AvatarImage src={customer?.photo} alt={customer?.name} />
                            <AvatarFallback className="text-xs">
                              {customer?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm lg:text-base">{customer?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {service?.name} • {employee?.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-sm lg:text-base font-medium">
                            {formatPrice(appointment.total)}
                          </div>
                          <Badge 
                            variant={
                              appointment.status === 'completed' ? 'default' :
                              appointment.status === 'cancelled' ? 'destructive' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm lg:text-base">No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            <StatsCard
              title="Total Customers"
              value={customers.length}
              icon={<Users className="h-4 w-4" />}
              className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            />
            <StatsCard
              title="Loyal Customers"
              value={customers.filter(c => c.visitCount >= 10).length}
              description="10+ visits"
              icon={<Star className="h-4 w-4" />}
              className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
            />
            <StatsCard
              title="New This Month"
              value={customers.filter(c => {
                const customerDate = new Date(c.lastVisit);
                const thisMonth = new Date();
                return customerDate.getMonth() === thisMonth.getMonth() && 
                       customerDate.getFullYear() === thisMonth.getFullYear();
              }).length}
              icon={<TrendingUp className="h-4 w-4" />}
              className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            />
            <StatsCard
              title="Avg. Lifetime Value"
              value={customers.length > 0 
                ? formatPrice(customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length)
                : formatPrice(0)}
              icon={<DollarSign className="h-4 w-4" />}
              className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
            />
          </div>

          {/* Top Customers */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg">Top Customers</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Customers by total spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customers
                  .sort((a, b) => b.totalSpent - a.totalSpent)
                  .slice(0, 5)
                  .map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs lg:text-sm font-bold">
                          {index + 1}
                        </div>
                        <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                          <AvatarImage src={customer.photo} alt={customer.name} />
                          <AvatarFallback className="text-xs">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm lg:text-base">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.visitCount} visits
                          </div>
                        </div>
                      </div>
                      <div className="text-sm lg:text-base font-bold text-primary">
                        {formatPrice(customer.totalSpent)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 lg:space-y-6">
          <DownloadDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}