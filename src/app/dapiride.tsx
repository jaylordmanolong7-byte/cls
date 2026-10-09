import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#F4F7F0',
  white: '#FFFFFF',
  green: '#174C3E',
  green2: '#236452',
  dark: '#12392F',
  sage: '#E5EFE5',
  pale: '#F8FAF5',
  gold: '#B49A64',
  text: '#263A32',
  muted: '#78847D',
  border: '#DFE6DE',
  red: '#B64C45',
  lightRed: '#FFF1EF',
  blue: '#477D87',
};

type Role = 'Passenger' | 'Driver';
type Page =
  | 'splash' | 'welcome' | 'login' | 'register'
  | 'passenger-home' | 'passenger-rides' | 'passenger-notifications' | 'passenger-profile'
  | 'driver-home' | 'driver-requests' | 'driver-notifications' | 'driver-profile';
type RideTab = 'Active' | 'Upcoming' | 'History';
type Booking = { id: string; passengerEmail: string; passengerName: string; pickup: string; destination: string; rideType: 'Individual' | 'Shared'; fare: number | null; status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled'; createdAt: string };

function Brand({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.brand, small ? styles.brandSmall : styles.brandLarge]}>
      <Image
        source={require('../../assets/dapiride-logo.png')}
        style={small ? styles.brandImageSmall : styles.brandImage}
        resizeMode="contain"
        accessibilityLabel="DapiRide Transport Services logo"
      />
      {small && <Text style={styles.brandTag}>TRANSPORT SERVICES</Text>}
    </View>
  );
}

function Button({
  title, onPress, secondary = false, danger = false,
}: {
  title: string; onPress: () => void; secondary?: boolean; danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        danger && styles.buttonDanger,
        pressed && { opacity: 0.78 },
      ]}
    >
      <Text style={[
        styles.buttonText,
        secondary && styles.buttonSecondaryText,
        danger && { color: C.red },
      ]}>{title}</Text>
    </Pressable>
  );
}

function Field({
  label, value, onChangeText, placeholder, secure = false, keyboardType = 'default',
}: {
  label: string; value: string; onChangeText: (s: string) => void;
  placeholder: string; secure?: boolean; keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={false}
        blurOnSubmit={false}
        underlineColorAndroid="transparent"
        style={styles.input}
      />
    </View>
  );
}

