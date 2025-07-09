import { format, isSameDay, parseISO } from 'date-fns';
import { Download, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useTally } from '@/contexts/TallyContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function TallyPage() {
  const { tallyItems } = useTally();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Filter tally items by selected date
  const filteredTallyItems = selectedDate 
    ? tallyItems.filter(item => isSameDay(parseISO(item.date), selectedDate))
    : tallyItems;
    
  // Get unique dates for the calendar
  const availableDates = Array.from(new Set(
    tallyItems.map(item => item.date.split('T')[0])
  )).map(date => new Date(date));

  const handleExport = () => {
    // Convert data to CSV
    const headers = [
      'Sr. No',
      'Date',
      'Time',
      'Customer Name',
      'Staff Name',
      'Services',
      'Amount',
      'Payment Method',
      'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...tallyItems.map((item, index) => (
        [
          index + 1,
          format(new Date(item.date), 'dd/MM/yyyy'),
          item.time,
          `"${item.customerName}"`,
          `"${item.staffName}"`,
          `"${item.services.map(s => `${s.name} (${s.price})`).join(', ')}"`,
          item.totalCost,
          item.paymentMethod.toUpperCase(),
          item.paymentStatus.toUpperCase()
        ].join(',')
      ))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tally_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Tally Records</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            View and manage payment records
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                size="sm"
                className={cn(
                  "w-full lg:w-[240px] justify-start text-left font-normal text-sm",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date > new Date()}
                modifiers={{
                  hasRecords: availableDates.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()))
                }}
                modifiersStyles={{
                  hasRecords: {
                    border: '2px solid #22c55e',
                    borderRadius: '50%'
                  }
                }}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
          <Button 
            onClick={handleExport} 
            size="sm"
            className="gap-2 w-full lg:w-auto text-sm"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableCaption className="text-xs lg:text-sm">A list of all payment records.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs lg:text-sm">Sr. No</TableHead>
              <TableHead className="text-xs lg:text-sm">Date</TableHead>
              <TableHead className="text-xs lg:text-sm hidden sm:table-cell">Time</TableHead>
              <TableHead className="text-xs lg:text-sm">Customer</TableHead>
              <TableHead className="text-xs lg:text-sm hidden md:table-cell">Staff</TableHead>
              <TableHead className="text-xs lg:text-sm hidden lg:table-cell">Services</TableHead>
              <TableHead className="text-xs lg:text-sm hidden sm:table-cell">Payment Method</TableHead>
              <TableHead className="text-xs lg:text-sm">Status</TableHead>
              <TableHead className="text-right text-xs lg:text-sm">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTallyItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 lg:py-8 text-muted-foreground text-sm">
                  {selectedDate 
                    ? `No records found for ${format(selectedDate, 'MMMM d, yyyy')}`
                    : 'No records found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTallyItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs lg:text-sm">{index + 1}</TableCell>
                  <TableCell className="text-xs lg:text-sm">{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-xs lg:text-sm hidden sm:table-cell">{item.time}</TableCell>
                  <TableCell className="text-xs lg:text-sm">
                    <div className="min-w-0">
                      <div className="truncate">{item.customerName}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{item.time}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs lg:text-sm hidden md:table-cell">{item.staffName}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-col gap-1">
                      {item.services.map((service, i) => (
                        <div key={i} className="text-xs">
                          {service.name} - ₹{service.price}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs lg:text-sm hidden sm:table-cell">
                    <span className="capitalize">{item.paymentMethod}</span>
                  </TableCell>
                  <TableCell>
                    {item.paymentStatus === 'completed' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                        <CheckCircle2 className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
                        <span className="hidden sm:inline">Paid</span>
                        <span className="sm:hidden">✓</span>
                      </Badge>
                    ) : item.paymentStatus === 'failed' ? (
                      <Badge variant="destructive" className="text-xs">
                        <XCircle className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
                        <span className="hidden sm:inline">Failed</span>
                        <span className="sm:hidden">✗</span>
                      </Badge>
                    ) : item.paymentStatus === 'cancelled' ? (
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-xs">
                        <XCircle className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
                        <span className="hidden sm:inline">Cancelled</span>
                        <span className="sm:hidden">C</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
                        <span className="hidden sm:inline">Pending</span>
                        <span className="sm:hidden">P</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs lg:text-sm">
                    ₹{item.totalCost.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Summary Section */}
        {filteredTallyItems.length > 0 && (
          <div className="border-t bg-muted/30">
            <div className="flex flex-col items-end px-3 lg:px-6 py-2 lg:py-3 space-y-1 lg:space-y-2">
              {/* Subtotal (Completed + Cancelled) */}
              <div className="flex items-center justify-between w-full sm:w-64">
                <span className="font-medium text-xs lg:text-sm">Subtotal (Paid + Cancelled):</span>
                <span className="font-medium text-xs lg:text-sm">
                  ₹{filteredTallyItems
                    .filter(item => ['completed', 'cancelled'].includes(item.paymentStatus))
                    .reduce((sum, item) => sum + item.totalCost, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
              
              {/* Cancelled Amount */}
              <div className="flex items-center justify-between w-full sm:w-64">
                <span className="font-medium text-amber-700 text-xs lg:text-sm">Cancelled Amount:</span>
                <span className="font-medium text-amber-700 text-xs lg:text-sm">
                  ₹{filteredTallyItems
                    .filter(item => item.paymentStatus === 'cancelled')
                    .reduce((sum, item) => sum + item.totalCost, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
              
              {/* Total Earning (Subtotal - Cancelled) */}
              <div className="flex items-center justify-between w-full sm:w-64 pt-1 lg:pt-2 border-t">
                <span className="font-semibold text-sm lg:text-base">Total Earning:</span>
                <span className="text-base lg:text-lg font-bold">
                  ₹{filteredTallyItems
                    .filter(item => item.paymentStatus === 'completed')
                    .reduce((sum, item) => sum + item.totalCost, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
