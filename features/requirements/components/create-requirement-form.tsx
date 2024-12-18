"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

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
import { ImageIcon } from "lucide-react";
import { useRef } from "react";

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
      enquiryNumber: "",
    },
  });
  // const { mutate, isPending } = useCreateWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);
  // const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  const onSubmit = (values: ZodCreateRequirementSchema) => {
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
    console.log(values);
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
                      <Select {...field}>
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
                      <Input {...field} placeholder="Enter enquiry number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        <p className="text-sm">Attach a file</p>
                        <p className="text-sm text-muted-foreground">
                          PDF, JPEG, PNG, SVG or JPEG, max 20mb
                        </p>  
                        <input
                          className="hidden"
                          accept=".jpg, .png, .jpeg, .svg"
                          type="file"
                          ref={inputRef}
                          onChange={handleImageChange}
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
