import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Subscription, OrderItem } from '@/types';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Subscription>('/subscriptions/me');
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      start_date: string;
      end_date: string;
      weekly_allowance: number;
      default_items?: OrderItem[];
    }) => {
      const { data } = await api.post<Subscription>('/subscriptions', payload);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['subscription', 'me'], data);
    },
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      weekly_allowance?: number;
      default_items?: OrderItem[];
    }) => {
      const { data } = await api.put<Subscription>(
        '/subscriptions/me',
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['subscription', 'me'], data);
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/subscriptions/me');
    },
    onSuccess: () => {
      qc.setQueryData(['subscription', 'me'], null);
    },
  });
}
