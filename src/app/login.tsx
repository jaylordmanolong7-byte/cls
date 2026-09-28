import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  // Logo floating animation
  const logoAnim = useRef(new Animated.Value(0)).current;

  // Button animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Login screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
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

    // Floating logo animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(logoAnim, {
          toValue: 6,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleLogin = () => {
    setErrorMessage("");
    setSuccessMessage("");

    setLoading(true);

    // Smooth transition into Dashboard (UI activity requirement)
    setTimeout(() => {
      setLoading(false);
      router.replace("/dashboard");
    }, 600);
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleBiometricLogin = () => {
    router.replace("/dashboard");
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Background decoration */}
        <View style={styles.backgroundCircleOne} />
        <View style={styles.backgroundCircleTwo} />
        <View style={styles.backgroundCircleThree} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ translateY: logoAnim }],
              },
            ]}
          >
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Text style={styles.logoIcon}>CLS</Text>
              </View>
            </View>
          </Animated.View>

          {/* Header */}
          <Text style={styles.welcome}>Welcome back</Text>

          {/* Brief description per guideline */}
          <Text style={styles.subtitle}>
            Sign in to your account to access your personal dashboard.
          </Text>

          {/* Login Card */}
          <View style={styles.card}>
            {/* Secure badge */}
            <View style={styles.secureBadge}>
              <Text style={styles.secureIcon}>✓</Text>
              <Text style={styles.secureText}>Secure connection</Text>
            </View>

            {/* Error or Success notification banner */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠ {errorMessage}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>✓ {successMessage}</Text>
              </View>
            ) : null}

            {/* Email / Username field per guideline */}
            <Text style={styles.label}>EMAIL / USERNAME</Text>

            <View
              style={[
                styles.inputContainer,
                email.length > 0 && styles.inputActive,
              ]}
            >
              <Text style={styles.inputIcon}>✉</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter email or username"
                placeholderTextColor="#7D8494"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage("");
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>PASSWORD</Text>

              <Pressable
                onPress={handleForgotPassword}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [
                  styles.forgotButton,
                  pressed && styles.pressedLink,
                ]}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.inputContainer,
                password.length > 0 && styles.inputActive,
              ]}
            >
              <Text style={styles.inputIcon}>●</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
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

            {/* "Login" Button per guideline */}
            <Animated.View
              style={{
                transform: [{ scale: buttonScale }],
              }}
            >
              <Pressable
                onPress={handleLogin}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={loading}
                style={({ pressed }) => [
                  styles.loginButton,
                  loading && styles.loginButtonLoading,
                  pressed && styles.loginButtonPressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginText}>Login</Text>
                )}
              </Pressable>
            </Animated.View>

            {/* Biometric */}
            <Pressable
              onPress={handleBiometricLogin}
              style={({ pressed }) => [
                styles.biometricButton,
                pressed && styles.pressedBiometric,
              ]}
            >
              <View style={styles.fingerprintCircle}>
                <Text style={styles.fingerprint}>◎</Text>
              </View>

              <View>
                <Text style={styles.biometricTitle}>
                  Sign in with biometrics
                </Text>

                <Text style={styles.biometricSubtitle}>
                  Face ID / Fingerprint
                </Text>
              </View>
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>OR</Text>

              <View style={styles.divider} />
            </View>

            {/* "Don't have an account? Sign Up" link per guideline */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>

              <Pressable
                onPress={handleSignUp}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [
                  styles.createAccountButton,
                  pressed && styles.pressedLink,
                ]}
              >
                <Text style={styles.createAccount}>Sign Up</Text>
              </Pressable>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🔒 Your information is protected
            </Text>
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

  // -------------------------
  // BACKGROUND
  // -------------------------

  backgroundCircleOne: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: "#102A46",
    top: -130,
    right: -130,
  },

  backgroundCircleTwo: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#0B2037",
    bottom: -100,
    left: -120,
  },

  backgroundCircleThree: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#123B5D",
    top: "35%",
    right: -50,
  },

  // -------------------------
  // LOGO
  // -------------------------

  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  logoOuter: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: "#102B45",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#285172",
  },

  logoInner: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#18A999",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#18A999",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  logoIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // -------------------------
  // HEADER
  // -------------------------

  welcome: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#8D99A8",
    textAlign: "center",
    fontSize: 14,
    marginTop: 7,
    marginBottom: 25,
  },

  // -------------------------
  // CARD
  // -------------------------

  card: {
    backgroundColor: "#101D2D",
    borderRadius: 26,
    padding: 23,
    borderWidth: 1,
    borderColor: "#1E344A",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 10,
  },

  secureBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#102D2B",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 22,
  },

  secureIcon: {
    color: "#18C5AE",
    fontSize: 12,
    fontWeight: "900",
    marginRight: 6,
  },

  secureText: {
    color: "#5ED5C7",
    fontSize: 11,
    fontWeight: "700",
  },

  // -------------------------
  // INPUT
  // -------------------------

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

  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 19,
  },

  forgotText: {
    color: "#35C8B7",
    fontSize: 11,
    fontWeight: "700",
  },

  showButton: {
    color: "#35C8B7",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // -------------------------
  // LOGIN BUTTON
  // -------------------------

  loginButton: {
    height: 57,
    borderRadius: 15,
    backgroundColor: "#18A999",
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#18A999",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },

  loginButtonLoading: {
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
    fontSize: 23,
    marginLeft: 12,
  },

  // -------------------------
  // BIOMETRIC
  // -------------------------

  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 8,
  },

  fingerprintCircle: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#162A3D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  fingerprint: {
    color: "#35C8B7",
    fontSize: 25,
  },

  biometricTitle: {
    color: "#D9E0E8",
    fontSize: 12,
    fontWeight: "700",
  },

  biometricSubtitle: {
    color: "#718096",
    fontSize: 10,
    marginTop: 2,
  },

  // -------------------------
  // DIVIDER
  // -------------------------

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#26384A",
  },

  dividerText: {
    color: "#657386",
    fontSize: 10,
    fontWeight: "700",
    marginHorizontal: 12,
  },

  // -------------------------
  // REGISTER
  // -------------------------

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  registerText: {
    color: "#718096",
    fontSize: 12,
  },

  createAccount: {
    color: "#35C8B7",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  // -------------------------
  // FOOTER
  // -------------------------

  footer: {
    alignItems: "center",
    marginTop: 18,
  },

  footerText: {
    color: "#536275",
    fontSize: 10,
  },

  // -------------------------
  // INTERACTIVE FEEDBACK & HELPERS
  // -------------------------

  pressedLink: {
    opacity: 0.6,
  },

  pressedBiometric: {
    opacity: 0.7,
  },

  loginButtonPressed: {
    opacity: 0.9,
  },

  forgotButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  createAccountButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
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

  successContainer: {
    backgroundColor: "rgba(24, 169, 153, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(24, 169, 153, 0.4)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  successText: {
    color: "#35C8B7",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
