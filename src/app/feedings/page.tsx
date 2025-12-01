"use client";

import { useState, useContext } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AppContext } from "@/context/app-context";
import { Milk, Trash2, Pencil } from "lucide-react";
import type { FeedingLog } from "@/lib/types";

const formSchema = z.object({
  dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid date and time is required",
  }),
  type: z.enum(["DBF", "EBM", "Formula"]),
  amount: z.coerce
    .number()
    .min(1, "Amount must be greater than 0")
    .positive(),
});

function EditFeedingForm({ feeding, onFinished }: { feeding: FeedingLog, onFinished: () => void }) {
  const { updateFeeding } = useContext(AppContext);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateTime: format(new Date(feeding.dateTime), "yyyy-MM-dd'T'HH:mm"),
      type: feeding.type,
      amount: feeding.amount,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateFeeding(feeding.id, values);
    toast({
      title: "Feeding Updated!",
      description: "The feeding log has been successfully updated.",
    });
    onFinished();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="dateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feeding Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feeding type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DBF">Direct Breastfeeding (DBF)</SelectItem>
                  <SelectItem value="EBM">Expressed Breast Milk (EBM)</SelectItem>
                  <SelectItem value="Formula">Formula</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (ml)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 120" {...field} />
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

export default function FeedingsPage() {
  const { feedings, addFeeding, deleteFeeding } = useContext(AppContext);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFeeding, setSelectedFeeding] = useState<FeedingLog | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: "EBM",
      amount: 100,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addFeeding(values);
    toast({
      title: "Feeding Logged!",
      description: `Logged ${values.amount}ml of ${values.type}.`,
    });
    form.reset({
      dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: values.type,
      amount: values.amount,
    });
  }
  
  const handleDelete = (feeding: FeedingLog) => {
    setSelectedFeeding(feeding);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFeeding) {
      deleteFeeding(selectedFeeding.id);
      toast({
        title: "Feeding Deleted",
        description: "The feeding log has been removed.",
        variant: "destructive",
      });
      setSelectedFeeding(null);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90 font-headline">
          Feeding Log
        </h1>
        <p className="text-muted-foreground">
          Keep a detailed record of your baby's feedings.
        </p>
      </header>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Log a New Feeding</CardTitle>
              <CardDescription>
                Enter the details of the feeding session.
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
                    name="dateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feeding Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select feeding type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DBF">
                              Direct Breastfeeding (DBF)
                            </SelectItem>
                            <SelectItem value="EBM">Expressed Breast Milk (EBM)</SelectItem>
                            <SelectItem value="Formula">Formula</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (ml)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 120" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <Milk className="mr-2 h-4 w-4" /> Log Feeding
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Feeding History</CardTitle>
              <CardDescription>
                A complete list of all logged feedings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount (ml)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedings.length > 0 ? (
                    feedings.map((feeding) => (
                      <TableRow key={feeding.id}>
                        <TableCell>
                          {format(new Date(feeding.dateTime), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell>{feeding.type}</TableCell>
                        <TableCell>
                          {feeding.amount}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog open={isEditDialogOpen && selectedFeeding?.id === feeding.id} onOpenChange={(isOpen) => {
                            if (!isOpen) setSelectedFeeding(null);
                            setIsEditDialogOpen(isOpen);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedFeeding(feeding)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Feeding</DialogTitle>
                              </DialogHeader>
                              {selectedFeeding && <EditFeedingForm feeding={selectedFeeding} onFinished={() => setIsEditDialogOpen(false)} />}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(feeding)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No feedings logged yet.
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
              This action cannot be undone. This will permanently delete the feeding record.
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
