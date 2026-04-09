import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type {
  AdminOrdersResponse,
  MenuItem,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
} from '@/types';

// ── Orders ───────────────────────────────────────────────────────────────

export function useAdminOrders(options?: { status?: string; refetchInterval?: number }) {
  const { status, refetchInterval } = options ?? {};
  return useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const { data } = await api.get<AdminOrdersResponse>('/admin/orders', { params });
      return data;
    },
    refetchInterval: refetchInterval ?? 30000, // 30s auto-refresh
  });
}

export function useAdminUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

// ── Menu ─────────────────────────────────────────────────────────────────

export function useAdminCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMenuItemPayload) => {
      const { data } = await api.post<MenuItem>('/admin/menu', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useAdminUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateMenuItemPayload }) => {
      const { data } = await api.put<MenuItem>(`/admin/menu/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useAdminDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/menu/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}
