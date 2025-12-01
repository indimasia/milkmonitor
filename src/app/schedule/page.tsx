"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppContext } from "@/context/app-context";
import { suggestOptimalFeedingSchedule } from "@/ai/flows/suggest-optimal-feeding-schedule";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { FeedingSchedule } from "@/lib/types";

const formSchema = z.object({
  babyAgeMonths: z.coerce.number().min(0, "Age must be 0 or greater").max(24),
  babyWeightKg: z.coerce.number().min(0.1, "Weight must be positive"),
  feedingHistory: z.string().min(10, "Please provide some feeding history."),
  weatherCondition: z.string().optional(),
  newsEvents: z.string().optional(),
});

export default function SchedulePage() {
  const { feedings, setSchedule } = useContext(AppContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] =
    useState<FeedingSchedule | null>(null);

  const feedingHistorySummary = feedings
    .slice(0, 5)
    .map(
      (f) =>
        `${format(new Date(f.dateTime), "MMM d, h:mm a")}: ${f.amount}ml of ${
          f.type
        }`
    )
    .join("\n");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      babyAgeMonths: 3,
      babyWeightKg: 5.5,
      feedingHistory:
        feedingHistorySummary || "Example: Yesterday 9am: 120ml Formula, 12pm: 110ml EBM...",
      weatherCondition: "Mild and sunny",
      newsEvents: "None",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedSchedule(null);
    try {
      const result = await suggestOptimalFeedingSchedule(values);
      setGeneratedSchedule(result);
      setSchedule(result);
      toast({
        title: "Schedule Generated!",
        description: "Your new AI-powered feeding schedule is ready.",
      });
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description:
          "There was a problem generating the schedule. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-headline">
          Smart Schedule Tool
        </h1>
        <p className="text-muted-foreground">
          Let AI help you create an optimal feeding schedule for your baby.
        </p>
      </header>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Baby's Information</CardTitle>
              <CardDescription>
                Provide details for a personalized schedule.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="babyAgeMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Months)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="babyWeightKg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
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
                    name="feedingHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feeding History</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder="Recent feeding times, amounts, and types..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <BrainCircuit className="mr-2 h-4 w-4" />
                    )}
                    Generate Schedule
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle>Suggested Feeding Schedule</CardTitle>
              <CardDescription>
                A plan tailored just for your little one.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {isLoading ? (
                <div className="text-center text-muted-foreground">
                  <BrainCircuit className="h-12 w-12 mx-auto animate-pulse" />
                  <p className="mt-4">
                    Our AI pediatrician is crafting the perfect plan...
                  </p>
                </div>
              ) : generatedSchedule ? (
                <div className="w-full p-4 rounded-md bg-background border whitespace-pre-wrap font-mono text-sm">
                  {generatedSchedule.suggestedSchedule}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Your generated schedule will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
