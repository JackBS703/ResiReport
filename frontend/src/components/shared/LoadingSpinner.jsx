const LoadingSpinner = ({ mensaje = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="mt-4 text-sm text-slate-500">{mensaje}</p>
    </div>
  );
};

export default LoadingSpinner;