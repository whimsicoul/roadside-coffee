import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import type { CreatePaymentIntentResponse } from '@/types';

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (amountCents: number) => {
      const { data } = await api.post<CreatePaymentIntentResponse>(
        '/payments/create-intent',
        { amount_cents: amountCents }
      );
      return data;
    },
  });
}
