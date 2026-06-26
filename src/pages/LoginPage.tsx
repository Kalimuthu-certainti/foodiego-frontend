import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '../validators/auth';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/toast';
import { getAccess } from '../store/authStore';
import { FormField } from '../components/FormField';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { APP_NAME } from '../utils/constants';
import { getErrorMessage } from '../utils/apiError';

interface LocationState {
  from?: { pathname?: string };
}

/** Public login screen. Redirects to the attempted route (or home) once signed in. */
export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Already authenticated — skip the form.
  if (getAccess() !== null) {
    const to = (location.state as LocationState | null)?.from?.pathname ?? '/';
    return <Navigate to={to} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Invalid email or password.'), 'Login failed');
    }
  };

  return (
    <div className="bg-dot-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">
      {/* Warm brand glow behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-brand-300/20 blur-3xl"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-pop">
            <UtensilsCrossed className="h-7 w-7" />
          </span>
          <span className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-900">
            {APP_NAME}
          </span>
          <span className="mt-1 text-sm text-slate-500">Brand Admin Portal</span>
        </div>
        <Card className="w-full shadow-pop">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="owner@brand.com"
                invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>
            <FormField
              label="Password"
              htmlFor="password"
              required
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                invalid={Boolean(errors.password)}
                {...register('password')}
              />
            </FormField>
              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 w-full">
                {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