function RolePicker({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  return (
    <View style={styles.roleRow}>
      {(['Passenger', 'Driver'] as Role[]).map((r) => (
        <Pressable
          key={r}
          onPress={() => setRole(r)}
          style={[styles.roleOption, role === r && styles.roleOptionSelected]}
        >
          <Text style={[styles.roleName, role === r && { color: C.green }]}>{r}</Text>
          <Text style={styles.roleHint}>
            {r === 'Passenger' ? 'Book local transport' : 'Manage ride requests'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Header({
  title, subtitle, onBack,
}: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <View style={styles.pageHeader}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
      )}
      <View style={styles.pageHeaderText}>
        <Text style={styles.pageTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function SectionTitle({ title, action, onAction }: {
  title: string; action?: string; onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!action && !!onAction && (
        <Pressable onPress={onAction}><Text style={styles.link}>{action}</Text></Pressable>
      )}
    </View>
  );
}

function BottomNav({ page, go, role }: {
  page: Page; go: (p: Page) => void; role: Role;
}) {
  const items: { title: string; target: Page; marker: string }[] = role === 'Passenger'
    ? [
      { title: 'Home', target: 'passenger-home', marker: '⌂' },
      { title: 'My Rides', target: 'passenger-rides', marker: '▤' },
      { title: 'Alerts', target: 'passenger-notifications', marker: '♧' },
      { title: 'Profile', target: 'passenger-profile', marker: '○' },
    ]
    : [
      { title: 'Home', target: 'driver-home', marker: '⌂' },
      { title: 'Requests', target: 'driver-requests', marker: '▤' },
      { title: 'Alerts', target: 'driver-notifications', marker: '♧' },
      { title: 'Profile', target: 'driver-profile', marker: '○' },
    ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const active = item.target === page;
        return (
          <Pressable key={item.title} style={styles.navItem} onPress={() => go(item.target)}>
            <Text style={[styles.navIcon, active && styles.navActive]}>{item.marker}</Text>
            <Text style={[styles.navText, active && styles.navActive]}>{item.title}</Text>
            {active && <View style={styles.navDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function App() {
  const [page, setPage] = useState<Page>('splash');
  const [role, setRole] = useState<Role>('Passenger');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [rideType, setRideType] = useState<'Individual' | 'Shared'>('Individual');
  const [rideTab, setRideTab] = useState<RideTab>('Active');
  const [online, setOnline] = useState(true);
  const [requestStatus, setRequestStatus] = useState<'Pending' | 'Accepted' | 'Declined'>('Pending');
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingReady, setBookingReady] = useState(false);
  const [driverFareInput, setDriverFareInput] = useState('');
  type StoredAccount = { fullName: string; email: string; phone: string; password: string; role: Role };
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('dapiride_accounts_v1');
        if (saved && mounted) setAccounts(JSON.parse(saved) as StoredAccount[]);
      } catch {
        Alert.alert('Storage issue', 'Saved demo accounts could not be loaded on this device.');
      } finally {
        if (mounted) setAuthReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('dapiride_bookings_v1');
        if (saved && mounted) setBookings(JSON.parse(saved) as Booking[]);
      } catch {
        Alert.alert('Storage issue', 'Saved demo bookings could not be loaded on this device.');
      } finally {
        if (mounted) setBookingReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const saveBookings = async (updated: Booking[]) => {
    await AsyncStorage.setItem('dapiride_bookings_v1', JSON.stringify(updated));
    setBookings(updated);
  };

  const goDashboard = () => setPage(role === 'Passenger' ? 'passenger-home' : 'driver-home');
  const signOut = () => {
    setPassword('');
    setPage('welcome');
  };

  const submitAuth = async () => {
    if (!authReady) {
      Alert.alert('Please wait', 'Your saved accounts are still loading. Try again in a moment.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      Alert.alert('Required information', 'Please enter your email address and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    if (page === 'register') {
      if (!fullName.trim() || !phone.trim()) {
        Alert.alert('Missing details', 'Please enter your full name and mobile number.');
        return;
      }
      const existing = accounts.find((account) => account.email === cleanEmail);
      if (existing) {
        Alert.alert('Account already exists', 'An account with this email already exists. Please log in instead.');
        return;
      }
      const newAccount: StoredAccount = {
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password,
        role,
      };
      const updatedAccounts = [...accounts, newAccount];
      try {
        await AsyncStorage.setItem('dapiride_accounts_v1', JSON.stringify(updatedAccounts));
        setAccounts(updatedAccounts);
        setEmail(cleanEmail);
        Alert.alert(
          'Account created',
          'Your demo account has been saved on this device. You can log in with this email and password.',
          [{ text: 'Continue to login', onPress: () => { setPassword(''); setPage('login'); } }],
        );
      } catch {
        Alert.alert('Could not save account', 'Storage failed. Please check your device and try again.');
      }
      return;
    }

    const matchingAccount = accounts.find(
      (account) => account.email === cleanEmail && account.password === password && account.role === role,
    );
    if (!matchingAccount) {
      Alert.alert('Sign-in failed', 'The email, password, or account type does not match a saved account.');
      return;
    }
    setFullName(matchingAccount.fullName);
    setPhone(matchingAccount.phone);
    setRole(matchingAccount.role);
    setPage(matchingAccount.role === 'Passenger' ? 'passenger-home' : 'driver-home');
  };

  const createBooking = () => {
    if (!bookingReady) {
      Alert.alert('Please wait', 'Your saved rides are still loading. Try again in a moment.');
      return;
    }
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert('Trip details needed', 'Enter both your pickup location and destination.');
      return;
    }
    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      Alert.alert('Check your locations', 'Pickup and destination should be different.');
      return;
    }
    Alert.alert(
      'Confirm your booking',
      `${rideType} tricycle ride\n\nPickup: ${pickup.trim()}\nDestination: ${destination.trim()}\nFare: To be set by the driver\n\nSend this ride request to a driver?`,
      [
        { text: 'Edit details', style: 'cancel' },
        { text: 'Confirm booking', onPress: () => {
          void (async () => {
            const booking: Booking = {
              id: `DR-${Date.now().toString().slice(-8)}`,
              passengerEmail: email.trim().toLowerCase() || 'guest@dapiride.local',
              passengerName: fullName.trim() || 'Guest Passenger',
              pickup: pickup.trim(),
              destination: destination.trim(),
              rideType,
              fare: null,
              status: 'Pending',
              createdAt: new Date().toISOString(),
            };
            try {
              const updated = [booking, ...bookings];
              await saveBookings(updated);
              setRideTab('Active');
              setPage('passenger-rides');
              Alert.alert('Booking submitted', `Your ride request ${booking.id} is saved. The driver will set the fare when accepting the request. This demo request is stored on this device and is not sent to a live driver.`);
            } catch {
              Alert.alert('Booking could not be saved', 'Please try again. Check that AsyncStorage is installed.');
            }
          })();
        } },
      ],
    );
  };

  const renderSplash = () => (
    <View style={styles.splash}>
      <View style={styles.splashSky} />
      <Image
        source={require('../../assets/dapiride-logo.png')}
        style={styles.splashLogoImage}
        resizeMode="contain"
        accessibilityLabel="DapiRide Transport Services logo"
      />
      <Text style={styles.splashTagline}>Safe Rides. Stronger Community.</Text>
      <View style={styles.splashPhotoFrame}>
        <Image
          source={require('../../assets/dapiride-hero.png')}
          style={styles.splashPhoto}
          resizeMode="cover"
          accessibilityLabel="Green and gold tricycle beside the coast"
        />
      </View>
      <View style={styles.splashGreenFooter}>
        <View style={styles.splashWaveBack} />
        <View style={styles.splashWaveFront} />
        <View style={styles.splashBottom}>
          <Text style={styles.pin}>⌖</Text>
          <Text style={styles.splashCity}>Dapitan City</Text>
        </View>
        <Pressable onPress={() => setPage('welcome')} style={styles.splashContinue} accessibilityRole="button" accessibilityLabel="Continue to DapiRide welcome screen">
          <Text style={styles.splashContinueText}>Tap to continue</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderWelcome = () => (
    <ScrollView contentContainerStyle={styles.welcomePage} keyboardShouldPersistTaps="handled">
      <Brand />
      <View style={styles.hero}>
        <View style={styles.eyebrow}><View style={styles.goldLine} /><Text style={styles.eyebrowText}>COMMUNITY TRANSPORTATION</Text></View>
        <Text style={styles.heroTitle}>Welcome to{'\n'}DapiRide!</Text>
        <Text style={styles.heroCopy}>Your reliable tricycle transportation companion in Dapitan City.</Text>
        <View style={styles.heroPhotoFrame}>
          <Image
            source={require('../../assets/dapiride-hero.png')}
            style={styles.heroPhoto}
            resizeMode="cover"
            accessibilityLabel="Green and gold tricycle on a scenic coastal road in Dapitan City"
          />
        </View>
      </View>
      <Button title="Create Account" onPress={() => setPage('register')} />
      <View style={{ height: 12 }} />
      <Button title="I already have an account" secondary onPress={() => setPage('login')} />
      <Pressable onPress={() => { setRole('Passenger'); setPage('passenger-home'); }} style={styles.guestButton}>
        <Text style={styles.link}>Continue as Guest</Text>
      </Pressable>
      <Text style={styles.footer}>DapiRide · Dapitan City</Text>
    </ScrollView>
  );

  const renderAuth = () => {
    const registering = page === 'register';
    return (
      <ScrollView
        contentContainerStyle={styles.authPage}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <Brand />
        <Header
          title={registering ? 'Create Account' : 'Welcome Back'}
          subtitle={registering ? 'Join DapiRide for convenient local transport.' : 'Sign in to access your DapiRide transportation services.'}
          onBack={() => setPage('welcome')}
        />
        <View style={styles.authCard}>
          <Text style={styles.cardEyebrow}>{registering ? 'ACCOUNT REGISTRATION' : 'ACCOUNT SIGN IN'}</Text>
          <View style={styles.hairline} />
          <Text style={styles.label}>ACCOUNT TYPE</Text>
          <RolePicker role={role} setRole={setRole} />
          {registering && <Field label="FULL NAME" value={fullName} onChangeText={setFullName} placeholder="Enter your full name" />}
          <Field label="EMAIL ADDRESS" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" />
          {registering && <Field label="MOBILE NUMBER" value={phone} onChangeText={setPhone} placeholder="+63 9XX XXX XXXX" keyboardType="phone-pad" />}
          <Field label="PASSWORD" value={password} onChangeText={setPassword} placeholder="Enter your password" secure />
          {!registering && (
            <Pressable style={styles.forgot} onPress={() => Alert.alert('Forgot password?', 'Password recovery will be added with authentication.')}>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>
          )}
          <Button title={registering ? 'Create Account' : 'Login'} onPress={submitAuth} />
          <View style={styles.authSwitch}>
            <Text style={styles.muted}> {registering ? 'Already have an account? ' : "Don't have an account? "}</Text>
            <Pressable onPress={() => { setPassword(''); setPage(registering ? 'login' : 'register'); }}>
              <Text style={styles.link}>{registering ? 'Login' : 'Register'}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>i</Text>
          <Text style={styles.noticeText}>Demo accounts are saved on this device. For production use, connect a secure authentication service.</Text>
        </View>
      </ScrollView>
    );
  };

  const renderPassengerHome = () => (
    <ScrollView contentContainerStyle={styles.dashboardPage} keyboardShouldPersistTaps="handled" keyboardDismissMode="none">
      <View style={styles.topBar}>
        <Pressable onPress={() => Alert.alert('Menu', 'Use the bottom navigation to open your account sections.')}><Text style={styles.menuGlyph}>☰</Text></Pressable>
        <Brand small />
        <Pressable onPress={() => { setNotificationsRead(false); setPage('passenger-notifications'); }} style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>{fullName ? fullName.charAt(0).toUpperCase() : 'J'}</Text>
        </Pressable>
      </View>
      <Text style={styles.greeting}>Good morning,</Text>
      <Text style={styles.dashboardTitle}>{fullName || 'Passenger'}</Text>
      <Text style={styles.bodyCopy}>Where would you like to go today?</Text>

      <View style={styles.locationCard}>
        <Text style={styles.locationLabel}>PICKUP LOCATION</Text>
        <View style={styles.locationInputRow}><Text style={styles.locationSymbol}>●</Text><TextInput value={pickup} onChangeText={setPickup} placeholder="Select pickup location" placeholderTextColor={C.muted} style={styles.locationTextInput} blurOnSubmit={false} returnKeyType="next" /></View>
        <View style={styles.hairline} />
        <Text style={styles.locationLabel}>DESTINATION</Text>
        <View style={styles.locationInputRow}><Text style={styles.locationSymbol}>●</Text><TextInput value={destination} onChangeText={setDestination} placeholder="Select destination" placeholderTextColor={C.muted} style={styles.locationTextInput} blurOnSubmit={false} returnKeyType="done" /></View>
      </View>

      <View style={styles.fareBanner}><View style={{ flex: 1 }}><Text style={styles.fareLabel}>FARE SET BY DRIVER</Text><Text style={styles.fareHint}>The driver will enter the fare before accepting your request.</Text></View><Text style={styles.fareAmount}>—</Text></View>
      <Button title="Request a Ride" onPress={createBooking} />
      <SectionTitle title="Ride Type" />
      <View style={styles.rideOptions}>
        {(['Individual', 'Shared'] as const).map((type) => (
          <Pressable key={type} onPress={() => setRideType(type)} style={[styles.rideOption, rideType === type && styles.rideOptionActive]}>
            <Text style={[styles.rideOptionTitle, rideType === type && { color: C.green }]}>{rideType === type ? '●' : '○'}  {type}</Text>
            <Text style={styles.smallMuted}>{type === 'Individual' ? 'Reserve the tricycle' : 'Share with other passengers'}</Text>
          </Pressable>
        ))}
      </View>
      <SectionTitle title="Quick Actions" />
      <View style={styles.quickRow}>
        <Pressable style={styles.quickCard} onPress={() => Alert.alert('Schedule Ride', 'Scheduled rides will be connected to the booking service.')}><Text style={styles.quickIcon}>▦</Text><Text style={styles.quickTitle}>Schedule Ride</Text></Pressable>
        <Pressable style={styles.quickCard} onPress={() => { setRideTab('History'); setPage('passenger-rides'); }}><Text style={styles.quickIcon}>◷</Text><Text style={styles.quickTitle}>Ride History</Text></Pressable>
      </View>
    </ScrollView>
  );

  const renderPassengerRides = () => {
    const rideTabs: RideTab[] = ['Active', 'Upcoming', 'History'];
    return (
      <ScrollView contentContainerStyle={styles.dashboardPage}>
        <Header title="My Rides" subtitle="Manage your journeys" />
        <View style={styles.segment}>
          {rideTabs.map((tab) => <Pressable key={tab} onPress={() => setRideTab(tab)} style={[styles.segmentItem, rideTab === tab && styles.segmentActive]}><Text style={[styles.segmentText, rideTab === tab && styles.segmentTextActive]}>{tab}</Text></Pressable>)}
        </View>
        {(() => {
          const myBookings = bookings.filter((b) => b.passengerEmail === (email.trim().toLowerCase() || 'guest@dapiride.local'));
          const visibleBookings = rideTab === 'Active'
            ? myBookings.filter((b) => b.status === 'Pending' || b.status === 'Accepted')
            : rideTab === 'Upcoming' ? [] : myBookings.filter((b) => b.status === 'Completed' || b.status === 'Cancelled');
          if (visibleBookings.length === 0) {
            return <View style={styles.emptyCard}><Text style={styles.emptyTitle}>{rideTab === 'Active' ? 'No active rides' : rideTab === 'Upcoming' ? 'No scheduled rides' : 'No ride history yet'}</Text><Text style={styles.bodyCopy}>{rideTab === 'Active' ? 'Book a tricycle and your request will appear here.' : rideTab === 'Upcoming' ? 'Scheduled bookings will appear here when scheduling is added.' : 'Completed and cancelled trips will appear here.'}</Text><Button title="Request a Ride" onPress={() => setPage('passenger-home')} /></View>;
          }
          return visibleBookings.map((booking) => (
            <View key={booking.id} style={styles.rideCard}>
              <View style={styles.rowBetween}><Text style={styles.statusPill}>●  {booking.status}</Text><Text style={styles.smallMuted}>{booking.id}</Text></View>
              <Text style={styles.rideMainTitle}>{booking.pickup} → {booking.destination}</Text>
              <Text style={styles.bodyCopy}>{booking.rideType} tricycle ride</Text>
              <View style={styles.hairline} />
              <View style={styles.rowBetween}><Text style={styles.smallMuted}>Fare</Text><Text style={styles.valueText}>{typeof booking.fare === 'number' ? `₱${booking.fare.toFixed(2)}` : 'Waiting for driver to set fare'}</Text></View>
              <View style={styles.rowBetween}><Text style={styles.smallMuted}>Driver assignment</Text><Text style={styles.valueText}>{booking.status === 'Accepted' ? 'Accepted (demo)' : 'Not assigned'}</Text></View>
              <View style={styles.rowBetween}><Text style={styles.smallMuted}>Requested</Text><Text style={styles.valueText}>{new Date(booking.createdAt).toLocaleDateString()}</Text></View>
              {booking.status === 'Pending' && <Button title="Cancel Request" danger secondary onPress={() => Alert.alert('Cancel ride?', 'Do you want to cancel this booking request?', [{ text: 'Keep ride', style: 'cancel' }, { text: 'Cancel booking', style: 'destructive', onPress: () => { void saveBookings(bookings.map((b) => b.id === booking.id ? { ...b, status: 'Cancelled' } : b)); } }])} />}
            </View>
          ));
        })()}
      </ScrollView>
    );
  };

  const renderNotifications = (driver: boolean) => {
    const notifications = driver
      ? [
        ['New Ride Request', 'A passenger is requesting a ride.', '10:24 AM', '●'],
        ['Ride Assigned', 'You have been assigned a ride.', '10:18 AM', '▣'],
        ['Pickup Reminder', 'Please proceed to the pickup point.', '10:12 AM', '↗'],
        ['Trip Completed', 'Your trip has been recorded.', 'Yesterday', '✓'],
        ['System Update', 'New driver features are available.', 'Apr 10', 'i'],
      ]
      : [
        ['Booking Confirmed', 'Your ride request has been recorded.', '10:24 AM', '✓'],
        ['Driver Assigned', 'Driver details will appear once assigned.', '10:18 AM', '▣'],
        ['Arriving Soon', 'Your driver arrival update will appear here.', '10:12 AM', '↗'],
        ['Scheduled Ride Reminder', 'A reminder will appear before pickup.', 'Yesterday', '◷'],
        ['Trip Completed', 'Thank you for using DapiRide!', 'Apr 10', '✓'],
      ];
    return (
      <ScrollView contentContainerStyle={styles.dashboardPage}>
        <Header title="Notifications" subtitle="Stay updated on your rides" />
        <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Recent updates</Text><Pressable onPress={() => setNotificationsRead(true)}><Text style={styles.link}>Mark all read</Text></Pressable></View>
        {notifications.map((n, i) => (
          <View key={n[0]} style={[styles.notificationCard, notificationsRead && { opacity: 0.68 }]}>
            <View style={[styles.notificationIcon, i === 1 ? styles.iconGold : i === 2 ? styles.iconSage : null]}><Text style={styles.notificationGlyph}>{n[3]}</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.notificationTitle}>{n[0]}</Text><Text style={styles.notificationBody}>{n[1]}</Text></View>
            <Text style={styles.notificationTime}>{n[2]}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderProfile = (driver: boolean) => (
    <ScrollView contentContainerStyle={styles.dashboardPage}>
      <Header title="Profile" subtitle="Account and preferences" />
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{(fullName || (driver ? 'JS' : 'JD')).slice(0, 1).toUpperCase()}</Text></View>
        <Text style={styles.profileName}>{fullName || (driver ? 'Juan Santos' : 'Juan Dela Cruz')}</Text>
        <Text style={styles.bodyCopy}>{email || 'juan@gmail.com'}</Text>
        <Text style={styles.bodyCopy}>{phone || '+63 9XX XXX XXXX'}</Text>
        <Text style={styles.roleBadge}>{role.toUpperCase()} ACCOUNT</Text>
      </View>
      {[
        ['♙', 'Personal Information', 'Edit account details'],
        ['⌖', driver ? 'Tricycle Information' : 'Saved Locations', driver ? 'Vehicle and capacity details' : 'Home, school, and favorite places'],
        ['▤', 'Booking History', 'Review previous trips'],
        ['⚙', 'Settings', 'Security and preferences'],
        ['?', 'Help & Support', 'Get help with DapiRide'],
      ].map((item) => (
        <Pressable key={item[1]} style={styles.profileMenuItem} onPress={() => Alert.alert(item[1], `${item[2]} will be available in a later implementation phase.`)}>
          <Text style={styles.profileMenuIcon}>{item[0]}</Text>
          <View style={{ flex: 1 }}><Text style={styles.profileMenuTitle}>{item[1]}</Text><Text style={styles.profileMenuHint}>{item[2]}</Text></View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
      <Button title="Log Out" secondary onPress={signOut} />
    </ScrollView>
  );

  const renderDriverHome = () => (
    <ScrollView contentContainerStyle={styles.dashboardPage}>
      <View style={styles.topBar}><Brand small /><View style={styles.avatarSmall}><Text style={styles.avatarSmallText}>{(fullName || 'JS').slice(0, 1).toUpperCase()}</Text></View></View>
      <Text style={styles.greeting}>Good day,</Text>
      <Text style={styles.dashboardTitle}>{fullName || 'Juan Santos'}</Text>
      <Text style={styles.bodyCopy}>Driver ID: DR-001 · Dapitan City</Text>
      <View style={styles.driverAvailability}>
        <View style={{ flex: 1 }}><Text style={styles.locationLabel}>AVAILABILITY STATUS</Text><Text style={styles.availabilityTitle}>{online ? 'Online' : 'Offline'}</Text><Text style={styles.smallMuted}>{online ? 'You are available for ride requests.' : 'You will not receive new requests.'}</Text></View>
        <Switch value={online} onValueChange={setOnline} trackColor={{ false: C.border, true: C.green2 }} thumbColor={C.white} />
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statNumber}>0</Text><Text style={styles.statLabel}>Active Requests</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>Completed Trips</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>4.8</Text><Text style={styles.statLabel}>Rating</Text></View>
      </View>
      <View style={styles.rideCard}>
        <SectionTitle title="Today's Summary" />
        <View style={styles.rowBetween}><Text style={styles.bodyCopy}>Trips completed</Text><Text style={styles.valueText}>0</Text></View>
        <View style={styles.hairline} />
        <View style={styles.rowBetween}><Text style={styles.bodyCopy}>Estimated earnings</Text><Text style={styles.valueText}>₱0.00</Text></View>
      </View>
      <Button title="View Ride Requests" onPress={() => setPage('driver-requests')} />
    </ScrollView>
  );

  const renderDriverRequests = () => {
    const availableBooking = bookings.find((b) => b.status === 'Pending');
    return (
    <ScrollView contentContainerStyle={styles.dashboardPage}>
      <Header title="Ride Requests" subtitle="Review and respond to trip requests" />
      <View style={styles.rowBetween}><Text style={styles.sectionTitle}>{availableBooking ? `Request #${availableBooking.id}` : 'No new requests'}</Text><Text style={styles.statusPill}>{availableBooking ? availableBooking.status : 'Waiting'}</Text></View>
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapRoad1} /><View style={styles.mapRoad2} /><View style={styles.mapRoad3} />
        <View style={styles.mapPinA}><Text style={styles.mapPinText}>P</Text></View>
        <View style={styles.mapPinB}><Text style={styles.mapPinText}>D</Text></View>
        <Text style={styles.mapCaption}>Dapitan City · Route preview</Text>
      </View>
      <View style={styles.rideCard}>
        <Text style={styles.locationLabel}>PICKUP LOCATION</Text><Text style={styles.valueText}>{availableBooking?.pickup || 'No passenger pickup yet'}</Text>
        <View style={styles.hairline} />
        <Text style={styles.locationLabel}>DESTINATION</Text><Text style={styles.valueText}>{availableBooking?.destination || 'A passenger booking will appear here'}</Text>
        <View style={styles.hairline} />
        <View style={styles.rowBetween}><Text style={styles.bodyCopy}>Passengers</Text><Text style={styles.valueText}>1</Text></View>
        <View style={styles.rowBetween}><Text style={styles.bodyCopy}>Ride type</Text><Text style={styles.valueText}>{availableBooking?.rideType || '—'}</Text></View>
        <Text style={styles.locationLabel}>SET YOUR FARE (₱)</Text>
        <TextInput value={driverFareInput} onChangeText={setDriverFareInput} placeholder="Enter fare amount" placeholderTextColor={C.muted} keyboardType="decimal-pad" style={styles.locationTextInput} editable={!!availableBooking} />
        {availableBooking ? (
          <View style={styles.requestButtons}>
            <View style={{ flex: 1 }}><Button title="Decline" danger secondary onPress={() => { void saveBookings(bookings.map((b) => b.id === availableBooking.id ? { ...b, status: 'Cancelled' } : b)); setDriverFareInput(''); }} /></View>
            <View style={{ flex: 1 }}><Button title="Set Fare & Accept" onPress={() => { const amount = Number(driverFareInput.trim()); if (!driverFareInput.trim() || !Number.isFinite(amount) || amount <= 0) { Alert.alert('Enter a valid fare', 'Please enter a fare greater than ₱0 before accepting this request.'); return; } void saveBookings(bookings.map((b) => b.id === availableBooking.id ? { ...b, fare: Math.round(amount * 100) / 100, status: 'Accepted' } : b)); setDriverFareInput(''); Alert.alert('Fare sent to passenger', `Your fare of ₱${(Math.round(amount * 100) / 100).toFixed(2)} has been saved with this booking.`); }} /></View>
          </View>
        ) : (
          <View style={styles.notice}><Text style={styles.noticeText}>No pending passenger requests. New demo bookings will appear here when saved on this device.</Text></View>
        )}
      </View>
      <Text style={styles.smallMuted}>Demo requests are stored locally on this device; they are not synced between different devices.</Text>
    </ScrollView>
  );
  };

  const isPassengerTab = ['passenger-home', 'passenger-rides', 'passenger-notifications', 'passenger-profile'].includes(page);
  const isDriverTab = ['driver-home', 'driver-requests', 'driver-notifications', 'driver-profile'].includes(page);
  const hasNav = isPassengerTab || isDriverTab;

  let content: React.ReactNode;
  if (page === 'splash') content = renderSplash();
  else if (page === 'welcome') content = renderWelcome();
  else if (page === 'login' || page === 'register') content = renderAuth();
  else if (page === 'passenger-home') content = renderPassengerHome();
  else if (page === 'passenger-rides') content = renderPassengerRides();
  else if (page === 'passenger-notifications') content = renderNotifications(false);
  else if (page === 'passenger-profile') content = renderProfile(false);
  else if (page === 'driver-home') content = renderDriverHome();
  else if (page === 'driver-requests') content = renderDriverRequests();
  else if (page === 'driver-notifications') content = renderNotifications(true);
  else content = renderProfile(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.flex}>{content}</View>
        {hasNav && <BottomNav page={page} go={setPage} role={isPassengerTab ? 'Passenger' : 'Driver'} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  brand: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  brandLarge: { width: '100%', minHeight: 100 },
  brandSmall: { flex: 1, flexDirection: 'row', minHeight: 42, marginBottom: 0, gap: 8 },
  brandImage: { width: 220, height: 116 },
  brandImageSmall: { width: 42, height: 42 },
  brandTag: { color: C.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1, flexShrink: 1 },
  button: { minHeight: 53, borderRadius: 11, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 5 },
  buttonText: { color: C.white, fontSize: 14, fontWeight: '800' },
  buttonSecondary: { backgroundColor: C.white, borderWidth: 1, borderColor: C.green },
  buttonSecondaryText: { color: C.green },
  buttonDanger: { borderColor: C.red, backgroundColor: C.white },
  fieldWrap: { marginBottom: 18 },
  label: { color: C.text, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 9 },
  input: { minHeight: 52, borderWidth: 1.2, borderColor: C.border, backgroundColor: C.pale, borderRadius: 10, paddingHorizontal: 13, color: C.text, fontSize: 14, textAlignVertical: 'center' },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 22, marginTop: 2 },
  roleOption: { flex: 1, minHeight: 74, padding: 12, justifyContent: 'center', borderRadius: 11, borderWidth: 1.2, borderColor: C.border, backgroundColor: C.pale },
  roleOptionSelected: { borderColor: C.green, backgroundColor: C.sage },
  roleName: { color: C.text, fontSize: 14, fontWeight: '800', marginBottom: 5 },
  roleHint: { color: C.muted, fontSize: 10, lineHeight: 14 },
  pageHeader: { position: 'relative', width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 22, minHeight: 54, paddingHorizontal: 42 },
  pageHeaderText: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 0, top: 5, width: 35, height: 40, justifyContent: 'center', zIndex: 2 },
  backText: { fontSize: 35, color: C.green, lineHeight: 38 },
  pageTitle: { color: C.dark, fontSize: 25, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', width: '100%' },
  pageSubtitle: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5, textAlign: 'center', alignSelf: 'center', width: '100%' },
  splash: { flex: 1, backgroundColor: '#F4F5EC', alignItems: 'center', paddingTop: 26, overflow: 'hidden' },
  splashSky: { position: 'absolute', top: 0, left: 0, right: 0, height: '58%', backgroundColor: '#F4F5EC' },
  splashLogoImage: { width: 250, maxWidth: '78%', height: 185, marginTop: 8, marginBottom: 0, borderRadius: 0 },
  splashTagline: { color: C.green, fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 18, textAlign: 'center' },
  splashPhotoFrame: { width: '100%', flex: 1, minHeight: 240, overflow: 'hidden', backgroundColor: '#DDE8DC' },
  splashPhoto: { width: '100%', height: '100%' },
  splashGreenFooter: { height: 112, width: '100%', backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: -1 },
  splashWaveBack: { position: 'absolute', height: 50, left: -25, right: -25, top: -27, backgroundColor: '#39725D', borderTopLeftRadius: 90, borderTopRightRadius: 110, transform: [{ rotate: '-2deg' }] },
  splashWaveFront: { position: 'absolute', height: 38, left: -25, right: -25, top: -18, backgroundColor: '#23614E', borderTopLeftRadius: 100, borderTopRightRadius: 90, transform: [{ rotate: '2deg' }] },
  splashBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  splashContinue: { paddingHorizontal: 18, paddingVertical: 9, marginTop: 7 },
  splashContinueText: { color: '#D9E6D9', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  pin: { color: C.gold, fontSize: 15 },
  splashCity: { color: C.white, fontSize: 12, fontWeight: '700' },
  welcomePage: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24, flexGrow: 1 },
  hero: { marginBottom: 15 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, width: '100%', alignSelf: 'center' },
  goldLine: { width: 30, height: 3, backgroundColor: C.gold },
  eyebrowText: { color: C.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, textAlign: 'center', alignSelf: 'center' },
  heroTitle: { color: C.dark, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1, textAlign: 'center', alignSelf: 'center', width: '100%' },
  heroCopy: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 9, maxWidth: 320, textAlign: 'center', alignSelf: 'center', width: '100%' },
  heroPhotoFrame: { height: 245, borderRadius: 18, overflow: 'hidden', marginTop: 20, borderWidth: 1, borderColor: '#DCE5D9', backgroundColor: '#E6EEE3' },
  heroPhoto: { width: '100%', height: '100%' },
  sun: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: '#D7C99F', top: 18, right: 28 },
  hillBack: { position: 'absolute', height: 100, left: -25, right: -25, bottom: 56, borderTopLeftRadius: 100, borderTopRightRadius: 80, backgroundColor: '#B8CDBB', transform: [{ rotate: '-5deg' }] },
  hillFront: { position: 'absolute', height: 80, left: -20, right: -20, bottom: 32, borderTopLeftRadius: 90, borderTopRightRadius: 100, backgroundColor: '#7D9F8A', transform: [{ rotate: '4deg' }] },
  road: { position: 'absolute', height: 42, bottom: 0, left: 0, right: 0, backgroundColor: '#D5D8C9' },
  trike: { position: 'absolute', width: 155, height: 88, bottom: 28, left: '25%' },
  trikeRoof: { position: 'absolute', width: 100, height: 28, top: 0, left: 20, backgroundColor: C.green, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 3, borderColor: '#E9F0E5' },
  trikeBody: { position: 'absolute', top: 24, left: 9, width: 115, height: 40, backgroundColor: '#D7B96E', borderRadius: 8, borderWidth: 3, borderColor: C.green, alignItems: 'center', justifyContent: 'center' },
  trikeD: { color: C.green, fontSize: 22, fontWeight: '900' },
  trikeWheelOne: { position: 'absolute', width: 27, height: 27, borderRadius: 14, backgroundColor: '#26352F', borderWidth: 4, borderColor: '#E5E7DC', bottom: 0, left: 22 },
  trikeWheelTwo: { position: 'absolute', width: 27, height: 27, borderRadius: 14, backgroundColor: '#26352F', borderWidth: 4, borderColor: '#E5E7DC', bottom: 0, right: 10 },
  guestButton: { alignItems: 'center', padding: 18 },
  footer: { textAlign: 'center', color: C.muted, fontSize: 11, marginTop: 16 },
  authPage: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 28, flexGrow: 1 },
  authCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 17, padding: 18 },
  cardEyebrow: { color: C.green, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  hairline: { height: 1, backgroundColor: C.border, marginVertical: 15 },
  forgot: { alignSelf: 'flex-end', marginTop: -7, marginBottom: 18 },
  link: { color: C.green, fontSize: 12, fontWeight: '800' },
  authSwitch: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 20 },
  muted: { color: C.muted, fontSize: 12 },
  notice: { flexDirection: 'row', gap: 11, padding: 15, borderRadius: 12, backgroundColor: '#EAF1E8', marginTop: 18, alignItems: 'flex-start' },
  noticeIcon: { width: 22, height: 22, borderWidth: 1.5, borderColor: C.green, color: C.green, textAlign: 'center', textAlignVertical: 'center', borderRadius: 12, fontWeight: '900', overflow: 'hidden' },
  noticeText: { flex: 1, color: C.muted, fontSize: 11, lineHeight: 17 },
  dashboardPage: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 28 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  menuGlyph: { fontSize: 22, color: C.green, paddingRight: 4 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.sage, borderWidth: 1, borderColor: '#B9D0C0', alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { color: C.green, fontSize: 13, fontWeight: '900' },
  greeting: { color: C.text, fontSize: 13 },
  dashboardTitle: { color: C.dark, fontSize: 24, fontWeight: '900', marginTop: 3 },
  bodyCopy: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  fareBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.sage, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  fareLabel: { color: C.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  fareHint: { color: C.muted, fontSize: 12, marginTop: 4 },
  fareAmount: { color: C.green, fontSize: 24, fontWeight: '900' },
  locationCard: { backgroundColor: C.white, borderRadius: 14, padding: 15, marginTop: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  locationLabel: { color: C.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginBottom: 7 },
  locationInputRow: { flexDirection: 'row', alignItems: 'center', minHeight: 36, gap: 10 },
  locationSymbol: { color: C.green, fontSize: 14 },
  locationTextInput: { flex: 1, color: C.text, fontSize: 12, paddingVertical: 7 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  sectionTitle: { color: C.dark, fontSize: 15, fontWeight: '900' },
  rideOptions: { flexDirection: 'row', gap: 10 },
  rideOption: { flex: 1, padding: 13, backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, minHeight: 84 },
  rideOptionActive: { borderColor: C.green, backgroundColor: C.sage },
  rideOptionTitle: { color: C.text, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  smallMuted: { color: C.muted, fontSize: 10, lineHeight: 15 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, backgroundColor: C.white, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: C.border, minHeight: 78, justifyContent: 'center' },
  quickIcon: { color: C.green, fontSize: 19, marginBottom: 5 },
  quickTitle: { color: C.text, fontSize: 11, fontWeight: '800' },
  bottomNav: { minHeight: 65, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: Platform.OS === 'android' ? 5 : 10, paddingTop: 5 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navIcon: { color: C.muted, fontSize: 19 },
  navText: { color: C.muted, fontSize: 9, fontWeight: '600' },
  navActive: { color: C.green, fontWeight: '900' },
  navDot: { width: 14, height: 2, backgroundColor: C.gold, borderRadius: 1, marginTop: 1 },
  segment: { flexDirection: 'row', backgroundColor: '#EAEFE7', borderRadius: 11, padding: 4, marginBottom: 18 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 9 },
  segmentActive: { backgroundColor: C.green },
  segmentText: { color: C.muted, fontSize: 11, fontWeight: '700' },
  segmentTextActive: { color: C.white },
  rideCard: { backgroundColor: C.white, borderRadius: 15, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 14 },
  statusPill: { color: C.green, backgroundColor: C.sage, overflow: 'hidden', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '800' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginVertical: 5 },
  rideMainTitle: { color: C.dark, fontSize: 15, fontWeight: '900', marginTop: 15 },
  valueText: { color: C.text, fontSize: 12, fontWeight: '800', flexShrink: 1, textAlign: 'right' },
  emptyCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 15, padding: 20, marginTop: 8 },
  emptyTitle: { color: C.dark, fontSize: 17, fontWeight: '900' },
  notificationCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 13, padding: 12, marginTop: 10 },
  notificationIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#4A9B7C', alignItems: 'center', justifyContent: 'center' },
  iconGold: { backgroundColor: '#D4A23C' },
  iconSage: { backgroundColor: '#7AA58B' },
  notificationGlyph: { color: C.white, fontSize: 15, fontWeight: '900' },
  notificationTitle: { color: C.dark, fontSize: 11, fontWeight: '900', marginBottom: 4 },
  notificationBody: { color: C.muted, fontSize: 10, lineHeight: 14, flexShrink: 1 },
  notificationTime: { color: C.muted, fontSize: 8, alignSelf: 'flex-start' },
  profileCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 14 },
  profileAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.sage, borderWidth: 4, borderColor: '#C7D8CA', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileAvatarText: { color: C.green, fontSize: 27, fontWeight: '900' },
  profileName: { color: C.dark, fontSize: 17, fontWeight: '900' },
  roleBadge: { color: C.green, backgroundColor: C.sage, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, fontSize: 9, fontWeight: '900', marginTop: 10, overflow: 'hidden', letterSpacing: 1 },
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 13, marginBottom: 9 },
  profileMenuIcon: { color: C.green, fontSize: 19, width: 25, textAlign: 'center' },
  profileMenuTitle: { color: C.text, fontSize: 12, fontWeight: '800' },
  profileMenuHint: { color: C.muted, fontSize: 10, marginTop: 3 },
  chevron: { color: C.muted, fontSize: 24 },
  driverAvailability: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, marginTop: 18, flexDirection: 'row', alignItems: 'center' },
  availabilityTitle: { color: C.green, fontSize: 19, fontWeight: '900', marginBottom: 5 },
  statsRow: { flexDirection: 'row', gap: 8, marginVertical: 13 },
  statCard: { flex: 1, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNumber: { color: C.dark, fontSize: 22, fontWeight: '900', marginBottom: 5 },
  statLabel: { color: C.muted, fontSize: 9, textAlign: 'center' },
  requestButtons: { flexDirection: 'row', gap: 10, marginTop: 18 },
  mapPlaceholder: { height: 210, borderRadius: 15, backgroundColor: '#E3EBDD', overflow: 'hidden', marginVertical: 15, position: 'relative' },
  mapRoad1: { position: 'absolute', width: '140%', height: 20, backgroundColor: '#FFFFFF', top: 75, left: -20, transform: [{ rotate: '-22deg' }] },
  mapRoad2: { position: 'absolute', width: '140%', height: 16, backgroundColor: '#FFFFFF', top: 130, left: -40, transform: [{ rotate: '25deg' }] },
  mapRoad3: { position: 'absolute', width: 18, height: '150%', backgroundColor: '#FFFFFF', top: -20, left: '53%', transform: [{ rotate: '17deg' }] },
  mapPinA: { position: 'absolute', top: 50, left: '28%', width: 28, height: 28, borderRadius: 14, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  mapPinB: { position: 'absolute', top: 116, right: '24%', width: 28, height: 28, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  mapPinText: { color: C.white, fontSize: 11, fontWeight: '900' },
  mapCaption: { position: 'absolute', bottom: 12, left: 12, color: C.text, fontSize: 10, fontWeight: '800', backgroundColor: '#FFFFFFD9', padding: 7, borderRadius: 6 },
});
