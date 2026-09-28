import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const handleResetPassword = () => {
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      Alert.alert("Missing Email", "Please enter your registered email address.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      Alert.alert(
        "Link Sent!",
        `We have sent password reset instructions to ${email.trim()}.`
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Background decorations */}
        <View style={styles.backgroundCircleOne} />
        <View style={styles.backgroundCircleTwo} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedLink,
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </Pressable>

          {/* Icon Badge */}
          <View style={styles.iconContainer}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Text style={styles.iconSymbol}>🔑</Text>
              </View>
            </View>
          </View>

          {/* Header */}
          <Text style={styles.welcome}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive recovery instructions
          </Text>

          {/* Card */}
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠ {errorMessage}</Text>
              </View>
            ) : null}

            {submitted ? (
              <View style={styles.successCard}>
                <Text style={styles.successCheck}>✓</Text>
                <Text style={styles.successTitle}>Instructions Sent</Text>
                <Text style={styles.successSubtitle}>
                  Check your inbox at <Text style={styles.boldText}>{email}</Text> for the reset link.
                </Text>

                <Pressable
                  onPress={() => router.replace("/login")}
                  style={styles.backToLoginButton}
                >
                  <Text style={styles.loginText}>BACK TO LOGIN</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.label}>EMAIL ADDRESS</Text>

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

                {/* Reset Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <Pressable
                    onPress={handleResetPassword}
                    onPressIn={pressIn}
                    onPressOut={pressOut}
                    disabled={loading}
                    style={[
                      styles.resetButton,
                      loading && styles.buttonLoading,
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loginText}>SEND RESET LINK</Text>
                    )}
                  </Pressable>
                </Animated.View>
              </>
            )}

            {/* Back to sign in link */}
            <View style={styles.footerLinkContainer}>
              <Text style={styles.footerPromptText}>Remember your password?</Text>
              <Pressable
                onPress={() => router.back()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [pressed && styles.pressedLink]}
              >
                <Text style={styles.footerActionText}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
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
    justifyContent: "center",
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backButtonArrow: {
    color: "#35C8B7",
    fontSize: 18,
    marginRight: 6,
  },
  backButtonText: {
    color: "#35C8B7",
    fontSize: 13,
    fontWeight: "700",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 18,
  },
  iconOuter: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#102B45",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#285172",
  },
  iconInner: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#18A999",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#18A999",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  iconSymbol: {
    fontSize: 22,
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
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
    paddingHorizontal: 12,
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
    height: 57,
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
  resetButton: {
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
  loginText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 10,
  },
  footerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerPromptText: {
    color: "#718096",
    fontSize: 12,
  },
  footerActionText: {
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
  successCard: {
    alignItems: "center",
    paddingVertical: 16,
  },
  successCheck: {
    fontSize: 36,
    color: "#18A999",
    marginBottom: 8,
  },
  successTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  successSubtitle: {
    color: "#8D99A8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  boldText: {
    color: "#35C8B7",
    fontWeight: "700",
  },
  backToLoginButton: {
    height: 50,
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#18A999",
    justifyContent: "center",
    alignItems: "center",
  },
});
