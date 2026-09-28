import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleSignUp = () => {
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter a password.");
      Alert.alert("Missing Password", "Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      Alert.alert("Short Password", "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Account Created",
        "Your account has been registered successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/dashboard"),
          },
        ]
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Background ambience */}
        <View style={styles.backgroundCircleOne} />
        <View style={styles.backgroundCircleTwo} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header with App Logo & Title */}
            <View style={styles.header}>
              <View style={styles.logoOuter}>
                <View style={styles.logoInner}>
                  <Text style={styles.logoIcon}>CLS</Text>
                </View>
              </View>
              <Text style={styles.welcome}>Create Account</Text>
              {/* Brief description per guideline */}
              <Text style={styles.subtitle}>
                Fill in your details below to set up your new account and get started.
              </Text>
            </View>

            {/* Sign Up Card */}
            <View style={styles.card}>
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠ {errorMessage}</Text>
                </View>
              ) : null}

              {/* Name field */}
              <Text style={styles.label}>FULL NAME</Text>
              <View
                style={[
                  styles.inputContainer,
                  name.length > 0 && styles.inputActive,
                ]}
              >
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#7D8494"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  autoCapitalize="words"
                />
              </View>

              {/* Email field */}
              <Text style={[styles.label, { marginTop: 16 }]}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.inputContainer,
                  email.length > 0 && styles.inputActive,
                ]}
              >
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#7D8494"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password field */}
              <Text style={[styles.label, { marginTop: 16 }]}>PASSWORD</Text>
              <View
                style={[
                  styles.inputContainer,
                  password.length > 0 && styles.inputActive,
                ]}
              >
                <Text style={styles.inputIcon}>●</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#7D8494"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={({ pressed }) => [pressed && styles.pressedLink]}
                >
                  <Text style={styles.showButton}>
                    {showPassword ? "HIDE" : "SHOW"}
                  </Text>
                </Pressable>
              </View>

              {/* Confirm password field */}
              <Text style={[styles.label, { marginTop: 16 }]}>CONFIRM PASSWORD</Text>
              <View
                style={[
                  styles.inputContainer,
                  confirmPassword.length > 0 && styles.inputActive,
                ]}
              >
                <Text style={styles.inputIcon}>●</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#7D8494"
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>

              {/* "Sign Up" button per guideline */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  onPress={handleSignUp}
                  onPressIn={pressIn}
                  onPressOut={pressOut}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.signUpButton,
                    loading && styles.buttonLoading,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                  )}
                </Pressable>
              </Animated.View>

              {/* "Already have an account? Login" link per guideline */}
              <View style={styles.loginLinkRow}>
                <Text style={styles.alreadyText}>Already have an account?</Text>
                <Pressable
                  onPress={() => router.replace("/login")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={({ pressed }) => [pressed && styles.pressedLink]}
                >
                  <Text style={styles.loginLink}>Login</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },
  content: {
    width: "90%",
    maxWidth: 430,
    alignSelf: "center",
  },
  backgroundCircleOne: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#102A46",
    top: -100,
    right: -100,
  },
  backgroundCircleTwo: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#0B2037",
    bottom: -80,
    left: -100,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoOuter: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#102B45",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#285172",
    marginBottom: 14,
  },
  logoInner: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#18A999",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#18A999",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  logoIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  welcome: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#8D99A8",
    textAlign: "center",
    fontSize: 13,
    marginTop: 6,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#101D2D",
    borderRadius: 26,
    padding: 23,
    borderWidth: 1,
    borderColor: "#1E344A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 10,
  },
  label: {
    color: "#AAB5C3",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputContainer: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#0B1726",
    borderWidth: 1,
    borderColor: "#23394D",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  inputActive: {
    borderColor: "#18A999",
  },
  inputIcon: {
    color: "#718096",
    fontSize: 17,
    width: 28,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    height: "100%",
  },
  showButton: {
    color: "#35C8B7",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  signUpButton: {
    height: 57,
    borderRadius: 15,
    backgroundColor: "#18A999",
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#18A999",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },
  buttonLoading: {
    opacity: 0.75,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 10,
  },
  loginLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  alreadyText: {
    color: "#718096",
    fontSize: 12,
  },
  loginLink: {
    color: "#35C8B7",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },
  pressedLink: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorText: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
