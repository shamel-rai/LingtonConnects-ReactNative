import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#4A00E0" },
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* Hide header for index */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignupPage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LoginPage"
        options={{
          headerShown: false,
        }}
      />
      {/* Correct path for nested HomePage */}
      <Stack.Screen
        name="(main)/HomePage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(main)/SearchPage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(main)/ProfilePage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(main)/EditPage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(main)/RoadmapPage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(main)/StudyBuddyPage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(main)/NotificationPage"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
