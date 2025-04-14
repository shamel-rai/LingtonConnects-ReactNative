import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const KhaltiStatusScreen = () => {
    const [message, setMessage] = useState('Processing payment...');
    const [loading, setLoading] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const route = useRoute();
    const navigation = useNavigation();

    // Get the payment parameters from route.params
    const {
        pidx,
        transaction_id,
        idx,
        tidx,
        amount,
        total_amount,
        mobile,
        status,
        purchase_order_id,
        purchase_order_name,
    } = route.params || {};

    useEffect(() => {
        // Ensure the required parameters are provided
        if (!purchase_order_id || !transaction_id || !status || !amount) {
            setMessage('Missing required payment parameters.');
            setLoading(false);
            return;
        }

        // Build the query string using the payment details.
        const queryParams = new URLSearchParams({
            pidx: pidx || '',
            transaction_id: transaction_id || '',
            idx: idx || '',
            tidx: tidx || '',
            amount: amount ? String(amount) : '',
            total_amount: total_amount ? String(total_amount) : '',
            mobile: mobile || '',
            status: status || '',
            purchase_order_id: purchase_order_id || '',
            purchase_order_name: purchase_order_name || '',
        }).toString();

        // Construct the URL to hit your backend. (Use your API base URL from api.js if preferred.)
        const backendUrl = `http://192.168.101.6:3001/api/v1/khalti-return?${queryParams}`;

        const processPayment = async () => {
            try {
                const response = await fetch(backendUrl);
                const data = await response.json();

                if (data.message) {
                    setMessage(data.message);
                    // Mark payment as successful if the returned message includes 'success'
                    if (data.message.toLowerCase().includes('success')) {
                        setPaymentSuccess(true);
                    } else {
                        setPaymentSuccess(false);
                    }
                } else if (data.error) {
                    setMessage(`Error: ${data.error}`);
                    setPaymentSuccess(false);
                } else {
                    setMessage('Payment processed successfully.');
                    setPaymentSuccess(true);
                }
            } catch (error) {
                console.error('Error updating payment:', error);
                setMessage('Error processing payment. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        processPayment();
    }, []);

    const handleBackToHome = () => {
        navigation.navigate('Home'); // Adjust as needed for your navigation structure
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5E3D9E" />
                        <Text style={styles.loadingText}>Processing payment...</Text>
                    </View>
                ) : (
                    <View style={styles.resultContainer}>
                        <View style={[styles.statusIconContainer, paymentSuccess ? styles.successBackground : styles.errorBackground]}>
                            {paymentSuccess ? (
                                <Ionicons name="checkmark-circle" size={70} color="#fff" />
                            ) : (
                                <Ionicons name="close-circle" size={70} color="#fff" />
                            )}
                        </View>
                        <Text style={[styles.statusTitle, paymentSuccess ? styles.successText : styles.errorText]}>
                            {paymentSuccess ? 'Payment Successful!' : 'Payment Failed'}
                        </Text>
                        <Text style={styles.message}>{message}</Text>
                        {transaction_id && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Transaction ID:</Text>
                                <Text style={styles.detailValue}>{transaction_id}</Text>
                            </View>
                        )}
                        {amount && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Amount:</Text>
                                <Text style={styles.detailValue}>Rs. {(amount / 100).toFixed(2)}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
                            <Text style={styles.buttonText}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default KhaltiStatusScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        marginTop: 20,
        color: '#555',
    },
    resultContainer: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    statusIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    successBackground: {
        backgroundColor: '#4CAF50',
    },
    errorBackground: {
        backgroundColor: '#F44336',
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    successText: {
        color: '#4CAF50',
    },
    errorText: {
        color: '#F44336',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        color: '#555',
        lineHeight: 22,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailLabel: {
        fontSize: 14,
        color: '#777',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#5E3D9E',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginTop: 30,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
