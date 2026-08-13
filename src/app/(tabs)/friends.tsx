import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, Share } from 'react-native';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocialStore } from '../../store/useSocialStore';
import { useTripStore } from '../../store/useTripStore';
import Feather from '@expo/vector-icons/Feather';

export default function FriendsScreen() {
  const { user } = useAuthStore();
  const { friends, pendingRequests, fetchFriends, sendFriendRequest, acceptFriendRequest, removeFriend } = useSocialStore();
  const { balances, fetchBalances } = useTripStore();

  const [refreshing, setRefreshing] = useState(false);
  const [phoneToInvite, setPhoneToInvite] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadData = async () => {
    if (user) {
      await fetchFriends(user.id);
      await fetchBalances(user.id);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSendRequest = async () => {
    if (!phoneToInvite || !user) return;
    setIsSending(true);
    const result = await sendFriendRequest(user.id, phoneToInvite);

    if (result === 'SUCCESS') {
      setPhoneToInvite('');
      loadData();
    } else if (result === 'NOT_FOUND') {
      Alert.alert(
        "User Not Found",
        "This phone number is not registered on CarYaar. Would you like to invite them to download the app?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Invite",
            onPress: async () => {
              try {
                await Share.share({
                  message: `Hey! I'm using CarYaar to easily split carpool costs. Download the app here to join me:\n\nhttps://expo.dev/accounts/anuragvedak/projects/caryaar/builds/211d7175-ca8a-4a49-a29c-ab26af469091`
                });
              } catch (error: any) {
                alert(error.message);
              }
            }
          }
        ]
      );
    } else if (result === 'SELF') {
      alert("You cannot add yourself.");
    } else if (result === 'EXISTS') {
      alert("A friend request already exists between you two.");
    }

    setIsSending(false);
  };

  const handleAccept = async (friendshipId: string) => {
    await acceptFriendRequest(friendshipId);
    loadData();
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    await removeFriend(friendshipId);
    loadData();
  };

  return (
    <View className="flex-1 bg-gray-50 pt-16">
      <View className="px-6 pb-4">
        <Text className="text-4xl text-black" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Friends</Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Add Friend Section */}
        <View className="bg-white p-5 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
          <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Add a Friend</Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Input
                placeholder="Phone Number (e.g. 9999999999)"
                placeholderTextColor="#737373"
                value={phoneToInvite}
                onChangeText={setPhoneToInvite}
                keyboardType="phone-pad"
                className="border-2 border-black bg-white rounded-xl h-12 text-black px-3"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
              />
            </View>
            <Button
              onPress={handleSendRequest}
              isDisabled={isSending || !phoneToInvite}
              className="bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-12 px-4 rounded-xl justify-center items-center"
            >
              <Feather name="user-plus" size={20} color="black" />
            </Button>
          </View>
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View className="mb-8">
            <Text className="text-black font-bold text-xl mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Pending Requests</Text>
            <View className="gap-3">
              {pendingRequests.map(req => (
                <View key={req.id} className="bg-blue-100 p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-row justify-between items-center">
                  <View>
                    <Text className="text-black font-bold text-lg" style={{ fontFamily: 'Poppins_700Bold' }}>{req.friend_user?.name}</Text>
                    <Text className="text-gray-700 text-sm" style={{ fontFamily: 'Poppins_600SemiBold' }}>{req.friend_user?.phone}</Text>
                  </View>
                  <Button
                    size="sm"
                    onPress={() => handleAccept(req.id)}
                    className="bg-green-400 border-2 border-black rounded-xl"
                  >
                    <Text className="text-black font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>Accept</Text>
                  </Button>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* My Friends List */}
        <View className="mb-8">
          <Text className="text-black font-bold text-xl mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>My Friends</Text>
          {friends.length === 0 ? (
            <Text className="text-gray-500 text-center mt-4 font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>No friends added yet.</Text>
          ) : (
            <View className="gap-3">
              {friends.map(friend => {
                const memberBalance = balances.find(b => b.otherUserId === friend.friend_user?.id);
                const netAmount = memberBalance ? memberBalance.netAmount : 0;

                return (
                  <View key={friend.id} className="bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 bg-yellow-400 rounded-full border-2 border-black items-center justify-center">
                        <Feather name="user" size={20} color="black" />
                      </View>
                      <View>
                        <Text className="text-black font-bold text-lg" style={{ fontFamily: 'Poppins_700Bold' }}>{friend.friend_user?.name}</Text>
                        <Text className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins_600SemiBold' }}>{friend.friend_user?.phone}</Text>
                      </View>
                    </View>

                    <View className="items-end flex-row gap-3">
                      <View className="items-end justify-center mr-2">
                        {netAmount === 0 ? (
                          <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Poppins_700Bold' }}>Settled Up</Text>
                        ) : netAmount > 0 ? (
                          <Text className="text-green-600 text-xs" style={{ fontFamily: 'Poppins_700Bold' }}>Owes you ₹{netAmount.toFixed(2)}</Text>
                        ) : (
                          <Text className="text-red-600 text-xs" style={{ fontFamily: 'Poppins_700Bold' }}>You owe ₹{Math.abs(netAmount).toFixed(2)}</Text>
                        )}
                      </View>

                      <Button
                        size="sm"
                        onPress={() => handleRemoveFriend(friend.id)}
                        className="bg-red-100 border-2 border-black rounded-xl h-10 px-3 justify-center items-center"
                      >
                        <Feather name="trash-2" size={16} color="#dc2626" />
                      </Button>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
