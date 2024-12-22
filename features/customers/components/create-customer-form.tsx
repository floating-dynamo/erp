"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomerSchema, customerAddressSchema } from "../schemas";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";

// Infer the form schema type
type CreateCustomerFormSchema = z.infer<typeof createCustomerSchema>;

interface CreateCustomerFormProps {
  onCancel?: () => void;
}

export const CreateCustomerForm = ({ onCancel }: CreateCustomerFormProps) => {
  const form = useForm<CreateCustomerFormSchema>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      address: {
        address1: "",
        city: "",
        state: "",
        country: "",
        pincode: undefined,
      },
      gstNumber: "",
      vendorId: "",
      customerType: "",
      poc: [],
    },
  });

  const {
    fields: pocFields,
    append: addPOC,
    remove: removePOC,
  } = useFieldArray({
    control: form.control,
    name: "poc",
  });

  const onSubmit = (values: CreateCustomerFormSchema) => {
    console.log(values);
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold flex gap-7 items-center">
          <Button
            variant="outline"
            type="button"
            size="icon"
            onClick={onCancel}
            disabled={false}
          >
            <ArrowLeft className="size-4" />
          </Button>
          Add a new customer
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Address</h2>
              {(
                Object.keys(customerAddressSchema.shape) as Array<
                  keyof typeof customerAddressSchema.shape
                >
              ).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`address.${key}`} // This ensures the path matches the schema
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Enter ${key}`}
                          onChange={(e) => {
                            if (key === "pincode") {
                              field.onChange(Number(e.target.value) || null); // Explicitly convert to number
                            } else {
                              field.onChange(e.target.value); // Default string handling
                            }
                          }}
                          value={field.value ?? ""} // Fallback to empty string for undefined values
                          type={key === "pincode" ? "number" : "text"} // Set input type based on the field
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* POC Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Points of Contact</h2>
              {pocFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  {/* Mobile */}
                  <FormField
                    control={form.control}
                    name={`poc.${index}.mobile` as const}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || null)
                            }
                            placeholder="Enter mobile number"
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name={`poc.${index}.email` as const}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter email address"
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removePOC(index)}
                    className="h-10"
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {/* Add POC Button */}
              <Button
                type="button"
                variant={"tertiary"}
                onClick={() =>
                  addPOC({
                    mobile: undefined,
                    email: "",
                  })
                }
              >
                <PlusCircle className="size-4" /> Add POC
              </Button>
            </div>

            {/* Other Fields */}
            <FormField
              control={form.control}
              name="gstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter GST Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Vendor ID" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Customer Type" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            {/* Submit Button */}
            <div className="flex items-center lg:justify-end justify-center w-full">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
