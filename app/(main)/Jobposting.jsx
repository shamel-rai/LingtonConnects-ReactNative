import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Modal,
    Clipboard,
    Linking,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../utils/axiosSetup';
import API from '../../utils/api';

const THEME = {
    primary: ["#4A00E0", "#8E2DE2"],
    secondary: ["#7A88FF", "#FD71AF"],
    optional: ["#FF8F71", "#FF3D77"],
};

const JobListingApp = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [currentJobDetails, setCurrentJobDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // search state

    // Fetch job list on mount
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await apiClient.get(API.jobs.getAll());
                // Map Mongo's _id to id for UI keys
                const data = res.data.map(job => ({ ...job, id: job._id }));
                setJobs(data);
            } catch (err) {
                console.error('Error fetching jobs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // Toggle "saved" on the backend, then update local state
    const toggleSaveJob = async (id) => {
        try {
            const res = await apiClient.patch(API.jobs.toggleSave(id));
            const updated = { ...res.data, id: res.data._id };
            setJobs(jobs.map(job => job.id === id ? updated : job));
            if (currentJobDetails?.id === id) {
                setCurrentJobDetails(updated);
            }
        } catch (err) {
            console.error('Error saving job:', err);
        }
    };

    const handleApplyNow = (job) => {
        setSelectedJob(job);
        setModalVisible(true);
    };

    const copyToClipboard = (email) => {
        Clipboard.setString(email);
    };

    const openEmailClient = (email) => {
        Linking.openURL(`mailto:${email}`);
        setModalVisible(false);
    };

    // Show details for this job
    const viewJobDetails = (job) => {
        setCurrentJobDetails(job);
    };

    // Go back to listing
    const goBackToJobList = () => {
        setCurrentJobDetails(null);
    };

    // derive filtered list based on searchTerm
    const filteredJobs = jobs.filter(job => {
        const lower = searchTerm.toLowerCase();
        return (
            job.company.toLowerCase().includes(lower) ||
            job.role.toLowerCase().includes(lower)
        );
    });

    const EmailModal = () => {
        if (!selectedJob) return null;
        return (
            <Modal animationType="fade" transparent visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Apply via email</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.emailContainer}>
                            <Text style={styles.emailText}>{selectedJob.email}</Text>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={() => copyToClipboard(selectedJob.email)}
                            >
                                <Text style={styles.copyButtonText}>Copy it</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.emailClientButton}
                            onPress={() => openEmailClient(selectedJob.email)}
                        >
                            <Text style={styles.emailClientButtonText}>
                                Open in email client
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const JobDetailScreen = () => {
        if (!currentJobDetails) return null;
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={THEME.primary} style={styles.detailsHeader}>
                    <View style={styles.detailsHeaderContent}>
                        <TouchableOpacity onPress={goBackToJobList}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => toggleSaveJob(currentJobDetails.id)}
                        >
                            <Text style={[
                                styles.saveIcon,
                                currentJobDetails.saved && styles.savedIcon
                            ]}>
                                {currentJobDetails.saved ? '★' : '☆'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
                <ScrollView style={styles.detailsContent}>
                    {/* Company info */}
                    <View style={styles.detailsTopSection}>
                        <View style={styles.companyInfo}>
                            <Text style={styles.detailsCompanyName}>
                                {currentJobDetails.company}
                            </Text>
                            <Text style={styles.detailsJobRole}>
                                {currentJobDetails.role}
                            </Text>
                            <Text style={styles.detailsJobLocation}>
                                {currentJobDetails.location}
                            </Text>
                        </View>
                        <View style={styles.jobMetaDetails}>
                            <View style={styles.metaTagLarge}>
                                <Text style={styles.metaTextLarge}>
                                    {currentJobDetails.type}
                                </Text>
                            </View>
                            <View style={styles.metaTagLarge}>
                                <Text style={styles.metaTextLarge}>
                                    {currentJobDetails.salary}
                                </Text>
                            </View>
                            <View style={styles.metaTagLarge}>
                                <Text style={styles.metaTextLarge}>
                                    Posted: {currentJobDetails.posted}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {/* Description, responsibilities, etc. */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.sectionText}>
                            {currentJobDetails.description}
                        </Text>
                    </View>
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Responsibilities</Text>
                        {currentJobDetails.responsibilities.map((item, idx) => (
                            <View key={idx} style={styles.bulletItem}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {currentJobDetails.requirements.map((item, idx) => (
                            <View key={idx} style={styles.bulletItem}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Benefits</Text>
                        {currentJobDetails.benefits.map((item, idx) => (
                            <View key={idx} style={styles.bulletItem}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Email display section */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Apply via email</Text>
                        <View style={styles.emailDisplayContainer}>
                            <Text style={styles.emailDisplayText}>
                                {currentJobDetails.email}
                            </Text>
                            <View style={styles.emailActionButtons}>
                                <TouchableOpacity
                                    style={styles.emailActionButton}
                                    onPress={() => copyToClipboard(currentJobDetails.email)}
                                >
                                    <Text style={styles.emailActionButtonText}>
                                        Copy Email
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.emailActionButton}
                                    onPress={() => openEmailClient(currentJobDetails.email)}
                                >
                                    <Text style={styles.emailActionButtonText}>
                                        Open Mail App
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.applyNowButton}
                        onPress={() => openEmailClient(currentJobDetails.email)}
                    >
                        <LinearGradient
                            colors={THEME.secondary}
                            style={styles.applyNowButtonGradient}
                        >
                            <Text style={styles.applyNowButtonText}>Apply Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    };

    const renderJobCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => viewJobDetails(item)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderText}>
                    <Text style={styles.companyName}>{item.company}</Text>
                    <Text style={styles.jobRole}>{item.role}</Text>
                    <Text style={styles.jobLocation}>{item.location}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSaveJob(item.id)}>
                    <Text style={[styles.saveIcon, item.saved && styles.savedIcon]}>
                        {item.saved ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.jobMeta}>
                    <View style={styles.metaTag}>
                        <Text style={styles.metaText}>{item.type}</Text>
                    </View>
                    <View style={styles.metaTag}>
                        <Text style={styles.metaText}>{item.salary}</Text>
                    </View>
                </View>
                <Text style={styles.jobDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.postedTime}>{item.posted}</Text>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleApplyNow(item);
                    }}
                >
                    <LinearGradient
                        colors={THEME.secondary}
                        style={styles.applyButtonGradient}
                    >
                        <Text style={styles.applyButtonText}>Apply Now</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {currentJobDetails ? (
                <JobDetailScreen />
            ) : (
                <>
                    <StatusBar barStyle="light-content" />
                    <LinearGradient colors={THEME.primary} style={styles.header}>
                        <Text style={styles.headerTitle}>Job Finder</Text>
                        <View style={styles.searchBar}>
                            <TextInput
                                placeholder="Search for jobs..."
                                placeholderTextColor="#8A8A8A"
                                style={styles.searchInput}
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />
                        </View>
                    </LinearGradient>
                    <FlatList
                        data={filteredJobs}
                        renderItem={renderJobCard}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                    <EmailModal />
                </>
            )}
        </SafeAreaView>
    );
};

export default JobListingApp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    searchBar: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        justifyContent: 'center',
    },
    searchInput: {
        fontSize: 16,
    },
    filtersContainer: {
        marginVertical: 12,
    },
    filtersList: {
        paddingHorizontal: 16,
    },
    filterChip: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterChipSelected: {
        backgroundColor: THEME.secondary[0],
        borderColor: THEME.secondary[0],
    },
    filterChipText: {
        color: '#333333',
        fontSize: 14,
    },
    filterChipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    cardHeaderText: {
        flex: 1,
    },
    companyName: {
        fontSize: 14,
        color: '#666666',
    },
    jobRole: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 2,
    },
    jobLocation: {
        fontSize: 14,
        color: '#666666',
        marginTop: 2,
    },
    saveIcon: {
        fontSize: 24,
        color: '#CCCCCC',
    },
    savedIcon: {
        color: THEME.optional[0],
    },
    cardBody: {
        marginBottom: 12,
    },
    jobMeta: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    metaTag: {
        backgroundColor: '#F0F2F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
    },
    metaText: {
        fontSize: 12,
        color: '#666666',
    },
    jobDescription: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    postedTime: {
        fontSize: 12,
        color: '#999999',
    },
    applyButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    applyButtonGradient: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
        fontSize: 14,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        fontSize: 20,
        color: '#999',
    },
    emailContainer: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emailText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    copyButton: {
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
    },
    copyButtonText: {
        fontSize: 14,
        color: '#666',
    },
    emailClientButton: {
        width: '100%',
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    emailClientButtonText: {
        fontSize: 16,
        color: '#333',
    },
    doneButton: {
        width: '100%',
        backgroundColor: '#FF3D77',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },

    // Job Details screen styles
    detailsHeader: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    detailsHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    headerActions: {
        flexDirection: 'row',
    },
    detailsContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    detailsTopSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    companyInfo: {
        marginBottom: 16,
    },
    detailsCompanyName: {
        fontSize: 16,
        color: '#666666',
    },
    detailsJobRole: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 4,
    },
    detailsJobLocation: {
        fontSize: 16,
        color: '#666666',
        marginTop: 4,
    },
    jobMetaDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    metaTagLarge: {
        backgroundColor: '#F0F2F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    metaTextLarge: {
        fontSize: 14,
        color: '#666666',
    },
    detailsSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 24,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bulletPoint: {
        fontSize: 16,
        color: '#666666',
        marginRight: 8,
        marginTop: 2,
    },
    bulletText: {
        flex: 1,
        fontSize: 16,
        color: '#666666',
        lineHeight: 24,
    },
    emailDisplayContainer: {
        backgroundColor: '#F0F2F5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    emailDisplayText: {
        fontSize: 18,
        color: '#333333',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 10,
    },
    emailActionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    emailActionButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    emailActionButtonText: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    applyNowButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 32,
    },
    applyNowButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    applyNowButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
});