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
import { ArrowLeft, PlusCircle, TrashIcon } from "lucide-react";
import { useAddCustomer } from "../api/use-add-customer";
import { useRouter } from "next/navigation";

// Infer the form schema type
type CreateCustomerFormSchema = z.infer<typeof createCustomerSchema>;

interface CreateCustomerFormProps {
  onCancel?: () => void;
}

export const CreateCustomerForm = ({ onCancel }: CreateCustomerFormProps) => {
  const { mutate: addCustomer, isPending } = useAddCustomer();
  const router = useRouter();
  const form = useForm<CreateCustomerFormSchema>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      address: {
        address1: "",
        city: "",
        state: "",
        country: "",
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
    values.id = Math.random().toString(36).substr(2, 9);
    addCustomer(values, {
      onSuccess: () => {
        form.reset();
        router.push("/customers");
      },
    });
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
                  name={`address.${key}`}
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
                              field.onChange(Number(e.target.value) || "");
                            } else {
                              field.onChange(e.target.value);
                            }
                          }}
                          value={field.value ?? ""}
                          type={key === "pincode" ? "number" : "text"}
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
                  className="flex items-end gap-4 border-b pb-4 flex-wrap"
                >
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name={`poc.${index}.name` as const}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter name"
                            type="text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                  {/* Remove Button */}
                  <div className="flex items-center justify-center h-full">
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => removePOC(index)}
                      className="flex items-center justify-center mb-2"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add POC Button */}
              <Button
                type="button"
                variant={"tertiary"}
                onClick={() =>
                  addPOC({
                    name: "",
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
              <Button type="submit" disabled={isPending}>
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
