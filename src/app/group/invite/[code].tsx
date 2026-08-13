import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';
import { useSocialStore } from '../../../store/useSocialStore';

export default function GroupInviteDeepLinkScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { joinGroup } = useSocialStore();
  
  const [status, setStatus] = useState('Joining group...');

  useEffect(() => {
    const handleJoin = async () => {
      if (!user) {
        setStatus('Please log in first.');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
        return;
      }
      
      if (!code) {
        setStatus('Invalid invite link.');
        setTimeout(() => {
          router.replace('/(tabs)/groups' as any);
        }, 1500);
        return;
      }

      setStatus(`Joining group ${code}...`);
      const success = await joinGroup(user.id, code);
      
      if (success) {
        setStatus('Joined successfully!');
      } else {
        setStatus('Could not join group. (Invalid code or already joined)');
      }
      
      setTimeout(() => {
        router.replace('/(tabs)/groups' as any);
      }, 1500);
    };

    handleJoin();
  }, [code, user]);

  return (
    <View className="flex-1 bg-yellow-400 items-center justify-center p-6">
      <View className="bg-white p-8 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] items-center">
        <ActivityIndicator size="large" color="#000000" className="mb-4" />
        <Text className="text-xl font-bold text-black text-center" style={{ fontFamily: 'RacingSansOne_400Regular' }}>
          {status}
        </Text>
      </View>
    </View>
  );
}
