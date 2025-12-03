"use client";

import { useContext, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppContext } from "@/context/app-context";
import {
  Baby,
  LineChart,
  ArrowRight,
  Milk,
  Ruler,
  Weight,
  BarChart2,
} from "lucide-react";
import { format, startOfDay, eachDayOfInterval } from "date-fns";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function Dashboard() {
  const { feedings, growthRecords } = useContext(AppContext);

  const lastFeeding = feedings.length > 0 ? [...feedings].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0] : null;
  const lastGrowthRecord = growthRecords.length > 0 ? [...growthRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  
  const welcomeImage = PlaceHolderImages.find(p => p.id === 'dashboard-welcome');

  const feedingChartData = useMemo(() => {
    if (feedings.length === 0) return [];
    
    const sorted = [...feedings].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    const firstDay = startOfDay(new Date(sorted[0].dateTime));
    const lastDay = startOfDay(new Date(sorted[sorted.length - 1].dateTime));
    const dateRange = eachDayOfInterval({start: firstDay, end: lastDay});

    const dailyTotals = new Map<string, number>();

    dateRange.forEach(date => {
        dailyTotals.set(format(date, 'yyyy-MM-dd'), 0);
    });

    feedings.forEach(feeding => {
        const day = format(startOfDay(new Date(feeding.dateTime)), 'yyyy-MM-dd');
        const currentTotal = dailyTotals.get(day) || 0;
        dailyTotals.set(day, currentTotal + feeding.amount);
    });

    return Array.from(dailyTotals.entries()).map(([date, amount]) => ({
      date: date,
      name: format(new Date(date), "MMM d"),
      amount: amount
    }));
  }, [feedings]);

  const feedingChartConfig = {
      amount: { label: "Total Amount (ml)", color: "hsl(var(--chart-1))" },
  };

  const growthChartData = useMemo(() => {
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

  const growthChartConfig = {
      weight: { label: "Weight (kg)", color: "hsl(var(--chart-2))" },
      height: { label: "Height (cm)", color: "hsl(var(--chart-3))" },
      headCircumference: { label: "Head (cm)", color: "hsl(var(--chart-4))" },
  };


  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-headline">
            Welcome Back!
          </h1>
          <p className="text-muted-foreground">
            Here's a quick look at your baby's day.
          </p>
        </div>
        <Link href="/feedings">
          <Button>
            <Milk className="mr-2 h-4 w-4" /> Log New Feeding
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Milk />
              Last Feeding
            </CardTitle>
            <CardDescription>Your most recently logged feeding.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center gap-4 text-center">
            {lastFeeding ? (
              <>
                <p className="text-3xl font-semibold text-foreground/90">
                  {lastFeeding.amount}ml{" "}
                  <span className="text-lg font-normal text-muted-foreground">
                    ({lastFeeding.type})
                  </span>
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(lastFeeding.dateTime), "h:mm a, MMMM d")}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No feedings logged yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart />
              Latest Growth
            </CardTitle>
            <CardDescription>Latest recorded measurements.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center gap-4">
            {lastGrowthRecord ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Weight className="h-4 w-4" /> Weight
                  </p>
                  <p className="font-medium text-foreground/90">
                    {lastGrowthRecord.weight} kg
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4" /> Height
                  </p>
                  <p className="font-medium text-foreground/90">
                    {lastGrowthRecord.height} cm
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Baby className="h-4 w-4" /> Head
                  </p>
                  <p className="font-medium text-foreground/90">
                    {lastGrowthRecord.headCircumference} cm
                  </p>
                </div>
              </div>
            ) : (
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">No growth data logged.</p>
                    <Link href="/growth">
                        <Button variant="outline" size="sm">Log Growth <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                </div>
            )}
          </CardContent>
        </Card>

        {(feedings.length === 0 || growthRecords.length === 0) && welcomeImage ? (
         <Card className="overflow-hidden md:col-span-2 lg:col-span-1">
             <div className="relative w-full h-full min-h-64">
                <Image
                    src={welcomeImage.imageUrl}
                    alt={welcomeImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={welcomeImage.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <h2 className="text-2xl font-bold text-white font-headline">Get Started</h2>
                    <p className="text-white/80 mt-1">
                        Log a feeding or growth record.
                    </p>
                </div>
             </div>
         </Card>
       ) : (
        <Card className="lg:col-span-3 xl:col-span-1">
           <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Log your baby's first feeding or growth measurement.</CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col gap-4">
              <Link href="/feedings"><Button className="w-full">Log Feeding</Button></Link>
              <Link href="/growth"><Button variant="secondary" className="w-full">Log Growth</Button></Link>
           </CardContent>
        </Card>
       )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Daily Feeding Summary</CardTitle>
                <CardDescription>Total feeding amount (ml) over the last week.</CardDescription>
            </CardHeader>
            <CardContent>
              {feedingChartData.length > 1 ? (
                <ChartContainer config={feedingChartConfig} className="h-60 w-full">
                  <ResponsiveContainer>
                    <AreaChart data={feedingChartData.slice(-7)} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis domain={['dataMin - 50', 'dataMax + 50']} tickLine={false} axisLine={false} tickMargin={8} unit="ml"/>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <defs>
                        <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="amount" stroke="hsl(var(--chart-1))" fill="url(#fillAmount)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground">
                  <BarChart2 className="h-12 w-12 mb-4" />
                  <p>Log feedings for at least two different days to see a chart.</p>
                </div>
              )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Weight Growth (kg)</CardTitle>
                <CardDescription>Baby's weight progress over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {growthChartData.length > 1 ? (
                    <ChartContainer config={growthChartConfig} className="h-60 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={growthChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
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
                                <Area type="monotone" dataKey="weight" stroke="hsl(var(--chart-2))" fill="url(#fillWeight)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground">
                       <LineChart className="h-12 w-12 mb-4" />
                       <p>Log at least two measurements to see a growth chart.</p>
                   </div>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Height Growth (cm)</CardTitle>
                <CardDescription>Baby's height progress over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {growthChartData.length > 1 ? (
                    <ChartContainer config={growthChartConfig} className="h-60 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={growthChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false} tickMargin={8}/>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <defs>
                                    <linearGradient id="fillHeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-height)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--color-height)" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="height" stroke="hsl(var(--chart-3))" fill="url(#fillHeight)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground">
                       <LineChart className="h-12 w-12 mb-4" />
                       <p>Log at least two measurements to see a growth chart.</p>
                   </div>
                )}
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Head Growth (cm)</CardTitle>
                <CardDescription>Baby's head circumference progress.</CardDescription>
            </CardHeader>
            <CardContent>
                {growthChartData.length > 1 ? (
                    <ChartContainer config={growthChartConfig} className="h-60 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={growthChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} axisLine={false} tickMargin={8}/>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <defs>
                                    <linearGradient id="fillHeadCircumference" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-headCircumference)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--color-headCircumference)" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="headCircumference" stroke="hsl(var(--chart-4))" fill="url(#fillHeadCircumference)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground">
                       <LineChart className="h-12 w-12 mb-4" />
                       <p>Log at least two measurements to see a growth chart.</p>
                   </div>
                )}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

    