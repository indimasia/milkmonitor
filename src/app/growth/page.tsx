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
import { LineChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart as ChartIcon, Baby, Weight, Ruler } from "lucide-react";

const formSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid date is required",
  }),
  weight: z.coerce.number().min(0.1, "Weight must be greater than 0").positive(),
  height: z.coerce.number().min(1, "Height must be greater than 0").positive(),
  headCircumference: z.coerce.number().min(1, "Head circumference must be greater than 0").positive(),
});

export default function GrowthPage() {
  const { growthRecords, addGrowthRecord } = useContext(AppContext);
  const { toast } = useToast();

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
      head: { label: "Head (cm)", color: "hsl(var(--chart-3))" },
  };

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
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} axisLine={false} tickMargin={8}/>
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <defs>
                                        <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-weight)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-weight)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="weight" stroke="var(--color-weight)" fill="url(#fillWeight)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        </div>
                         <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2"><Ruler className="h-4 w-4 text-chart-2"/>Height (cm)</h3>
                            <ChartContainer config={chartConfig} className="h-60 w-full">
                                <ResponsiveContainer>
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8}/>
                                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false} tickMargin={8}/>
                                    <Tooltip content={<ChartTooltipContent />} />
                                     <defs>
                                        <linearGradient id="fillHeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-height)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-height)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="height" stroke="var(--color-height)" fill="url(#fillHeight)" strokeWidth={2} />
                                </LineChart>
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
        </div>
      </div>
    </div>
  );
}
