import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase'; // Assuming you have a Supabase client setup

export type ReportReason = 'inappropriate' | 'spam' | 'offensive' | 'misleading' | 'other';

export interface ReportResponse {
  responseId: string;
  reason: ReportReason;
  details?: string;
}

export const useReportResponse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportResponse = async ({ responseId, reason, details }: ReportResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error('Authentication required');
      }
      
      const reporterId = userData.user?.id;
      
      if (!reporterId) {
        throw new Error('User ID not found');
      }

      const { data, error: insertError } = await supabase
        .from('response_reports')
        .insert({
          reporter_id: reporterId,
          response_id: responseId,
          reason: `${reason}${details ? `: ${details}` : ''}`,
          status: 'pending'
        });
      
      if (insertError) {
        // Handle duplicate report error specifically
        if (insertError.code === '23505') {
          throw new Error('You have already reported this response');
        }
        throw new Error(insertError.message);
      }
      
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our team will review it shortly.',
        [{ text: 'OK' }]
      );
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit report';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reportResponse,
    isLoading,
    error
  };
};