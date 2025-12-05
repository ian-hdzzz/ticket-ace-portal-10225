import { useEffect } from 'react';
import { usePageContext } from '@/contexts/PageContext';

/**
 * Hook para establecer el título y descripción de la página actual
 * @param title - El título de la página
 * @param description - La descripción de la página
 */
export function usePageTitle(title: string, description: string = '') {
  const { setPageInfo } = usePageContext();

  useEffect(() => {
    setPageInfo(title, description);
  }, [title, description, setPageInfo]);
}
