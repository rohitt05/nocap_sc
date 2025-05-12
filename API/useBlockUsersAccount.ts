import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import { useFetchFriends } from './fetchFriends'; // Import the existing friends hook

interface UseBlockUserAccountProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useBlockUserAccount = ({ onSuccess, onError }: UseBlockUserAccountProps = {}) => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; username: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Import the removeFriend function from your existing hook
  const { removeFriend } = useFetchFriends();

  // Helper to get current user ID
  const getCurrentUserId = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id;
  }, []);

  // Check if a user is blocked
  const checkIsBlocked = useCallback(async (blockedId: string) => {
    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) return false;

      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', currentUserId)
        .eq('blocked_id', blockedId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking block status:', error);
      return false;
    }
  }, [getCurrentUserId]);

  // Check if users are friends
  const checkIsFriend = useCallback(async (userId: string) => {
    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) return false;

      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`)
        .eq('status', 'accepted')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return false;
    }
  }, [getCurrentUserId]);

  // Block a user
  const blockUser = useCallback(async (blockedId: string) => {
    try {
      setIsBlocking(true);
      
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        return Alert.alert('Error', 'You must be logged in to block a user');
      }
      
      // First, check if they are friends
      const areFriends = await checkIsFriend(blockedId);
      
      // If they are friends, remove the friendship first
      if (areFriends) {
        try {
          await removeFriend(blockedId);
          console.log('Friend removed as part of blocking');
        } catch (friendError) {
          console.error('Error removing friend while blocking:', friendError);
          // Continue with blocking even if unfriending failed
        }
      }
      
      // Then block the user
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: currentUserId,
          blocked_id: blockedId
        });
      
      if (error) throw error;
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      if (onError) onError(error as Error);
      return false;
    } finally {
      setIsBlocking(false);
    }
  }, [onSuccess, onError, getCurrentUserId, checkIsFriend, removeFriend]);

  // Unblock a user
  const unblockUser = useCallback(async (blockedId: string) => {
    try {
      setIsUnblocking(true);
      
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        return Alert.alert('Error', 'You must be logged in to unblock a user');
      }
      
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .match({
          blocker_id: currentUserId,
          blocked_id: blockedId
        });
      
      if (error) throw error;
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      if (onError) onError(error as Error);
      return false;
    } finally {
      setIsUnblocking(false);
    }
  }, [onSuccess, onError, getCurrentUserId]);

  // Get all blocked users
  const fetchBlockedUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        return Alert.alert('Error', 'You must be logged in to view blocked users');
      }
      
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_id,
          users:blocked_id (
            username
          )
        `)
        .eq('blocker_id', currentUserId);
      
      if (error) throw error;
      
      // Format the data
      const formattedData = data.map(item => ({
        id: item.blocked_id,
        username: item.users.username
      }));
      
      setBlockedUsers(formattedData);
      return formattedData;
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      if (onError) onError(error as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [onError, getCurrentUserId]);

  return {
    blockUser,
    unblockUser,
    checkIsBlocked,
    fetchBlockedUsers,
    blockedUsers,
    isBlocking,
    isUnblocking,
    isLoading
  };
};