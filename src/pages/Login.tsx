import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUser } from '../lib/api/auth';
import { useAuth } from '../lib/session/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { ApiError, type MaxSessionsReachedPayload } from '../lib/api/types';
import { SessionLimitModal } from '../components/ui/SessionLimitModal';

// The backend accepts either email or username in the identifier field.
// We'll let the user type either, and we'll check if it's an email vs username.
const loginSchema = z.object({
  identifier: z.string().min(3, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [blockedPayload, setBlockedPayload] = useState<MaxSessionsReachedPayload | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, setError, getValues, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setGlobalError(null);

      const isEmail = data.identifier.includes('@');
      const payload = {
        ...(isEmail ? { email: data.identifier } : { username: data.identifier }),
        password: data.password
      };

      const { user } = await loginUser(payload);
      login(user);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const maxSessionsPayload = err.data as MaxSessionsReachedPayload | undefined;
        if (err.statusCode === 409 && maxSessionsPayload?.code === 'MAX_ACTIVE_SESSIONS_REACHED') {
          setBlockedPayload(maxSessionsPayload);
        } else if (err.errors && err.errors.length > 0) {
          err.errors.forEach(e => {
            setError((e.path as 'identifier' | 'password' | 'root') || 'identifier', { type: 'manual', message: e.message });
          });
        } else {
          setGlobalError(err.message || 'Login failed');
        }
      } else {
        setGlobalError('An unexpected error occurred');
      }
    }
  };

  const handleRetry = () => {
    setBlockedPayload(null);
    void onSubmit(getValues());
  };


  return (
    <div className="flex items-center justify-center p-4 py-10 md:p-10 relative min-h-screen overflow-hidden">

      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] -z-10 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-5%] -z-10 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-float"></div>

      <Card className="w-full max-w-md shadow-2xl border-white/5 glass-panel">
        <CardHeader className="space-y-3 text-center pb-8 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent z-0"></div>
          <CardTitle className="text-3xl font-bold text-white relative z-10">Welcome back</CardTitle>
          <CardDescription className="relative z-10 text-gray-400">Enter your email or username to log in</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {globalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm font-medium text-red-500 mb-4">
                {globalError}
              </div>
            )}

            <Input
              label="Email or Username"
              placeholder="e.g. alice@example.com or alicej"
              {...register('identifier')}
              error={errors.identifier?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <Button type="submit" className="w-full mt-4 h-12 shadow-[0_0_15px_rgba(2,132,199,0.2)] hover:shadow-[0_0_25px_rgba(2,132,199,0.4)] transition-shadow" isLoading={isSubmitting}>
              Log in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 mt-4 pt-6 pb-6 text-sm text-gray-400 bg-surface/30">
          Don't have an account?
          <Link to="/register" className="ml-1 text-primary-400 hover:text-primary-300 font-medium hover:underline underline-offset-4 transition-all">
            Sign up
          </Link>
        </CardFooter>
      </Card>

      {blockedPayload && (
        <SessionLimitModal
          payload={blockedPayload}
          isOpen={!!blockedPayload}
          onClose={() => setBlockedPayload(null)}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
