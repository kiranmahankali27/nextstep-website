import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAdmin } from "@/context/AdminContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { setToken } = useAdmin();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useAdminLogin();

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (result) => {
          if (result.success && result.token) {
            setToken(result.token);
            toast({
              title: "Welcome back",
              description: "Successfully logged in to admin portal.",
            });
            setLocation("/admin/dashboard");
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: result.message || "Invalid credentials",
            });
          }
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Invalid credentials or server error.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary tracking-tight">
            <Briefcase className="h-8 w-8" />
            <span>NextStep</span>
          </Link>
        </div>
        
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Employer Portal</CardTitle>
            <CardDescription>
              Sign in to manage job postings and candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground pt-0">
            <p>
              Demo credentials: <span className="font-mono bg-muted px-1 py-0.5 rounded">admin</span> / <span className="font-mono bg-muted px-1 py-0.5 rounded">admin</span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
