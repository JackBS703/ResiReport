const EmptyState = ({ titulo = 'Sin resultados', descripcion = 'No hay datos para mostrar' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">📭</span>
      <h3 className="text-lg font-semibold text-slate-700">{titulo}</h3>
      <p className="text-sm text-slate-500 mt-1">{descripcion}</p>
    </div>
  );
};

export default EmptyState;