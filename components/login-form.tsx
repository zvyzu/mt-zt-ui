"use client";

import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    user: z.string().min(1, { message: "Bidang ini wajib di isi!" }),
    password: z
      .string()
      .min(1, { message: "Bidang ini wajib di isi!" })
      .min(8, { message: "Minimum 8 karakter" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    // const auth = btoa(`${values.user}:${values.password}`);
    sessionStorage.setItem("auth", btoa(`${values.user}:${values.password}`));
    // axios.defaults.headers.common["Authorization"] = `Basic ${auth}`;
    axios
      .get("https://zt.zvy.me/rest/system/resource", {
        auth: {
          username: values.user,
          password: values.password,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Connected, redirecting...");
          router.push("/dashboard");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(
          `Error: ${error.response?.data?.error} ${error.response?.data?.message}`
        );
        setLoading(false);
      });
    setLoading(false);
  };

  const onReset = () => {
    form.reset();
    form.clearErrors();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Sign in with your MikroTik user credential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onReset={onReset}
              noValidate
            >
              <FieldGroup>
                <FormField
                  name="user"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="user">User</FieldLabel>

                      <FormItem>
                        <FormControl>
                          <Input
                            id="user"
                            key="user"
                            type="text"
                            placeholder="username"
                            autoFocus
                            autoComplete="username"
                            disabled={loading}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                document.getElementById("password")?.focus();
                              }
                            }}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    </Field>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>

                      <FormItem>
                        <FormControl>
                          <PasswordInput
                            id="password"
                            key="password"
                            placeholder="********"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    </Field>
                  )}
                />

                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Spinner /> : "Sign in"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
