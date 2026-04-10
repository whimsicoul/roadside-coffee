import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Subscription, OrderItem } from '@/types';

export function useSubscription(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['subscription', 'me'],
    enabled: options?.enabled ?? true,
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
      tier: 'drink' | 'combo';
      pickup_time: string;
      duration: '1w' | '1m' | '3m';
      default_items: OrderItem[];
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
      tier?: 'drink' | 'combo';
      pickup_time?: string;
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
