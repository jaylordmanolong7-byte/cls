import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function DashboardScreen() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCardPress = (title: string, message: string) => {
    setActiveMenu(title);
    Alert.alert(title, message);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  const menuItems = [
    {
      id: "profile",
      title: "Profile",
      subtitle: "View & edit your personal info",
      icon: "👤",
      color: "#18A999",
      bgBadge: "#102D2B",
      action: () => handleCardPress("Profile", "Opening user profile settings..."),
    },
    {
      id: "messages",
      title: "Messages",
      subtitle: "3 unread notifications & chats",
      icon: "💬",
      color: "#38BDF8",
      bgBadge: "#0C2E46",
      badge: "3 NEW",
      action: () => handleCardPress("Messages", "You have 3 unread messages from your team."),
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "Preferences, privacy & security",
      icon: "⚙️",
      color: "#F59E0B",
      bgBadge: "#332611",
      action: () => handleCardPress("Settings", "Manage security and notification preferences."),
    },
    {
      id: "logout",
      title: "Logout",
      subtitle: "Securely end your session",
      icon: "🚪",
      color: "#F87171",
      bgBadge: "#35151A",
      action: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Ambience */}
      <View style={styles.backgroundCircleOne} />
      <View style={styles.backgroundCircleTwo} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Bar with Avatar */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.welcomeText}>Welcome, User!</Text>
              <Text style={styles.screenDescription}>
                Overview of your account, services, and quick navigation shortcuts.
              </Text>
            </View>

            {/* Profile Avatar */}
            <Pressable
              onPress={() => handleCardPress("Profile Avatar", "User Profile: Active Member")}
              style={({ pressed }) => [
                styles.avatarContainer,
                pressed && styles.pressedCard,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.avatarGlow}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
              <View style={styles.onlineBadge} />
            </Pressable>
          </View>

          {/* Quick Stats Banner */}
          <View style={styles.statsBanner}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>99.9%</Text>
              <Text style={styles.statLabel}>Security Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Active Modules</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>Online</Text>
              <Text style={styles.statLabel}>System State</Text>
            </View>
          </View>

          {/* Section Heading */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MENU ITEMS</Text>
            <Text style={styles.sectionSubtitle}>Tap a card to interact</Text>
          </View>

          {/* Grid/List of Menu Items */}
          <View style={styles.cardsContainer}>
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={item.action}
                style={({ pressed }) => [
                  styles.card,
                  activeMenu === item.title && styles.activeCard,
                  pressed && styles.pressedCard,
                ]}
              >
                <View
                  style={[
                    styles.cardIconWrapper,
                    { backgroundColor: item.bgBadge, borderColor: item.color },
                  ]}
                >
                  <Text style={styles.cardIconText}>{item.icon}</Text>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.cardHeaderLine}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.badge ? (
                      <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>{item.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>

                <Text style={styles.cardArrow}>›</Text>
              </Pressable>
            ))}
          </View>

          {/* Security / System Footer */}
          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              🔒 Secure Session · Encrypted Connection Active
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 36 : 16,
    paddingBottom: 40,
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  backgroundCircleOne: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#102A46",
    top: -120,
    right: -100,
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: 14,
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  screenDescription: {
    color: "#8D99A8",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarGlow: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#102B45",
    borderWidth: 2,
    borderColor: "#18A999",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#18A999",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarIcon: {
    fontSize: 24,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#07111F",
  },
  statsBanner: {
    flexDirection: "row",
    backgroundColor: "#101D2D",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1E344A",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: "#35C8B7",
    fontSize: 16,
    fontWeight: "800",
  },
  statLabel: {
    color: "#718096",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#203448",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: "#AAB5C3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  sectionSubtitle: {
    color: "#536275",
    fontSize: 11,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "#101D2D",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E344A",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  activeCard: {
    borderColor: "#18A999",
  },
  pressedCard: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  cardIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginRight: 14,
  },
  cardIconText: {
    fontSize: 20,
  },
  cardDetails: {
    flex: 1,
  },
  cardHeaderLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  itemBadge: {
    backgroundColor: "#0284C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: "#7D8494",
    fontSize: 12,
    marginTop: 2,
  },
  cardArrow: {
    color: "#475569",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
  },
  footerNote: {
    alignItems: "center",
    marginTop: 26,
    paddingVertical: 10,
  },
  footerNoteText: {
    color: "#536275",
    fontSize: 11,
    fontWeight: "500",
  },
});
