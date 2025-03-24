import { useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registrationSchema, type RegistrationData } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  async function onSubmit(data: RegistrationData) {
    setIsSubmitting(true);
    try {
      await apiRequest(
        'POST',
        '/api/register',
        data
      );

      toast({
        title: 'Registration successful!',
        description: 'Welcome to TTwW Answerbot!',
      });

      // Navigate to the main chat page
      navigate('/chat');
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Logo */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-4 py-6 shadow-sm transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <div className="h-12 w-12 flex items-center justify-center mr-3">
            <img 
              src="/ttww-logo-dark.png" 
              alt="TTwW Logo" 
              className="h-12 w-auto dark:hidden" 
            />
            <img 
              src="/ttww-logo-light.png" 
              alt="TTwW Logo" 
              className="h-12 w-auto hidden dark:block" 
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TTwW Answerbot</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome!</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Register to start using TTwW Answerbot - your friendly tech guide
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
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
                      <Input placeholder="Doe" {...field} />
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
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </Form>

          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
            By registering, you agree to receive tech tips and information from TTwW.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Teaching the Way We Learn. All rights reserved.
      </footer>
    </div>
  );
}