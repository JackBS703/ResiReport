const colorMap = {
  'Pendiente':   'bg-orange-100 text-orange-700 border-orange-200',
  'En revisión': 'bg-blue-100 text-blue-700 border-blue-200',
  'Resuelto':    'bg-green-100 text-green-700 border-green-200',
  'Rechazado':   'bg-red-100 text-red-700 border-red-200',
};

const StatusBadge = ({ estado }) => {
  // Ahora "estado" puede ser el objeto poblado { _id, nombre, color }
  const isObject = typeof estado === 'object' && estado !== null;
  const name = isObject ? estado.nombre : estado;
  
  // Usamos el color si viene del backend, si no un gris neutral
  const bgColor = (isObject && estado.color) ? estado.color : '#9CA3AF';

  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm text-white"
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {name || 'Desconocido'}
    </span>
  );
};

export default StatusBadge;