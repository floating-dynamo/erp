"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRequirementSchema } from "../schemas";
// import { useCreateWorkspace } from "../api/use-create-workspace";
// import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOMERS_MOCK_DATA } from "@/mocks/customers/mock";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarIcon,
  PlusCircleIcon,
  TrashIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

interface CreateRequirementFormProps {
  onCancel?: () => void;
}

type ZodCreateRequirementSchema = z.infer<typeof createRequirementSchema>;

export const CreateRequirementForm = ({
  onCancel,
}: CreateRequirementFormProps) => {
  const form = useForm<ZodCreateRequirementSchema>({
    resolver: zodResolver(createRequirementSchema),
    defaultValues: {
      enquiryNumber: 0,
      customerId: "",
      items: [],
    },
  });
  // const { mutate, isPending } = useCreateWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);
  // const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file);
    }
  };

  // const handleClearFile = (e: React.ChangeEvent<HTMLInputElement>) => {

  // }

  const onSubmit = (values: ZodCreateRequirementSchema) => {
    const totalItemsPrice = values.items
      .map(({ unitPrice, quantity }) => unitPrice * quantity)
      .reduce((acc, num) => acc + num);
    const totalItemsFinalPrice = values.items
      .map(
        ({ unitPrice, quantity, unitTax }) =>
          unitPrice * quantity + unitPrice * (unitTax / 100)
      )
      .reduce((acc, num) => acc + num);
    values.totalItemsPrice = totalItemsPrice;
    values.totalItemsFinalPrice = totalItemsFinalPrice;
    console.log(values);
    // const finalValues = {
    //   ...values,
    //   image: values.image instanceof File ? values.image : "",
    // };
    // mutate(
    //   {
    //     form: finalValues,
    //   },
    //   {
    //     onSuccess: ({ data }) => {
    //       form.reset();
    //       router.push(`/workspaces/${data.$id}`);
    //     },
    //   }
    // );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Add a new enquiry</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      {/* TODO: Make this a combobox */}
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
                          <SelectValue placeholder="No customer selected" />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOMERS_MOCK_DATA?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <span className="truncate">{customer.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enquiryNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enquiry Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                        type="number"
                        placeholder="Enter enquiry number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enquiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enquiry Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon />
                            {field.value
                              ? new Intl.DateTimeFormat("en-US").format(
                                  new Date(field.value)
                                )
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              const selectedDate = date
                                ? date.toISOString()
                                : "";
                              field.onChange(selectedDate);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Items</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-6">
                        {(field.value || []).map((item, index) => (
                          <div
                            key={index}
                            className="flex gap-2 flex-wrap items-center border-b pb-4"
                          >
                            {/* Item Code */}
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Item Code
                              </FormLabel>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter item code"
                                value={item.itemCode || 0}
                                onChange={(e) =>
                                  field.onChange(
                                    (field.value || []).map((itm, i) =>
                                      i === index
                                        ? {
                                            ...itm,
                                            itemCode: Number(e.target.value),
                                          }
                                        : itm
                                    )
                                  )
                                }
                              />
                            </div>

                            {/* Item Description */}
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Description
                              </FormLabel>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter item description"
                                value={item.itemDescription || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    (field.value || []).map((itm, i) =>
                                      i === index
                                        ? {
                                            ...itm,
                                            itemDescription: e.target.value,
                                          }
                                        : itm
                                    )
                                  )
                                }
                              />
                            </div>

                            {/* Quantity */}
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Quantity
                              </FormLabel>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter quantity"
                                value={item.quantity || 0}
                                onChange={(e) =>
                                  field.onChange(
                                    (field.value || []).map((itm, i) =>
                                      i === index
                                        ? {
                                            ...itm,
                                            quantity: Number(e.target.value),
                                          }
                                        : itm
                                    )
                                  )
                                }
                              />
                            </div>

                            {/* Unit Price */}
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Unit Price
                              </FormLabel>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter unit price"
                                value={item.unitPrice || 0}
                                onChange={(e) =>
                                  field.onChange(
                                    (field.value || []).map((itm, i) =>
                                      i === index
                                        ? {
                                            ...itm,
                                            unitPrice: Number(e.target.value),
                                          }
                                        : itm
                                    )
                                  )
                                }
                              />
                            </div>

                            {/* Unit Tax */}
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Unit Tax
                              </FormLabel>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter tax amount"
                                value={item.unitTax || 0}
                                onChange={(e) =>
                                  field.onChange(
                                    (field.value || []).map((itm, i) =>
                                      i === index
                                        ? {
                                            ...itm,
                                            unitTax: Number(e.target.value),
                                          }
                                        : itm
                                    )
                                  )
                                }
                              />
                            </div>

                            {/* Remove Button */}
                            <div className="flex items-center justify-center h-full">
                              <Button
                                variant="destructive"
                                type="button"
                                onClick={() =>
                                  field.onChange(
                                    (field.value || []).filter(
                                      (_, i) => i !== index
                                    )
                                  )
                                }
                              >
                                <TrashIcon />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {/* Add Item Button */}
                        <Button
                          type="button"
                          variant={"tertiary"}
                          onClick={() =>
                            field.onChange([
                              ...(field.value || []),
                              {
                                itemCode: undefined,
                                itemDescription: "",
                                quantity: undefined,
                                unitPrice: undefined,
                                unitTax: undefined,
                              },
                            ])
                          }
                        >
                          <PlusCircleIcon className="size-4" />
                          Add a new item
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsAndConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms and conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Enter the terms and conditions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      <Avatar className="size-[72px]">
                        <AvatarFallback>
                          <UploadCloudIcon className="size-[36px] text-neutral-400" />
                        </AvatarFallback>
                      </Avatar>
                      {!field.value ? (
                        <div className="flex flex-col">
                          <p className="text-sm">Attach a file</p>
                          <p className="text-sm text-muted-foreground">
                            PDF, JPEG, PNG, SVG or JPEG, max 20mb
                          </p>
                          <input
                            className="hidden"
                            accept=".jpg, .png, .jpeg, .svg, .pdf"
                            type="file"
                            ref={inputRef}
                            onChange={handleFileChange}
                            disabled={false}
                          />
                          <Button
                            type="button"
                            disabled={false}
                            variant={"tertiary"}
                            size={"xs"}
                            className="w-fit mt-2"
                            onClick={() => inputRef.current?.click()}
                          >
                            Upload File
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <p className="text-sm">Uploaded File</p>
                          <div className="text-muted-foreground flex items-center gap-2">
                            <p className="text-sm">{field.value.name}</p>
                            <span
                              className="font-semibold p-0 m-0"
                              onClick={() => {
                                field.onChange(null);
                                if (inputRef.current) {
                                  inputRef.current.value = "";
                                }
                              }}
                            >
                              <XIcon className="size-4 hover:opacity-75 cursor-pointer transition" />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
            <Separator className="my-7" />
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                type="button"
                size="lg"
                onClick={onCancel}
                disabled={false}
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={false}>
                Create Enquiry
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
