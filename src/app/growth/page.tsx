"use client";

import { useState, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AppContext } from "@/context/app-context";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart as ChartIcon, Baby, Weight, Ruler, Trash2, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import type { GrowthRecord } from "@/lib/types";


const formSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid date is required",
  }),
  weight: z.coerce.number().min(0.1, "Weight must be greater than 0").positive(),
  height: z.coerce.number().min(1, "Height must be greater than 0").positive(),
  headCircumference: z.coerce.number().min(1, "Head circumference must be greater than 0").positive(),
});

function EditGrowthRecordForm({ record, onFinished }: { record: GrowthRecord, onFinished: () => void }) {
  const { updateGrowthRecord } = useContext(AppContext);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(record.date), "yyyy-MM-dd"),
      weight: record.weight,
      height: record.height,
      headCircumference: record.headCircumference,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateGrowthRecord(record.id, values);
    toast({
      title: "Growth Record Updated!",
      description: "The record has been successfully updated.",
    });
    onFinished();
  }

  return (
     <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Weight className="h-4 w-4"/> Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Ruler className="h-4 w-4"/> Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          <FormField
            control={form.control}
            name="headCircumference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Baby className="h-4 w-4"/> Head (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
  )
}

export default function GrowthPage() {
  const { growthRecords, addGrowthRecord, deleteGrowthRecord } = useContext(AppContext);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GrowthRecord | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      weight: 5,
      height: 58,
      headCircumference: 37,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addGrowthRecord(values);
    toast({
      title: "Growth Record Saved!",
      description: `Logged new measurements for ${format(new Date(values.date), "MMMM d, yyyy")}.`,
    });
    form.reset({
      date: format(new Date(), "yyyy-MM-dd"),
      weight: values.weight,
      height: values.height,
      headCircumference: values.headCircumference
    });
  }
  
  const handleDelete = (record: GrowthRecord) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      deleteGrowthRecord(selectedRecord.id);
      toast({
        title: "Growth Record Deleted",
        description: "The growth record has been removed.",
        variant: "destructive",
      });
      setSelectedRecord(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const chartData = useMemo(() => {
    return growthRecords
      .map(record => ({
        ...record,
        date: new Date(record.date),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(record => ({
        ...record,
        name: format(record.date, "MMM d"),
      }));
  }, [growthRecords]);

  const chartConfig = {
      weight: { label: "Weight (kg)", color: "hsl(var(--chart-1))" },
      height: { label: "Height (cm)", color: "hsl(var(--chart-2))" },
      headCircumference: { label: "Head (cm)", color: "hsl(var(--chart-3))" },
  };

  const sortedGrowthRecords = useMemo(() => {
    return [...growthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [growthRecords]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
       <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-headline">
          Growth Tracker
        </h1>
        <p className="text-muted-foreground">
          Monitor your baby's growth and development milestones.
        </p>
      </header>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Log New Measurements</CardTitle>
              <CardDescription>
                Enter your baby's latest growth data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Weight className="h-4 w-4"/> Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Ruler className="h-4 w-4"/> Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  <FormField
                    control={form.control}
                    name="headCircumference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Baby className="h-4 w-4"/> Head (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <ChartIcon className="mr-2 h-4 w-4" /> Save Measurements
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Growth Charts</CardTitle>
                    <CardDescription>Visualizing your baby's growth over time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {chartData.length > 1 ? (
                        <>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2"><Weight className="h-4 w-4 text-chart-1"/>Weight (kg)</h3>
                          <ChartContainer config={chartConfig} className="h-60 w-full">
                              <ResponsiveContainer>
                                  <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} axisLine={false} tickMargin={8}/>
                                      <ChartTooltip content={<ChartTooltipContent />} />
                                      <defs>
                                          <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="var(--color-weight)" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="var(--color-weight)" stopOpacity={0.1}/>
                                          </linearGradient>
                                      </defs>
                                      <Area type="monotone" dataKey="weight" stroke="hsl(var(--chart-1))" fill="url(#fillWeight)" strokeWidth={2} />
                                  </AreaChart>
                              </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                         <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2"><Ruler className="h-4 w-4 text-chart-2"/>Height (cm)</h3>
                            <ChartContainer config={chartConfig} className="h-60 w-full">
                                <ResponsiveContainer>
                                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8}/>
                                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false} tickMargin={8}/>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                     <defs>
                                        <linearGradient id="fillHeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-height)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-height)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="height" stroke="hsl(var(--chart-2))" fill="url(#fillHeight)" strokeWidth={2} />
                                </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2"><Baby className="h-4 w-4 text-chart-3"/>Head (cm)</h3>
                            <ChartContainer config={chartConfig} className="h-60 w-full">
                                <ResponsiveContainer>
                                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8}/>
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} axisLine={false} tickMargin={8}/>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                     <defs>
                                        <linearGradient id="fillHead" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-headCircumference)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-headCircumference)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="headCircumference" stroke="hsl(var(--chart-3))" fill="url(#fillHead)" strokeWidth={2} />
                                </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                        </>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center h-64 text-muted-foreground">
                            <ChartIcon className="h-12 w-12 mb-4" />
                            <p>Log at least two measurements to see a growth chart.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Measurement History</CardTitle>
                    <CardDescription>A complete log of all growth records.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Weight (kg)</TableHead>
                                <TableHead>Height (cm)</TableHead>
                                <TableHead>Head (cm)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedGrowthRecords.length > 0 ? (
                                sortedGrowthRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                                    <TableCell>{record.weight}</TableCell>
                                    <TableCell>{record.height}</TableCell>
                                    <TableCell>{record.headCircumference}</TableCell>
                                    <TableCell className="text-right">
                                     <Dialog open={isEditDialogOpen && selectedRecord?.id === record.id} onOpenChange={(isOpen) => {
                                        if (!isOpen) setSelectedRecord(null);
                                        setIsEditDialogOpen(isOpen);
                                      }}>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="icon" onClick={() => setSelectedRecord(record)}>
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Edit Growth Record</DialogTitle>
                                          </DialogHeader>
                                          {selectedRecord && <EditGrowthRecordForm record={selectedRecord} onFinished={() => setIsEditDialogOpen(false)} />}
                                        </DialogContent>
                                      </Dialog>
                                      <Button variant="ghost" size="icon" onClick={() => handleDelete(record)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No growth records logged yet.
                                </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the growth record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
