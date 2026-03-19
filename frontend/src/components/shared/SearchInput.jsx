import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const SearchInput = ({ placeholder = 'Buscar...', onSearch, delay = 400 }) => {
  const [valor, setValor] = useState('');

  // Debounce integrado: espera `delay` ms después del último keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(valor);
    }, delay);

    return () => clearTimeout(timer); // Limpia el timer si el usuario sigue escribiendo
  }, [valor, delay, onSearch]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};

export default SearchInput;