import { useState, useEffect } from 'react';

// Retrasa la actualización de un valor hasta que el usuario
// deje de escribir por `delay` ms — HU-19
const useDebounce = (value, delay = 400) => {
  const [valorRetrasado, setValorRetrasado] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setValorRetrasado(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return valorRetrasado;
};

export default useDebounce;