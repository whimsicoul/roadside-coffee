import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { authStorage } from '../auth';
import type { User } from '@/types';

export function useUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/users/me');
      return data;
    },
    enabled: !!authStorage.getToken(),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Partial<
        Pick<User, 'first_name' | 'last_name' | 'phone' | 'license_plate'>
      >
    ) => {
      const { data } = await api.put<User>('/users/me', payload);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['user', 'me'], data);
    },
  });
}
