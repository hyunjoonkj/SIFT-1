import React, { useState } from "react";
import { View, ScrollView, Switch, Pressable, StyleSheet } from "react-native";
import { Typography } from "../../components/design-system/Typography";
import { Theme } from "../../lib/theme";
import { Bell, ChevronRight, Moon, Shield, CircleHelp, LogOut } from "lucide-react-native";

export default function Settings() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Typography variant="h1" className="mb-6 ml-4">Settings</Typography>

            <View style={styles.section}>
                <SettingsRow
                    icon={<Bell size={22} color={Theme.colors.primary} />}
                    label="Notifications"
                    isLast={false}
                >
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
                    />
                </SettingsRow>
                <SettingsRow
                    icon={<Moon size={22} color={Theme.colors.primary} />}
                    label="Dark Mode"
                    isLast={true}
                >
                    <Switch
                        value={darkModeEnabled}
                        onValueChange={setDarkModeEnabled}
                        trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
                    />
                </SettingsRow>
            </View>

            <View style={styles.section}>
                <SettingsRow
                    icon={<Shield size={22} color={Theme.colors.primary} />}
                    label="Privacy & Security"
                    isLast={false}
                    showChevron
                />
                <SettingsRow
                    icon={<CircleHelp size={22} color={Theme.colors.primary} />}
                    label="Help & Support"
                    isLast={true}
                    showChevron
                />
            </View>

            <View style={styles.section}>
                <SettingsRow
                    icon={<LogOut size={22} color={Theme.colors.danger} />}
                    label="Log Out"
                    labelColor={Theme.colors.danger}
                    isLast={true}
                />
            </View>

            <Typography variant="caption" className="text-center mt-6 text-text-tertiary">
                Sift v1.0.0 (Build 1)
            </Typography>
        </ScrollView>
    );
}

// --- Components ---

interface SettingsRowProps {
    icon: React.ReactNode;
    label: string;
    labelColor?: string;
    isLast?: boolean;
    showChevron?: boolean;
    children?: React.ReactNode;
    onPress?: () => void;
}

function SettingsRow({ icon, label, labelColor, isLast, showChevron, children, onPress }: SettingsRowProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.row,
                !isLast && styles.separator,
                pressed && styles.rowPressed
            ]}
        >
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <View style={styles.rowContent}>
                <Typography variant="body" style={{ color: labelColor || Theme.colors.text.primary, flex: 1 }}>
                    {label}
                </Typography>
                {children}
                {showChevron && <ChevronRight size={20} color={Theme.colors.text.tertiary} />}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background, // System Gray 6
    },
    content: {
        paddingTop: 60, // Large Title offset
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Theme.colors.surface,
        minHeight: 54, // Apple requirement
    },
    rowPressed: {
        backgroundColor: '#F2F2F7', // Active state
    },
    separator: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Theme.colors.border,
        marginLeft: 54, // Align with text
    },
    iconContainer: {
        width: 30,
        marginRight: 12,
        alignItems: 'center',
    },
    rowContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }
});
