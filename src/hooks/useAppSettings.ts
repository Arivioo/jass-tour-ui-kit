import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  id: string;
  next_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      
      if (error) throw error;
      return data as AppSettings;
    },
  });
}

export function useUpdateNextDate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (nextDate: Date | null) => {
      const { data, error } = await supabase
        .from('app_settings')
        .update({ next_date: nextDate?.toISOString() ?? null })
        .eq('id', 'default')
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });
}
