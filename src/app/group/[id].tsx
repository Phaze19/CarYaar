import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Share, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocialStore } from '../../store/useSocialStore';
import { useTripStore } from '../../store/useTripStore';
import { GroupMember } from '../../types';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { user } = useAuthStore();
  const { groups, fetchGroupMembers, addFriendToGroup, friends, fetchFriends, deleteGroup, leaveGroup } = useSocialStore();
  const { balances, fetchBalances } = useTripStore();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const group = groups.find(g => g.id === id);

  const loadData = async () => {
    if (id && user) {
      const data = await fetchGroupMembers(id);
      setMembers(data);
      await fetchBalances(user.id);
      await fetchFriends(user.id);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleShareInvite = async () => {
    if (!group?.invite_code) return;
    try {
      await Share.share({
        message: `Join my carpool group "${group.name}" on CarYaar!\nInvite Code: ${group.invite_code}\n\nTap to join instantly (if you have the app):\ncaryaar://group/invite/${group.invite_code}\n\nDownload the app here: https://expo.dev/accounts/anuragvedak/projects/caryaar/builds/211d7175-ca8a-4a49-a29c-ab26af469091`
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    if (!id) return;
    const success = await addFriendToGroup(id, friendId);
    if (success) {
      await loadData();
    }
  };

  const handleDeleteGroup = async () => {
    if (!id) return;
    const success = await deleteGroup(id);
    if (success) {
      router.back();
    }
  };

  const handleLeaveGroup = async () => {
    if (!id || !user) return;
    const success = await leaveGroup(id, user.id);
    if (success) {
      router.back();
    }
  };

  if (!group) {
    return (
      <View className="flex-1 bg-gray-50 pt-16 px-6">
        <Text className="text-black text-xl">Group not found.</Text>
        <Button onPress={() => router.back()} className="mt-4 bg-yellow-400 rounded-xl h-12 justify-center items-center">
          <Text className="text-black font-bold">Go Back</Text>
        </Button>
      </View>
    );
  }

  // Find friends who are not already in the group
  const memberUserIds = new Set(members.map(m => m.user_id));
  const friendsToInvite = friends.filter(f => f.friend_user && !memberUserIds.has(f.friend_user.id));

  return (
    <View className="flex-1 bg-gray-50 pt-16">
      <View className="px-6 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Feather name="arrow-left" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-3xl text-black flex-1" numberOfLines={1} style={{ fontFamily: 'RacingSansOne_400Regular' }}>
            {group.name}
          </Text>
        </View>
        <Button
          size="sm"
          onPress={handleShareInvite}
          className="bg-green-400 border-2 border-black rounded-xl h-10 px-3 flex-row items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ml-2"
        >
          <Feather name="share" size={16} color="black" />
        </Button>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="bg-white p-5 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
          <Text className="text-black font-bold text-lg mb-1" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Invite Code</Text>
          <Text className="text-4xl text-center tracking-widest my-2" style={{ fontFamily: 'Poppins_700Bold' }}>
            {group.invite_code}
          </Text>
        </View>

        <Text className="text-black font-bold text-2xl mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Members & Balances</Text>

        <View className="gap-3 mb-8">
          {members.map(member => {
            const isMe = member.user_id === user?.id;
            const memberBalance = balances.find(b => b.otherUserId === member.user_id);
            const netAmount = memberBalance ? memberBalance.netAmount : 0;

            return (
              <View key={member.id} className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-row justify-between items-center">
                <View>
                  <Text className="text-black font-bold text-lg" style={{ fontFamily: 'Poppins_700Bold' }}>
                    {member.user?.name || 'Unknown'} {isMe && '(You)'}
                  </Text>
                  {!isMe && (
                    <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                {!isMe && (
                  <View className="items-end">
                    {netAmount === 0 ? (
                      <Text className="text-gray-500" style={{ fontFamily: 'Poppins_700Bold' }}>Settled Up</Text>
                    ) : netAmount > 0 ? (
                      <Text className="text-green-600" style={{ fontFamily: 'Poppins_700Bold' }}>Owes you ₹{netAmount.toFixed(2)}</Text>
                    ) : (
                      <Text className="text-red-600" style={{ fontFamily: 'Poppins_700Bold' }}>You owe ₹{Math.abs(netAmount).toFixed(2)}</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text className="text-black font-bold text-2xl mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Add Friends</Text>

        {friendsToInvite.length === 0 ? (
          <Text className="text-gray-500 font-bold mb-8" style={{ fontFamily: 'Poppins_600SemiBold' }}>All your friends are already in this group.</Text>
        ) : (
          <View className="gap-3 mb-8">
            {friendsToInvite.map(friend => (
              <View key={friend.id} className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-row justify-between items-center">
                <Text className="text-black font-bold text-lg" style={{ fontFamily: 'Poppins_700Bold' }}>
                  {friend.friend_user?.name}
                </Text>
                <Button
                  size="sm"
                  onPress={() => handleAddFriend(friend.friend_user!.id)}
                  className="bg-yellow-400 border-2 border-black rounded-lg h-10 px-4 justify-center items-center"
                >
                  <Text className="text-black font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>Add</Text>
                </Button>
              </View>
            ))}
          </View>
        )}

        <View className="mb-12 mt-4">
          {group.created_by === user?.id ? (
            <Button
              onPress={handleDeleteGroup}
              className="w-full bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16"
            >
              <Text className="text-white text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Delete Group</Text>
            </Button>
          ) : (
            <Button
              onPress={handleLeaveGroup}
              className="w-full bg-red-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16"
            >
              <Text className="text-red-600 text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Leave Group</Text>
            </Button>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
