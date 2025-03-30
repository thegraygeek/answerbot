import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registrationSchema, type RegistrationData } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function Welcome() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [initialLoad, setInitialLoad] = useState(true);
  const [savedData, setSavedData] = useState<Partial<RegistrationData> | null>(null);

  // Try to load saved form data from localStorage on component mount
  useEffect(() => {
    // Check auth status first
    apiRequest('/api/auth/status').then(status => {
      if (status.isLoggedIn) {
        navigate('/chat');
        return;
      }

      const storedFormData = localStorage.getItem('registration_form');
      if (storedFormData) {
        try {
          const parsedData = JSON.parse(storedFormData);
          setSavedData(parsedData);
          form.reset(parsedData);
        } catch (error) {
          console.error('Error parsing stored form data:', error);
        }
      }
      setInitialLoad(false);
    }).catch(error => {
      console.error('Error checking auth status:', error);
      setInitialLoad(false);
    });
  }, []);

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  // Save form data to localStorage when values change
  useEffect(() => {
    if (!initialLoad) {
      const currentValues = form.getValues();
      if (currentValues.firstName || currentValues.lastName || currentValues.email) {
        localStorage.setItem('registration_form_data', JSON.stringify(currentValues));
      }
    }
  }, [form.watch(), initialLoad]);

  async function onSubmit(data: RegistrationData) {
    setIsSubmitting(true);
    try {
      interface RegisterResponse {
        message: string;
        userId: number;
        firstName: string;
        isLoggedIn: boolean;
      }

      const response = await apiRequest<RegisterResponse>('/api/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      // Invalidate the auth status query to force a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });

      // Clear saved form data from localStorage on successful registration
      localStorage.removeItem('registration_form_data');

      toast({
        title: 'Registration successful!',
        description: `Welcome to TTwW Answerbot, ${response.firstName || 'user'}!`,
      });

      // Check auth status and navigate after a short delay to allow session to update
      setTimeout(async () => {
        const authCheck = await apiRequest('/api/auth/status');
        if (authCheck.isLoggedIn) {
          navigate('/chat');
        } else {
          toast({
            title: 'Navigation error',
            description: 'Please try logging in again',
            variant: 'destructive',
          });
        }
      }, 500);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Use the proper logo based on theme
  const logoSrc = theme === 'dark' ? '/ttww-logo-dark.png' : '/ttww-logo-light.png';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <img 
            src={logoSrc} 
            alt="TTwW Logo" 
            className="mx-auto w-48 h-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-primary">TTwW Answerbot</h1>
          <p className="mt-2 text-muted-foreground">Your personal AI tech assistant</p>
        </div>

        {/* Registration Card */}
        <div className="w-full max-w-md bg-card rounded-xl shadow-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-center mb-6">Create Your Account</h2>

          {savedData && (
            <div className="mb-6 p-3 bg-primary/10 rounded-lg text-sm">
              <p className="font-medium">Welcome back!</p>
              <p className="text-muted-foreground">We've restored your previous information.</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        {...field} 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        {...field} 
                        className="bg-background"
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
                        type="email" 
                        placeholder="john.doe@example.com" 
                        {...field} 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-xs text-center text-muted-foreground">
            By registering, you agree to receive tech tips and information from TTwW.
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Teaching the Way We Learn. All rights reserved.
      </footer>
    </div>
  );
}