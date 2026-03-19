const TotalCount = ({ total, label = 'resultado(s)' }) => {
  if (total === undefined || total === null) return null;

  return (
    <p className="text-sm text-slate-500">
      <span className="font-semibold text-slate-700">{total}</span> {label}
    </p>
  );
};

export default TotalCount;