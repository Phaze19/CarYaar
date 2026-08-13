import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocialStore } from '../../store/useSocialStore';
import Feather from '@expo/vector-icons/Feather';

export default function GroupsScreen() {
  const { user } = useAuthStore();
  const { groups, fetchGroups, createGroup, joinGroup } = useSocialStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    if (user) await fetchGroups(user.id);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || !user) return;
    setIsProcessing(true);
    const group = await createGroup(user.id, newGroupName);
    if (group) {
      setNewGroupName('');
      Alert.alert("Success", `Group "${group.name}" created! Your invite code is ${group.invite_code}`);
    }
    setIsProcessing(false);
  };

  const handleJoinGroup = async () => {
    if (!inviteCode || !user) return;
    setIsProcessing(true);
    const success = await joinGroup(user.id, inviteCode);
    if (success) {
      setInviteCode('');
      Alert.alert("Success", "You joined the group!");
    }
    setIsProcessing(false);
  };

  const handleShareInvite = async (code: string | undefined) => {
    if (!code) return;
    try {
      await Share.share({
        message: `Join my carpool group on CarYaar!\nInvite Code: ${code}\nor click here: caryaar://group/invite/${code}`,
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 pt-16">
      <View className="px-6 pb-4">
        <Text className="text-4xl text-black" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Groups</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Create Group Section */}
        <View className="bg-white p-5 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
          <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Create New Group</Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Input 
                placeholder="e.g. Office Commute" 
                placeholderTextColor="#737373"
                value={newGroupName}
                onChangeText={setNewGroupName}
                className="border-2 border-black bg-white rounded-xl h-12 text-black px-3"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
              />
            </View>
            <Button 
              onPress={handleCreateGroup}
              isDisabled={isProcessing || !newGroupName}
              className="bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-12 px-4 rounded-xl justify-center items-center"
            >
              <Feather name="plus" size={20} color="black" />
            </Button>
          </View>
        </View>

        {/* Join Group Section */}
        <View className="bg-white p-5 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
          <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Join via Invite Code</Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Input 
                placeholder="Enter 6-digit code" 
                placeholderTextColor="#737373"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                className="border-2 border-black bg-white rounded-xl h-12 text-black px-3"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
              />
            </View>
            <Button 
              onPress={handleJoinGroup}
              isDisabled={isProcessing || !inviteCode}
              className="bg-green-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-12 px-4 rounded-xl justify-center items-center"
            >
              <Feather name="arrow-right" size={20} color="black" />
            </Button>
          </View>
        </View>

        {/* My Groups List */}
        <View className="mb-8">
          <Text className="text-black font-bold text-xl mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>My Groups</Text>
          {groups.length === 0 ? (
            <Text className="text-gray-500 text-center mt-4 font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>You are not in any groups yet.</Text>
          ) : (
            <View className="gap-3">
              {groups.map(group => (
                <View key={group.id} className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-black font-bold text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{group.name}</Text>
                    <Button 
                      size="sm"
                      onPress={() => handleShareInvite(group.invite_code)}
                      className="bg-gray-100 border-2 border-black rounded-lg h-10 px-3 flex-row items-center gap-2"
                    >
                      <Feather name="share" size={16} color="black" />
                      <Text className="text-black font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>Invite</Text>
                    </Button>
                  </View>
                  <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins_600SemiBold' }}>Invite Code: {group.invite_code}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
