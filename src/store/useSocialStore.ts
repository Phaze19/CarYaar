import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Group, GroupMember, Friend, User } from '../types';
import * as Crypto from 'expo-crypto';

interface SocialState {
  groups: Group[];
  friends: Friend[];
  pendingRequests: Friend[];
  
  fetchGroups: (userId: string) => Promise<void>;
  createGroup: (userId: string, name: string) => Promise<Group | null>;
  joinGroup: (userId: string, inviteCode: string) => Promise<boolean>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  leaveGroup: (groupId: string, userId: string) => Promise<boolean>;
  
  fetchGroupMembers: (groupId: string) => Promise<GroupMember[]>;
  addFriendToGroup: (groupId: string, friendUserId: string) => Promise<boolean>;
  
  fetchFriends: (userId: string) => Promise<void>;
  sendFriendRequest: (myUserId: string, friendPhone: string) => Promise<'SUCCESS' | 'NOT_FOUND' | 'SELF' | 'EXISTS' | 'ERROR'>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  groups: [],
  friends: [],
  pendingRequests: [],

  fetchGroups: async (userId) => {
    // Get groups I am a member of
    const { data: memberData } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
      
    if (memberData && memberData.length > 0) {
      const groupIds = memberData.map(m => m.group_id);
      const { data: groupsData } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false });
        
      if (groupsData) set({ groups: groupsData });
    } else {
      set({ groups: [] });
    }
  },

  createGroup: async (userId, name) => {
    // Generate a random 6 char invite code
    const inviteCode = Crypto.randomUUID().substring(0, 6).toUpperCase();
    
    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name, created_by: userId, invite_code: inviteCode })
      .select()
      .single();
      
    if (error) {
      alert(error.message);
      return null;
    }
    
    if (group) {
      // Auto join the creator
      await supabase.from('group_members').insert({ group_id: group.id, user_id: userId });
      await get().fetchGroups(userId);
      return group;
    }
    return null;
  },

  joinGroup: async (userId, inviteCode) => {
    const { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();
      
    if (!group) {
      alert("Invalid invite code.");
      return false;
    }
    
    const { error } = await supabase.from('group_members').insert({ group_id: group.id, user_id: userId });
    if (error) {
       if (error.code === '23505') alert("You are already in this group!");
       else alert(error.message);
       return false;
    }
    
    await get().fetchGroups(userId);
    return true;
  },

  deleteGroup: async (groupId) => {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) {
      alert(error.message);
      return false;
    }
    set((state) => ({ groups: state.groups.filter(g => g.id !== groupId) }));
    return true;
  },

  leaveGroup: async (groupId, userId) => {
    const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
    if (error) {
      alert(error.message);
      return false;
    }
    set((state) => ({ groups: state.groups.filter(g => g.id !== groupId) }));
    return true;
  },

  fetchGroupMembers: async (groupId) => {
    const { data } = await supabase
      .from('group_members')
      .select('*, user:users(*)')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });
      
    if (data) {
      return data;
    }
    return [];
  },

  addFriendToGroup: async (groupId, friendUserId) => {
    const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: friendUserId });
    if (error) {
       if (error.code === '23505') alert("Friend is already in this group!");
       else alert(error.message);
       return false;
    }
    alert("Friend added to group!");
    return true;
  },

  fetchFriends: async (userId) => {
    const { data } = await supabase
      .from('friends')
      .select('*, user1:users!friends_user1_id_fkey(*), user2:users!friends_user2_id_fkey(*)')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
      
    if (data) {
      const accepted: Friend[] = [];
      const pending: Friend[] = [];
      
      data.forEach(f => {
        // Assign the friend_user object to the person who is NOT me
        const friendObj = { ...f, friend_user: f.user1_id === userId ? f.user2 : f.user1 };
        
        if (f.status === 'accepted') {
          accepted.push(friendObj);
        } else if (f.status === 'pending' && f.user2_id === userId) {
          // Only show pending requests where I am the recipient (user2)
          pending.push(friendObj);
        }
      });
      
      set({ friends: accepted, pendingRequests: pending });
    }
  },

  sendFriendRequest: async (myUserId, friendPhone) => {
    // Find user by phone
    const { data: targetUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', friendPhone)
      .single();
      
    if (!targetUser) {
      return 'NOT_FOUND';
    }
    
    if (targetUser.id === myUserId) {
      return 'SELF';
    }
    
    const { error } = await supabase
      .from('friends')
      .insert({ user1_id: myUserId, user2_id: targetUser.id });
      
    if (error) {
       if (error.code === '23505') return 'EXISTS';
       alert(error.message);
       return 'ERROR';
    }
    
    alert("Friend request sent!");
    return 'SUCCESS';
  },

  acceptFriendRequest: async (friendshipId) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
      
    if (error) {
      alert(error.message);
    } else {
      // Refresh friends list. Assuming we have userId context in component
      // This will be handled by calling fetchFriends in the component after this succeeds.
    }
  },

  removeFriend: async (friendshipId) => {
    const { error } = await supabase.from('friends').delete().eq('id', friendshipId);
    if (error) {
      alert(error.message);
      return false;
    }
    set((state) => ({ friends: state.friends.filter(f => f.id !== friendshipId) }));
    return true;
  }
}));
