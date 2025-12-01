"use client";

import { useContext } from "react";
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
  CalendarClock,
  ArrowRight,
  Milk,
  Ruler,
  Weight,
} from "lucide-react";
import { format } from "date-fns";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Dashboard() {
  const { feedings, growthRecords, schedule } = useContext(AppContext);

  const lastFeeding = feedings.length > 0 ? feedings[0] : null;
  const lastGrowthRecord =
    growthRecords.length > 0 ? growthRecords[0] : null;
  
  const welcomeImage = PlaceHolderImages.find(p => p.id === 'dashboard-welcome');

  const getNextFeedingTime = () => {
    if (!schedule) return null;

    // This is a simple parsing logic, assuming schedule is a list of times.
    // A more robust implementation would parse the schedule more carefully.
    const scheduleLines = schedule.suggestedSchedule.split('\n');
    const now = new Date();

    for (const line of scheduleLines) {
        const match = line.match(/(\d{1,2}:\d{2}\s?[AP]M)/i);
        if (match) {
            const timeStr = match[1];
            const [hourMinute, period] = timeStr.split(' ');
            let [hour, minute] = hourMinute.split(':').map(Number);

            if (period && period.toLowerCase() === 'pm' && hour < 12) {
                hour += 12;
            }
            if (period && period.toLowerCase() === 'am' && hour === 12) {
                hour = 0;
            }

            const feedingTime = new Date(now);
            feedingTime.setHours(hour, minute, 0, 0);

            if (feedingTime > now) {
                return feedingTime;
            }
        }
    }
    // If all feeding times are past, return the first one for the next day.
     const firstLine = scheduleLines.find(line => line.match(/(\d{1,2}:\d{2}\s?[AP]M)/i));
     if(firstLine){
        const match = firstLine.match(/(\d{1,2}:\d{2}\s?[AP]M)/i);
        if (match) {
          const timeStr = match[1];
          const [hourMinute, period] = timeStr.split(' ');
          let [hour, minute] = hourMinute.split(':').map(Number);

          if (period && period.toLowerCase() === 'pm' && hour < 12) {
              hour += 12;
          }
          if (period && period.toLowerCase() === 'am' && hour === 12) {
              hour = 0;
          }
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(hour, minute, 0, 0);
          return tomorrow;
        }
     }


    return null;
  };

  const nextFeedingTime = getNextFeedingTime();

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
        <Card className="flex flex-col bg-accent/50 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CalendarClock />
              Next Feeding
            </CardTitle>
            <CardDescription>
              Based on your AI-generated schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center gap-4 text-center">
            {nextFeedingTime ? (
              <>
                <p className="text-4xl font-bold text-primary">
                  {format(nextFeedingTime, "h:mm a")}
                </p>
                <p className="text-muted-foreground">
                  {format(nextFeedingTime, "EEEE, MMMM d")}
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">No schedule found.</p>
                <Link href="/schedule">
                  <Button variant="outline">
                    Generate Schedule <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
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

        <Card className="flex flex-col">
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
      </div>

       {(feedings.length === 0 || growthRecords.length === 0) && welcomeImage && (
         <Card className="overflow-hidden">
             <div className="relative w-full h-64">
                <Image
                    src={welcomeImage.imageUrl}
                    alt={welcomeImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={welcomeImage.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <h2 className="text-2xl font-bold text-white font-headline">Get Started with MilkMonitor</h2>
                    <p className="text-white/80 mt-2 max-w-lg">
                        Start by logging your baby's first feeding or growth measurement to see the magic happen.
                    </p>
                </div>
             </div>
         </Card>
       )}
    </div>
  );
}
