import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Modal,
    Clipboard,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Your theme
const THEME = {
    primary: ["#4A00E0", "#8E2DE2"], // Profile gradient colors
    secondary: ["#7A88FF", "#FD71AF"],
    optional: ["#FF8F71", "#FF3D77"],
};

// Mock data for job listings
const jobListings = [
    {
        id: '1',
        company: 'TechCorp',
        logo: 'https://via.placeholder.com/50',
        role: 'Senior React Native Developer',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$120k - $150k',
        posted: '2 days ago',
        description: 'Join our team to build innovative mobile applications using React Native...',
        saved: false,
        email: 'techcorp@gmail.com',
    },
    {
        id: '2',
        company: 'Design Studio',
        logo: 'https://via.placeholder.com/50',
        role: 'UI/UX Designer',
        location: 'Remote',
        type: 'Contract',
        salary: '$80k - $100k',
        posted: '1 week ago',
        description: 'Looking for an experienced designer to create beautiful user interfaces...',
        saved: true,
        email: 'designstudio@gmail.com',
    },
    {
        id: '3',
        company: 'StartupXYZ',
        logo: 'https://via.placeholder.com/50',
        role: 'Full Stack Developer',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$100k - $130k',
        posted: '3 days ago',
        description: 'Join our growing team to work on exciting projects with modern technologies...',
        saved: false,
        email: 'startupxyz@gmail.com',
    },
    {
        id: '4',
        company: 'Enterprise Solutions',
        logo: 'https://via.placeholder.com/50',
        role: 'Mobile Developer',
        location: 'Chicago, IL',
        type: 'Full-time',
        salary: '$90k - $120k',
        posted: 'Just now',
        description: 'Looking for talented mobile developers to join our cross-platform team...',
        saved: false,
        email: 'enterprisesolutions@gmail.com',
    },
    {
        id: '5',
        company: 'Creative Agency',
        logo: 'https://via.placeholder.com/50',
        role: 'Product Designer',
        location: 'Austin, TX',
        type: 'Part-time',
        salary: '$60k - $80k',
        posted: '5 days ago',
        description: 'Join our creative team to design beautiful products that users love...',
        saved: true,
        email: 'creativeagency@gmail.com',
    },
];

const JobListingApp = () => {
    const [jobs, setJobs] = useState(jobListings);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const toggleSaveJob = (id) => {
        setJobs(jobs.map(job =>
            job.id === id ? { ...job, saved: !job.saved } : job
        ));
    };

    const handleApplyNow = (job) => {
        setSelectedJob(job);
        setModalVisible(true);
    };

    const copyToClipboard = (email) => {
        Clipboard.setString(email);
        // You might want to show a toast message here
    };

    const openEmailClient = (email) => {
        Linking.openURL(`mailto:${email}`);
        setModalVisible(false);
    };

    const EmailModal = () => {
        if (!selectedJob) return null;

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
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
                            <Text style={styles.emailClientButtonText}>Open in default email client</Text>
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

    const renderJobCard = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <Image source={{ uri: item.logo }} style={styles.companyLogo} />
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
                    onPress={() => handleApplyNow(item)}
                >
                    <LinearGradient
                        colors={THEME.secondary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.applyButtonGradient}
                    >
                        <Text style={styles.applyButtonText}>Apply Now</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={THEME.primary}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Job Finder</Text>
                <View style={styles.searchBar}>
                    <TextInput
                        placeholder="Search for jobs..."
                        placeholderTextColor="#8A8A8A"
                        style={styles.searchInput}
                    />
                </View>
            </LinearGradient>

            <View style={styles.filtersContainer}>
                <ScrollableFilter options={['All Jobs', 'Remote', 'Full-time', 'Part-time', 'Contract']} />
            </View>

            <FlatList
                data={jobs}
                renderItem={renderJobCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            <EmailModal />
        </SafeAreaView>
    );
};

// Scrollable filter component
const ScrollableFilter = ({ options }) => {
    const [selectedFilter, setSelectedFilter] = useState(options[0]);

    return (
        <FlatList
            data={options}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        selectedFilter === item && styles.filterChipSelected
                    ]}
                    onPress={() => setSelectedFilter(item)}
                >
                    <Text
                        style={[
                            styles.filterChipText,
                            selectedFilter === item && styles.filterChipTextSelected
                        ]}
                    >
                        {item}
                    </Text>
                </TouchableOpacity>
            )}
            contentContainerStyle={styles.filtersList}
        />
    );
};

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
    },
    companyLogo: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    cardHeaderText: {
        flex: 1,
        marginLeft: 12,
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
    }
});

export default JobListingApp;