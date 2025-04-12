'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createCompanySchema } from '../schemas';
import { useAddCompany } from '../api/use-add-company';
import { useRouter } from 'next/navigation';

interface CreateCompanyFormProps {
  onCancel?: () => void;
  showBackButton?: boolean;
}

type ZodCreateCompanySchema = z.infer<typeof createCompanySchema>;

export const CreateCompanyForm = ({
  onCancel,
  showBackButton = false,
}: CreateCompanyFormProps) => {
  const { mutate: addCompany, isPending } = useAddCompany();
  const form = useForm<ZodCreateCompanySchema>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      city: '',
      state: '',
      gstNumber: '',
      pinCode: 0,
      contact: 0,
      email: '',
    },
  });
  const router = useRouter();

  const onSubmit = (values: ZodCreateCompanySchema) => {
    addCompany(values, {
      onSuccess: () => {
        form.reset();
        router.push('/companies');
      },
    });
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold flex gap-7 item-center">
          {showBackButton && (
            <Button
              variant="outline"
              type="button"
              size="icon"
              onClick={onCancel}
              disabled={false}
              className={!onCancel ? 'invisible' : ''}
            >
              Back
            </Button>
          )}
          Add a new company
        </CardTitle>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company Name <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter company name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter city"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter state"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter GST number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pin Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter pin code"
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter contact number"
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className="my-7" />
            <div className="flex items-center justify-end">
              <Button type="submit" size="lg" disabled={isPending}>
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};