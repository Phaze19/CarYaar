import React, { useEffect } from 'react';
import { View, Text, Dimensions, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring, 
  runOnJS,
  Easing
} from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';

const { width } = Dimensions.get('window');

interface AnimatedSplashProps {
  onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  // Logo (CN) animations
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);

  // Text (CARYAAR) animations
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.5);

  // Car animations
  const carOpacity = useSharedValue(0);
  const carTranslateX = useSharedValue(-50); // Start slightly left
  const carScale = useSharedValue(0.5);

  useEffect(() => {
    // 1. Scale up the logo
    logoScale.value = withTiming(1.5, { duration: 800, easing: Easing.out(Easing.exp) });
    
    // 2. Fade out logo, fade in text
    logoOpacity.value = withDelay(800, withTiming(0, { duration: 400 }));
    textOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    textScale.value = withDelay(1000, withSpring(1, { damping: 12 }));

    // 3. Fade out text, fade in car
    textOpacity.value = withDelay(2500, withTiming(0, { duration: 400 }));
    carOpacity.value = withDelay(2700, withTiming(1, { duration: 400 }));
    carScale.value = withDelay(2700, withSpring(1, { damping: 10 }));
    
    // 4. Drive car off screen
    carTranslateX.value = withDelay(
      3200, 
      withTiming(width + 100, { duration: 800, easing: Easing.in(Easing.exp) }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
    position: 'absolute',
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
    position: 'absolute',
  }));

  const carStyle = useAnimatedStyle(() => ({
    opacity: carOpacity.value,
    transform: [
      { translateX: carTranslateX.value },
      { scale: carScale.value }
    ],
    position: 'absolute',
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* CN Logo Image */}
      <Animated.View style={logoStyle}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={{ width: 120, height: 120, resizeMode: 'contain' }}
        />
      </Animated.View>

      {/* CARYAAR Text */}
      <Animated.View style={textStyle}>
        <Text style={{ 
          fontFamily: 'Poppins_700Bold', 
          fontSize: 50, 
          color: '#ef4444', // red-500 to match app theme
          letterSpacing: 2,
          textShadowColor: 'rgba(255, 255, 255, 0.2)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 8,
        }}>
          CARYAAR
        </Text>
      </Animated.View>

      {/* Driving Car */}
      <Animated.View style={carStyle}>
        <View style={{ 
          width: 80, 
          height: 80, 
          backgroundColor: '#ef4444', 
          borderRadius: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 4,
          borderColor: '#ffffff'
        }}>
          <Feather name="truck" size={40} color="#ffffff" />
        </View>
      </Animated.View>
      
    </View>
  );
}
