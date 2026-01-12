import Constants from 'expo-constants';

const getApiUrl = () => {
    // STRICT: Local Development Only (Per AGENT_RULES.md)
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0] || 'localhost';
    const LOCAL_URL = `http://${localhost}:3000`;

    return LOCAL_URL;
};

export const API_URL = getApiUrl();
