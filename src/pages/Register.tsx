import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser } from '../lib/api/auth';
import { useAuth } from '../lib/session/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { ApiError } from '../lib/api/types';

const registerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setGlobalError(null);
      const { user } = await registerUser(data);

      // Simulate session creation on successful register
      login(user);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          // Field level errors from backend
          err.errors.forEach(e => {
            if (e.path) {
              setError(e.path as 'fullname' | 'email' | 'username' | 'password' | 'root', { type: 'server', message: e.message });
            }
          });
        }
        else {
          setGlobalError(err.message || 'Registration failed');
        }
      } else {
        setGlobalError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="flex items-center justify-center py-30 px-4 min-h-screen relative overflow-hidden">

      <Card className="w-full max-w-md shadow-2xl border-white/5 glass-panel">
        <CardHeader className="space-y-3 text-center pb-6 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent z-0"></div>
          <CardTitle className="text-3xl font-bold text-white relative z-10">Create Account</CardTitle>
          <CardDescription className="relative z-10 text-gray-400">Join the developer pulse</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {globalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm font-medium text-red-500 mb-4">
                {globalError}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="Alice Johnson"
              {...register('fullname')}
              error={errors.fullname?.message}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="alice@example.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Username"
              placeholder="alicej"
              {...register('username')}
              error={errors.username?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              {...register('password')}
              error={errors.password?.message}
            />

            <Button type="submit" className="w-full mt-6 h-12 shadow-[0_0_15px_rgba(2,132,199,0.2)] hover:shadow-[0_0_25px_rgba(2,132,199,0.4)] transition-shadow" isLoading={isSubmitting}>
              Sign up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 mt-4 pt-6 pb-6 text-sm text-gray-400 bg-surface/30">
          Already have an account?
          <Link to="/login" className="ml-1 text-primary-400 hover:text-primary-300 font-medium hover:underline underline-offset-4 transition-all">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
