const colorMap = {
  'Pendiente':   'bg-orange-100 text-orange-700 border-orange-200',
  'En revisión': 'bg-blue-100 text-blue-700 border-blue-200',
  'Resuelto':    'bg-green-100 text-green-700 border-green-200',
  'Rechazado':   'bg-red-100 text-red-700 border-red-200',
};

const StatusBadge = ({ estado }) => {
  const clases = colorMap[estado] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${clases}`}>
      {estado}
    </span>
  );
};

export default StatusBadge;