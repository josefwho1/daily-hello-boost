import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { personLogSchema, validateSafe } from '@/lib/validation';

export interface PersonLog {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  timezone_offset: string;
}

export const usePersonLogs = () => {
  const { user } = useAuth();
  const [personLogs, setPersonLogs] = useState<PersonLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('person_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPersonLogs(data || []);
    } catch (error) {
      console.error('Error fetching person logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonLogs();
  }, [user]);

  const addPersonLog = async (
    name: string,
    description: string,
    tags: string[],
    timezoneOffset: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    // Validate input before database insert
    const validation = validateSafe(personLogSchema, { name, description, tags });
    if (!validation.success) {
      throw new Error(validation.error);
    }
    const validatedData = validation.data;

    const { data, error } = await supabase
      .from('person_logs')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description || null,
        tags: validatedData.tags && validatedData.tags.length > 0 ? validatedData.tags : null,
        timezone_offset: timezoneOffset,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchPersonLogs();
    return data;
  };

  const updatePersonLog = async (
    id: string,
    updates: Partial<Pick<PersonLog, 'name' | 'description' | 'tags'>>
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('person_logs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchPersonLogs();
  };

  const deletePersonLog = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('person_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchPersonLogs();
  };

  return {
    personLogs,
    loading,
    addPersonLog,
    updatePersonLog,
    deletePersonLog,
    refetch: fetchPersonLogs,
  };
};