import { Tabs } from "expo-router";
import { DeviceEventEmitter } from "react-native";
import { Theme } from "../../lib/theme";
import { House, Archive, User } from 'phosphor-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Theme.colors.background,
                    borderTopWidth: 0.5,
                    borderTopColor: 'rgba(0,0,0,0.1)',
                    height: 95,
                    paddingTop: 10,
                    paddingBottom: 35,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginTop: 4,
                },
                tabBarActiveTintColor: Theme.colors.text.primary,
                tabBarInactiveTintColor: '#999999',
            }}
        >
            <Tabs.Screen
                name="index"
                listeners={({ navigation }) => ({
                    tabPress: (e: any) => {
                        if (navigation.isFocused()) {
                            e.preventDefault();
                            DeviceEventEmitter.emit('scrollToTopDashboard');
                        }
                    },
                })}
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <House
                            size={24}
                            color={color}
                            weight={focused ? "fill" : "regular"}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="sift"
                options={{
                    title: "Sift",
                    tabBarIcon: ({ color, focused }) => (
                        <Archive
                            size={24}
                            color={color}
                            weight={focused ? "fill" : "regular"}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <User
                            size={24}
                            color={color}
                            weight={focused ? "fill" : "regular"}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

