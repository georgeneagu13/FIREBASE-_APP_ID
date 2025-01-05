import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TrackerScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Tracker Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TrackerScreen;