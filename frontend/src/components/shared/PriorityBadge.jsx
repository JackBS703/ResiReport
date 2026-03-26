const colorMap = {
  sinasignar: 'bg-slate-100 text-slate-500 border-slate-200',
  alta: 'bg-red-100 text-red-700 border-red-200',
  media: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  baja: 'bg-green-100 text-green-700 border-green-200',
};

const labelMap = {
  sinasignar: 'Sin asignar',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

const PriorityBadge = ({ prioridad }) => {
  const clases = colorMap[prioridad] || colorMap.baja;
  const label  = labelMap[prioridad] || prioridad;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${clases}`}>
      {label}
    </span>
  );
};

export default PriorityBadge;