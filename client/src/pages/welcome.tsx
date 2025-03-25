import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registrationSchema, type RegistrationData } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
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

      toast({
        title: 'Registration successful!',
        description: `Welcome to TTwW Answerbot, ${response.firstName || 'user'}!`,
      });

      // Small delay to ensure the auth status is updated
      setTimeout(() => {
        // Navigate to the main chat page
        navigate('/chat');
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

  return (
    <div style={{backgroundColor: 'white', color: 'black', padding: '20px', minHeight: '100vh'}}>
      <h1 style={{color: 'black', fontSize: '24px', fontWeight: 'bold', textAlign: 'center'}}>TTwW Answerbot</h1>
      
      <div style={{marginTop: '40px', maxWidth: '400px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <h2 style={{textAlign: 'center', fontSize: '20px', marginBottom: '20px'}}>Welcome!</h2>
        <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>
          Register to start using TTwW Answerbot - your friendly tech guide
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
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
              disabled={isSubmitting}
              style={{marginTop: '10px'}}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </Form>

        <div style={{marginTop: '20px', fontSize: '12px', textAlign: 'center', color: '#666'}}>
          By registering, you agree to receive tech tips and information from TTwW.
        </div>
      </div>

      <footer style={{marginTop: '40px', textAlign: 'center', fontSize: '14px', color: '#666'}}>
        &copy; {new Date().getFullYear()} Teaching the Way We Learn. All rights reserved.
      </footer>
    </div>
  );
}