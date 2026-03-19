import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login as loginApi } from '@/api/authApi';
import useAuth from '@/hooks/useAuth';
import { HOME_BY_ROL } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  correo: z.string().email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setErrorServidor('');
    try {
      const res = await loginApi(data.correo, data.password);
      const { token, user } = res.data.data;
      login(token, user); // guarda en Context + localStorage
      navigate(HOME_BY_ROL[user.rol] ?? '/');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Error al iniciar sesión';
      setErrorServidor(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">ResiReport</h1>
          <p className="text-sm text-slate-500 mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Correo</label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              {...register('correo')}
              aria-invalid={!!errors.correo}
            />
            {errors.correo && (
              <p className="text-xs text-red-500">{errors.correo.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Error del servidor (credenciales inválidas, cuenta inactiva, etc.) */}
          {errorServidor && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorServidor}
            </p>
          )}

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;