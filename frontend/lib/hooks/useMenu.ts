import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { MenuItem } from '@/types';

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const { data } = await api.get<MenuItem[]>('/menu');
      return data;
    },
  });
}
