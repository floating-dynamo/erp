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
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  ImageIcon,
  PlusCircle,
  TrashIcon,
} from "lucide-react";
import { useAddCustomer } from "../api/use-add-customer";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";
import { useCountries } from "../api/use-countries";
import Loader from "@/components/loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Infer the form schema type
type CreateCustomerFormSchema = z.infer<typeof createCustomerSchema>;

interface CreateCustomerFormProps {
  onCancel?: () => void;
}

export const CreateCustomerForm = ({ onCancel }: CreateCustomerFormProps) => {
  const { mutate: addCustomer, isPending } = useAddCustomer();
  const { data: countriesData, isLoading: isFetchingCountries } =
    useCountries();
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
  const inputRef = useRef<HTMLInputElement>(null);
  // TODO: States as combobox
  // const [countryStates, setCountryStates] = useState<string[]>([]);

  // useEffect(() => {
  //   if (countriesData) {
  //     const currentCountry = form.getValues("address.country");
  //     console.log("Current Country ", currentCountry);
  //     const cities =
  //       countriesData?.data?.find(
  //         (country) => country.country === currentCountry
  //       )?.cities || [];
  //     setCountryStates(cities);
  //   }
  // }, [countriesData]);

  const {
    fields: pocFields,
    append: addPOC,
    remove: removePOC,
  } = useFieldArray({
    control: form.control,
    name: "poc",
  });

  const onSubmit = (values: CreateCustomerFormSchema) => {
    const finalValues = {
      ...values,
      id: Math.random().toString(36).substr(2, 9), // TODO: Move this to backend - uuid
      image: values.image instanceof File ? values.image : "",
    };
    console.log("Customer: ", finalValues);
    addCustomer(finalValues, {
      onSuccess: () => {
        form.reset();
        router.push("/customers");
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  if (isFetchingCountries) {
    return <Loader />;
  }

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
              ).map(
                (key) =>
                  // key !== "state" &&
                  key !== "country" && (
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
                  )
              )}
              {/* Address - State */}
              {/* <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? countryStates?.find(
                                    (state) => state === field.value
                                  )
                                : "Select State"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="sm:w-[300px] w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search State..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No State found.</CommandEmpty>
                              <CommandGroup>
                                {countryStates?.map((state) => (
                                  <CommandItem
                                    value={state}
                                    key={state}
                                    onSelect={() => {
                                      form.setValue("address.state", state);
                                    }}
                                  >
                                    {state}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        state === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              {/* Address - Country */}
              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? countriesData?.data?.find(
                                    (country) => country.country === field.value
                                  )?.country
                                : "Select Country"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="sm:w-[300px] w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search Country..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No Country found.</CommandEmpty>
                              <CommandGroup>
                                {countriesData?.data?.map((country) => (
                                  <CommandItem
                                    value={country.country}
                                    key={country.country}
                                    onSelect={() => {
                                      form.setValue(
                                        "address.country",
                                        country.country
                                      );
                                    }}
                                  >
                                    {country?.country}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        country.country === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            {/* Customer Logo Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-x-5">
                    {field.value ? (
                      <div className="size-[72px] relative rounded-md overflow-hidden">
                        <Image
                          src={
                            field.value instanceof File
                              ? URL.createObjectURL(field.value)
                              : field.value
                          }
                          alt="Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Avatar className="size-[72px]">
                        <AvatarFallback>
                          <ImageIcon className="size-[36px] text-neutral-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <p className="text-sm">Company Logo</p>
                      <p className="text-sm text-muted-foreground">
                        JPEG, PNG, SVG or JPEG, max 1mb
                      </p>
                      <input
                        className="hidden"
                        accept=".jpg, .png, .jpeg, .svg"
                        type="file"
                        ref={inputRef}
                        onChange={handleImageChange}
                        disabled={isPending}
                      />
                      {field.value ? (
                        <Button
                          type="button"
                          disabled={isPending}
                          variant={"destructive"}
                          size={"xs"}
                          className="w-fit mt-2"
                          onClick={() => {
                            field.onChange(null);
                            if (inputRef.current) {
                              inputRef.current.value = "";
                            }
                          }}
                        >
                          Remove Image
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={isPending}
                          variant={"tertiary"}
                          size={"xs"}
                          className="w-fit mt-2"
                          onClick={() => inputRef.current?.click()}
                        >
                          Upload Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
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
