import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  X,
  Trash2,
  Save,
  XCircle,
  UserPlus,
  Upload,
  Phone,
  Mail,
  Briefcase,
  Clock3,
  Clock4,
  Check
} from "lucide-react";
import { mockCustomers, mockServices as initialMockServices } from "@/data/mockData";
import { useStaff } from "@/contexts/StaffContext";
import { useAppointments } from "@/contexts/AppointmentsContext";

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  description: string;
};

const timeSlots = [
  { display: "9-10 AM", start: "9:00 AM" },
  { display: "10-11 AM", start: "10:00 AM" },
  { display: "11-12 PM", start: "11:00 AM" },
  { display: "12-1 PM", start: "12:00 PM" },
  { display: "1-2 PM", start: "1:00 PM" },
  { display: "2-3 PM", start: "2:00 PM" },
  { display: "3-4 PM", start: "3:00 PM" },
  { display: "4-5 PM", start: "4:00 PM" },
  { display: "5-6 PM", start: "5:00 PM" },
  { display: "6-7 PM", start: "6:00 PM" },
  { display: "7-8 PM", start: "7:00 PM" },
  { display: "8-9 PM", start: "8:00 PM" },
  { display: "9-10 PM", start: "9:00 PM" },
  { display: "10-11 PM", start: "10:00 PM" },
  { display: "11-12 AM", start: "11:00 PM" }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [editStaffMode, setEditStaffMode] = useState(false);
  const [editServicesMode, setEditServicesMode] = useState(false);
  const [services, setServices] = useState<Service[]>(initialMockServices);
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({ 
    name: '', 
    duration: 30, 
    price: 0, 
    category: 'hair', 
    description: '' 
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  
  // Staff form state
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: 'Hair Stylist',
    email: '',
    phone: '',
    startTime: '09:00',
    endTime: '18:00',
    photo: '',
    specialties: [] as string[]
  });
  
  // Use the staff context
  const { employees, removeEmployee, updateEmployee, addEmployee } = useStaff();
  // Use appointments context
  const { appointments } = useAppointments();

  // Get appointments for a specific employee and time slot
  const getAppointmentForSlot = (employeeId: string, timeSlot: string) => {
    return appointments.find(apt => 
      apt.employeeId === employeeId && 
      formatTime(apt.time) === timeSlot &&
      apt.status !== 'cancelled' &&
      apt.date === format(currentDate, 'yyyy-MM-dd')
    );
  };

  // Get appointments for the current date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateStr);
  };

  // Helper to format time consistently
  const formatTime = (time: string) => {
    // Handle both 24-hour and 12-hour formats
    if (time.includes('AM') || time.includes('PM')) {
      return time; // Already in 12-hour format
    }
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Check if a slot is booked for an employee
  const isSlotBooked = (employeeId: string, timeSlot: string) => {
    return appointments.some(apt => 
      apt.employeeId === employeeId && 
      formatTime(apt.time) === timeSlot &&
      apt.status !== 'cancelled' &&
      apt.date === format(currentDate, 'yyyy-MM-dd')
    );
  };

  // Check if a time slot is available for booking
  const isSlotAvailable = (employeeId: string, timeSlot: string) => {
    // Check if staff is available
    const staff = employees.find(e => e.id === employeeId);
    if (!staff?.available) return false; // If staff is marked as busy, all slots are unavailable

    // Check if there's already an appointment at this time
    return !isSlotBooked(employeeId, timeSlot);
  };

  const handleImageClick = (e: React.MouseEvent, src: string, alt: string) => {
    e.stopPropagation();
    // setZoomedImage({ src, alt });
  };

  const handleStaffInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStaffForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff = {
      id: `emp-${Date.now()}`,
      name: staffForm.name,
      role: staffForm.role,
      email: staffForm.email,
      phone: staffForm.phone,
      photo: staffForm.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(staffForm.name)}&background=random`,
      available: true,
      workingHours: {
        start: staffForm.startTime,
        end: staffForm.endTime
      },
      specialties: staffForm.specialties,
      rating: 5,
      nextAvailable: 'Now'
    };

    if (editingStaff) {
      updateEmployee(editingStaff.id, newStaff);
      setEditingStaff(null);
    } else {
      addEmployee(newStaff);
    }
    
    // Reset form
    setStaffForm({
      name: '',
      role: 'Hair Stylist',
      email: '',
      phone: '',
      startTime: '09:00',
      endTime: '18:00',
      photo: '',
      specialties: []
    });
    setShowAddStaff(false);
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name,
      role: staff.role,
      email: staff.email || '',
      phone: staff.phone || '',
      startTime: staff.workingHours?.start || '09:00',
      endTime: staff.workingHours?.end || '18:00',
      photo: staff.photo,
      specialties: staff.specialties || []
    });
    setShowAddStaff(true);
  };

  // Toggle slot availability (now handled by appointments)
  const toggleSlotAvailability = (employeeId: string, timeSlot: string) => {
    // This is now a no-op since availability is managed by appointments
    // The UI will update automatically when appointments change
    console.log(`Toggling slot availability for employee ${employeeId} at ${timeSlot}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Schedule Management</h1>
          <p className="text-muted-foreground mt-1 lg:mt-2 text-sm lg:text-base">
            Manage appointments and staff schedules
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View mode and Add Appointment buttons removed as per request */}
        </div>
      </div>

      {/* Date Navigation */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardContent className="pt-4 lg:pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg lg:text-xl font-bold">{formatDate(currentDate)}</h2>
              <p className="text-xs lg:text-sm text-muted-foreground">
                {viewMode === "week" ? "Week View" : "Day View"}
              </p>
            </div>
            
            <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <div className="grid gap-6">
        {/* Staff Schedule */}
        <Card className="bg-card/50 dark:bg-card border-border/50 shadow-card overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Daily Schedule</span>
            </CardTitle>
            <CardDescription>
              View and manage appointments for each staff member
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[600px] lg:min-w-[800px]">
                {/* Simple Header */}
                <div className="h-12 lg:h-14 border-b border-border/50 bg-muted/30 dark:bg-muted/50 flex items-center px-3 lg:px-4">
                  <span className="font-medium text-foreground text-sm lg:text-base">Staff</span>
                </div>

                {/* Staff Rows - Only show available staff */}
                {employees.filter(employee => employee.available).length > 0 ? (
                  employees
                    .filter(employee => employee.available)
                    .map((employee, index, array) => (
                      <div key={employee.id}>
                        {index > 0 && (
                          <div className="h-0.5 bg-foreground/10 dark:bg-foreground/20 my-1.5"></div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border-b border-border/50 hover:bg-accent/20 transition-colors">
                          {/* Staff Info */}
                          <div className="p-3 lg:p-4 flex items-center space-x-2 lg:space-x-3">
                            <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                              <AvatarImage src={employee.photo} alt={employee.name} />
                              <AvatarFallback>
                                <span className="text-xs lg:text-sm">{employee.name.split(' ').map(n => n[0]).join('')}</span>
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm lg:text-base">{employee.name}</div>
                              <div className="text-xs text-muted-foreground">{employee.role}</div>
                              <Badge 
                                variant={employee.available ? "default" : "secondary"} 
                                className="text-xs mt-1 hidden sm:inline-flex"
                              >
                                {employee.available ? 'Available' : 'Busy'}
                              </Badge>
                            </div>
                          </div>

                          {/* Time Slots */}
                          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-15 min-h-[60px] lg:min-h-[80px]">
                            {timeSlots.map((slot, slotIndex) => {
                              const appointment = getAppointmentForSlot(employee.id, slot.start);
                              const slotKey = `slot-${employee.id}-${slot.start.replace(/[\s:]/g, '')}-${slotIndex}`;
                              
                              return (
                                <div key={slotKey} className="border-l border-border/50 p-0.5 lg:p-1 relative group">
                                  {appointment ? (
                                    <div className={`p-1 lg:p-2 rounded text-xs text-white ${getStatusColor(appointment.status)} h-full flex flex-col justify-between cursor-pointer hover:shadow-soft transition-all`}>
                                      <div>
                                        <div className="font-medium text-xs opacity-90 mb-0.5 lg:mb-1 hidden sm:block">
                                          {slot.display}
                                        </div>
                                        <div className="font-medium truncate text-xs">
                                          {mockCustomers.find(c => c.id === appointment.customerId)?.name}
                                        </div>
                                        <div className="text-xs opacity-90 truncate hidden lg:block">
                                          {services.find(s => appointment.serviceIds.includes(s.id))?.name}
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-end">
                                        <span className="text-xs hidden sm:inline">{formatPrice(appointment.total)}</span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button size="icon" variant="ghost" className="h-3 w-3 lg:h-4 lg:w-4 text-white hover:bg-white/20 hidden lg:flex">
                                            <Edit className="h-2 w-2" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div 
                                      onClick={() => toggleSlotAvailability(employee.id, slot.start)}
                                      className={`h-full w-full rounded cursor-pointer transition-colors flex flex-col items-center justify-center p-0.5 lg:p-1 ${
                                        isSlotAvailable(employee.id, slot.start) 
                                          ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800/50' 
                                          : 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/50'
                                      }`}
                                    >
                                      <div className="flex flex-col items-center justify-center h-full">
                                        <span className={`text-[8px] lg:text-[10px] font-medium mb-0.5 hidden sm:block ${
                                          isSlotAvailable(employee.id, slot.start)
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-red-700 dark:text-red-300'
                                        }`}>
                                          {slot.display}
                                        </span>
                                        <div className="flex items-center">
                                          <span className={`text-[8px] lg:text-[9px] ${
                                            isSlotAvailable(employee.id, slot.start) 
                                              ? 'text-green-600 dark:text-green-400' 
                                              : 'text-red-600 dark:text-red-400'
                                          }`}>
                                            {isSlotAvailable(employee.id, slot.start) ? 'Available' : 'Booked'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-3 lg:p-4 text-center text-muted-foreground text-sm">
                    No available staff members
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Staff and Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Available Staff Card */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-2 lg:pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base lg:text-lg">Available Staff</CardTitle>
                <Button 
                  variant={editStaffMode ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs lg:text-sm"
                  onClick={() => setEditStaffMode(!editStaffMode)}
                >
                  {editStaffMode ? (
                    <Save className="h-4 w-4 mr-1" />
                  ) : (
                    <Edit className="h-4 w-4 mr-1" />
                  )}
                  {editStaffMode ? 'Done' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              {employees.map((employee) => (
                <div 
                  key={employee.id} 
                  className="group flex items-center justify-between p-2 lg:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
                      <AvatarImage src={employee.photo} alt={employee.name} />
                      <AvatarFallback>
                        <span className="text-xs">{employee.name.split(' ').map(n => n[0]).join('')}</span>
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm lg:text-base">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    {editStaffMode ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 lg:h-8 px-1 lg:px-2 text-xs"
                          onClick={() => {
                            updateEmployee(employee.id, {
                              ...employee,
                              available: !employee.available
                            });
                          }}
                        >
                          <div className={`w-8 lg:w-10 h-4 lg:h-5 rounded-full relative transition-colors ${employee.available ? 'bg-primary' : 'bg-muted-foreground/20'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${employee.available ? 'translate-x-5' : ''}`} />
                          </div>
                          <span className="ml-1 lg:ml-2 text-xs lg:text-sm hidden sm:inline">{employee.available ? 'Available' : 'Busy'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 lg:h-8 lg:w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to remove ${employee.name}?`)) {
                              removeEmployee(employee.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 lg:h-8 lg:w-8"
                          onClick={() => handleEditStaff(employee)}
                        >
                          <Edit className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Badge 
                        key={`status-${employee.id}`}
                        variant={employee.available ? "default" : "secondary"}
                      >
                        {employee.available ? 'Available' : 'Busy'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {showAddStaff ? (
                <div className="mt-3 lg:mt-4 p-3 lg:p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-sm lg:text-base">
                      {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 lg:h-8 lg:w-8 p-0"
                      onClick={() => {
                        setShowAddStaff(false);
                        setEditingStaff(null);
                        setStaffForm({
                          name: '',
                          role: 'Hair Stylist',
                          email: '',
                          phone: '',
                          startTime: '09:00',
                          endTime: '18:00',
                          photo: '',
                          specialties: []
                        });
                      }}
                    >
                      <X className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleAddStaff} className="space-y-3 lg:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="staffName" className="text-sm">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="staffName"
                            name="name"
                            value={staffForm.name}
                            onChange={handleStaffInputChange}
                            placeholder="John Doe"
                            className="pl-9 text-sm"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffRole" className="text-sm">Role</Label>
                        <Select 
                          value={staffForm.role}
                          onValueChange={(value) => setStaffForm({...staffForm, role: value})}
                        >
                          <SelectTrigger className="w-full text-sm">
                            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hair Stylist">Hair Stylist</SelectItem>
                            <SelectItem value="Barber">Barber</SelectItem>
                            <SelectItem value="Beautician">Beautician</SelectItem>
                            <SelectItem value="Nail Technician">Nail Technician</SelectItem>
                            <SelectItem value="Massage Therapist">Massage Therapist</SelectItem>
                            <SelectItem value="Receptionist">Receptionist</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="staffEmail" className="text-sm">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="staffEmail"
                            name="email"
                            type="email"
                            value={staffForm.email}
                            onChange={handleStaffInputChange}
                            placeholder="john@example.com"
                            className="pl-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffPhone" className="text-sm">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="staffPhone"
                            name="phone"
                            type="tel"
                            value={staffForm.phone}
                            onChange={handleStaffInputChange}
                            placeholder="+91 98765 43210"
                            className="pl-9 text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime" className="text-sm">Start Time</Label>
                        <div className="relative">
                          <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="startTime"
                            name="startTime"
                            type="time"
                            value={staffForm.startTime}
                            onChange={handleStaffInputChange}
                            className="pl-9 text-sm"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime" className="text-sm">End Time</Label>
                        <div className="relative">
                          <Clock4 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="endTime"
                            name="endTime"
                            type="time"
                            value={staffForm.endTime}
                            onChange={handleStaffInputChange}
                            className="pl-9 text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Specialties</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Haircut', 'Coloring', 'Styling', 'Shaving', 'Facial', 'Manicure', 'Pedicure', 'Massage'].map(specialty => (
                          <Button
                            key={specialty}
                            type="button"
                            variant={staffForm.specialties.includes(specialty) ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 lg:h-8 text-xs"
                            onClick={() => {
                              setStaffForm(prev => ({
                                ...prev,
                                specialties: prev.specialties.includes(specialty)
                                  ? prev.specialties.filter(s => s !== specialty)
                                  : [...prev.specialties, specialty]
                              }));
                            }}
                          >
                            {staffForm.specialties.includes(specialty) && <Check className="h-3 w-3 mr-1" />}
                            {specialty}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Staff Photo</Label>
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 lg:h-20 lg:w-20 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                          {staffForm.photo ? (
                            <img 
                              src={staffForm.photo} 
                              alt="Staff preview" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-2">
                              <User className="h-4 w-4 lg:h-6 lg:w-6 mx-auto text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Preview</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="staffPhoto"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setStaffForm(prev => ({
                                    ...prev,
                                    photo: event.target?.result as string
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs lg:text-sm"
                            className="mt-1"
                            onClick={() => document.getElementById('staffPhoto')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {staffForm.photo ? 'Change Photo' : 'Upload Photo'}
                          </Button>
                          {staffForm.photo && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-xs lg:text-sm"
                              className="mt-1 ml-2 text-destructive hover:text-destructive"
                              onClick={() => setStaffForm(prev => ({ ...prev, photo: '' }))}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        type="button"
                        size="sm"
                        className="text-xs lg:text-sm"
                        onClick={() => {
                          setShowAddStaff(false);
                          setEditingStaff(null);
                          setStaffForm({
                            name: '',
                            role: 'Hair Stylist',
                            email: '',
                            phone: '',
                            startTime: '09:00',
                            endTime: '18:00',
                            photo: '',
                            specialties: []
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" className="text-xs lg:text-sm">
                        {editingStaff ? 'Update Staff' : 'Add Staff'}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 text-xs lg:text-sm"
                  onClick={() => setShowAddStaff(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Services Card */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-2 lg:pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base lg:text-lg">Services</CardTitle>
                <Button 
                  variant={editServicesMode ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs lg:text-sm"
                  onClick={() => setEditServicesMode(!editServicesMode)}
                >
                  {editServicesMode ? (
                    <Save className="h-4 w-4 mr-1" />
                  ) : (
                    <Edit className="h-4 w-4 mr-1" />
                  )}
                  {editServicesMode ? 'Done' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              {editServicesMode && (
                <div className="space-y-3 lg:space-y-4 p-3 lg:p-4 bg-muted/30 rounded-lg mb-3 lg:mb-4">
                  <h4 className="font-medium text-sm lg:text-base">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="serviceName" className="text-sm">Service Name</Label>
                      <Input
                        id="serviceName"
                        className="text-sm"
                        value={editingService?.name || newService.name}
                        onChange={(e) => 
                          editingService
                            ? setEditingService({...editingService, name: e.target.value})
                            : setNewService({...newService, name: e.target.value})
                        }
                        placeholder="e.g., Haircut & Styling"
                      />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      <div>
                        <Label htmlFor="duration" className="text-sm">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          className="text-sm"
                          value={editingService?.duration || newService.duration}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            editingService
                              ? setEditingService({...editingService, duration: value})
                              : setNewService({...newService, duration: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-sm">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          className="text-sm"
                          value={editingService?.price || newService.price}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            editingService
                              ? setEditingService({...editingService, price: value})
                              : setNewService({...newService, price: value});
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                      <Button 
                        size="sm"
                        className="text-xs lg:text-sm"
                        onClick={() => {
                          if (editingService) {
                            setServices(services.map(s => 
                              s.id === editingService.id ? editingService : s
                            ));
                            setEditingService(null);
                          } else {
                            const newServiceObj = {
                              ...newService,
                              id: `svc-${Date.now()}`,
                              description: newService.description || `${newService.name} service`,
                              category: 'hair' // Default category
                            };
                            setServices([...services, newServiceObj]);
                            setNewService({ 
                              name: '', 
                              duration: 30, 
                              price: 0, 
                              category: 'hair', 
                              description: '' 
                            });
                          }
                        }}
                        disabled={!newService.name && !editingService}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {editingService ? 'Update' : 'Add'}
                      </Button>
                      {editingService && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs lg:text-sm"
                          onClick={() => setEditingService(null)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {services.map((service) => (
                  <div 
                    key={service.id} 
                    className="group flex items-center justify-between p-2 lg:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm lg:text-base">
                        {service.name}
                        {editServicesMode && (
                          <span className="ml-2 text-xs text-muted-foreground hidden lg:inline">
                            ID: {service.id.split('-')[1]}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.duration} min • {formatPrice(service.price)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <Badge 
                        key={`category-${service.id}`}
                        variant="outline" 
                        className="capitalize text-xs"
                      >
                        {service.category}
                      </Badge>
                      {editServicesMode && (
                        <div className="flex space-x-0.5 lg:space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 lg:h-8 lg:w-8"
                            onClick={() => setEditingService(service)}
                          >
                            <Edit className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 lg:h-8 lg:w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
                                setServices(services.filter(s => s.id !== service.id));
                                if (editingService?.id === service.id) {
                                  setEditingService(null);
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!editServicesMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 text-xs lg:text-sm"
                  onClick={() => setEditServicesMode(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Service
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}