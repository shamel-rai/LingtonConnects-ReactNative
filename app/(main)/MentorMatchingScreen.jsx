// screens/MentorMatchingScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    Modal,
    TextInput,
    ScrollView,
    Switch,
    Image,
} from 'react-native';
import API from '../../utils/api';
import apiClient from '../../utils/axiosSetup';
import { AuthContext } from '../../Context/AuthContext';
import { useRouter } from 'expo-router';

const ASSET_BASEURL = 'http://192.168.101.6:3001';

export default function MentorMatchingScreen() {
    const { userId } = useContext(AuthContext);
    const router = useRouter();

    const [profiles, setProfiles] = useState([]);
    const [amAvailable, setAmAvailable] = useState(true);
    const [viewMode, setViewMode] = useState('find'); // 'find' | 'become'
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);

    const emptyForm = {
        name: '',
        expertise: '',
        experience: '',
        bio: '',
        availability: '',
        isAvailable: true,
        isMentor: false,
        profilePicture: '',     // keep this in form if you allow uploading
    };
    const [form, setForm] = useState(emptyForm);

    const bool = v => v === true || v === 'true';

    /* ───────── fetch ───────── */
    useEffect(() => {
        (async () => {
            try {
                const { data } = await apiClient.get(API.mentors.getAll());
                setProfiles(data.data);
                const mine = data.data.find(p => p.editable);
                if (mine) setAmAvailable(mine.isAvailable);
            } catch (err) {
                console.error('Fetch mentors:', err);
            }
        })();
    }, [userId]);

    /* ───────── message ───────── */
    const handleMessage = async mentor => {
        try {
            const res = await apiClient.post(
                API.conversations.getOrCreate,
                { user1: userId, user2: mentor.owner },
                { headers: { 'Content-Type': 'application/json' } },
            );
            router.push({
                pathname: '/ConversationScreen',
                params: { conversation: JSON.stringify(res.data) },
            });
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || err.message);
        }
    };

    /* ───────── toggle availability ───────── */
    const toggleAvailability = async () => {
        const mine = profiles.find(p => p.editable);
        if (!mine) return Alert.alert('Create a profile first');
        const newStat = !amAvailable;
        try {
            await apiClient.put(API.mentors.update(mine._id), {
                ...mine,
                isAvailable: newStat,
            });
            setAmAvailable(newStat);
            setProfiles(arr =>
                arr.map(p =>
                    p._id === mine._id ? { ...p, isAvailable: newStat } : p,
                ),
            );
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || err.message);
        }
    };

    /* ───────── CRUD ───────── */
    const onChange = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
    const submit = () => (editing ? _update() : _create());

    const _create = async () => {
        if (!form.name || !form.expertise)
            return Alert.alert('Name & expertise are required');
        try {
            const { data } = await apiClient.post(API.mentors.create(), form);
            setProfiles(p => [...p, { ...data.data, editable: true }]);
            setAmAvailable(bool(data.data.isAvailable));
            setModalVisible(false);
            setForm(emptyForm);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || err.message);
        }
    };

    const _update = async () => {
        if (!editing) return;
        if (!form.name || !form.expertise)
            return Alert.alert('Name & expertise are required');

        try {
            const { data } = await apiClient.put(API.mentors.update(editing._id), form);

            // *** PRESERVE owner & editable in the updated item ***
            setProfiles(p =>
                p.map(x =>
                    x._id === editing._id
                        ? {
                            ...x,            // keep x.owner, x.editable
                            ...data.data,    // overwrite updated fields
                        }
                        : x,
                ),
            );

            setAmAvailable(bool(data.data.isAvailable));
            setModalVisible(false);
            setEditing(null);
            setForm(emptyForm);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || err.message);
        }
    };

    const _remove = prof =>
        Alert.alert('Delete profile?', '', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiClient.delete(API.mentors.delete(prof._id));
                        setProfiles(p => p.filter(x => x._id !== prof._id));
                        setModalVisible(false);
                    } catch (err) {
                        Alert.alert('Error', err.response?.data?.message || err.message);
                    }
                },
            },
        ]);

    /* ───────── list filtering ───────── */
    const displayed =
        viewMode === 'find'
            ? profiles.filter(p => p.isMentor)
            : profiles.filter(p => !p.isMentor || p.editable);

    /* ───────── avatar ───────── */
    const Avatar = ({ profile }) => {
        let uri = '';
        if (profile.profilePicture) {
            uri = profile.profilePicture.startsWith('http')
                ? profile.profilePicture
                : `${ASSET_BASEURL}${profile.profilePicture}`;
        } else if (profile.owner && profile.owner.profilePicture) {
            uri = profile.owner.profilePicture.startsWith('http')
                ? profile.owner.profilePicture
                : `${ASSET_BASEURL}${profile.owner.profilePicture}`;
        } else {
            uri = 'https://picsum.photos/60';
        }
        return <Image source={{ uri }} style={styles.avatar} />;
    };

    /* ───────── card ───────── */
    const Card = ({ item }) => (
        <View
            style={[
                styles.card,
                !item.isAvailable && styles.unavailableCard,
                item.isMentor && styles.mentorCard,
            ]}>
            <Avatar profile={item} />
            <View style={styles.info}>
                <View style={styles.row}>
                    <Text style={styles.name}>{item.name}</Text>
                    {!item.isAvailable && (
                        <View style={styles.unTag}>
                            <Text style={styles.tagTxt}>Unavailable</Text>
                        </View>
                    )}
                    {item.isMentor && (
                        <View style={styles.mTag}>
                            <Text style={styles.tagTxt}>Mentor</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.expertise}>{item.expertise}</Text>
                {item.bio && (
                    <Text style={styles.small}>
                        <Text style={styles.bold}>Bio: </Text>
                        {item.bio}
                    </Text>
                )}
                {item.availability && (
                    <Text style={styles.small}>
                        <Text style={styles.bold}>Available: </Text>
                        {item.availability}
                    </Text>
                )}
            </View>

            <View style={styles.btnCol}>
                {item.editable ? (
                    <>
                        <TouchableOpacity
                            style={[styles.btn, styles.edit]}
                            onPress={() => {
                                setEditing(item);
                                setForm(item);
                                setModalVisible(true);
                            }}>
                            <Text style={styles.btnTxt}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, styles.del]}
                            onPress={() => _remove(item)}>
                            <Text style={styles.btnTxt}>Delete</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.btn, styles.req]}
                        disabled={!item.isAvailable}
                        onPress={() => handleMessage(item)}>
                        <Text style={styles.btnTxt}>Message</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const mine = profiles.find(p => p.editable);

    /* ───────── render ───────── */
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='light-content' />
            <View style={styles.header}>
                <Text style={styles.h1}>Mentor Connect</Text>
                <Text style={styles.h2}>Find guidance from experienced mentors</Text>
            </View>

            {/* top bar */}
            <View style={styles.topBar}>
                {mine ? (
                    <View style={styles.avWrap}>
                        <Text style={styles.avLbl}>
                            Status:{' '}
                            <Text style={amAvailable ? styles.green : styles.red}>
                                {amAvailable ? 'Available' : 'Unavailable'}
                            </Text>
                        </Text>
                        <Switch
                            value={amAvailable}
                            onValueChange={toggleAvailability}
                            trackColor={{ false: '#FF5722', true: '#4CAF50' }}
                            thumbColor={amAvailable ? '#27ae60' : '#e74c3c'}
                        />
                    </View>
                ) : (
                    <Text style={styles.noProf}>Create a profile to set availability</Text>
                )}

                {mine ? (
                    <TouchableOpacity
                        style={styles.editProf}
                        onPress={() => {
                            setEditing(mine);
                            setForm(mine);
                            setModalVisible(true);
                        }}>
                        <Text style={styles.editTxt}>Edit Profile</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.add}
                        onPress={() => {
                            setEditing(null);
                            setForm(emptyForm);
                            setModalVisible(true);
                        }}>
                        <Text style={styles.addTxt}>+ Create Profile</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, viewMode === 'find' && styles.tabOn]}
                    onPress={() => setViewMode('find')}>
                    <Text style={[styles.tabTxt, viewMode === 'find' && styles.tabTxtOn]}>
                        Find Mentors
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, viewMode === 'become' && styles.tabOn]}
                    onPress={() => setViewMode('become')}>
                    <Text
                        style={[styles.tabTxt, viewMode === 'become' && styles.tabTxtOn]}>
                        Become a Mentor
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayed}
                renderItem={Card}
                keyExtractor={i => i._id.toString()}
                contentContainerStyle={styles.list}
            />

            {/* modal */}
            <Modal
                transparent
                animationType='slide'
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setEditing(null);
                }}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.mTitle}>
                            {editing ? 'Edit Your Profile' : 'Create Your Profile'}
                        </Text>
                        <ScrollView>
                            <Text style={styles.label}>Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.name}
                                onChangeText={t => onChange('name', t)}
                            />
                            <Text style={styles.label}>Expertise *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.expertise}
                                onChangeText={t => onChange('expertise', t)}
                            />
                            <Text style={styles.label}>Experience</Text>
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                value={form.experience}
                                onChangeText={t => onChange('experience', t)}
                                multiline
                            />
                            <Text style={styles.label}>Bio</Text>
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                value={form.bio}
                                onChangeText={t => onChange('bio', t)}
                                multiline
                            />
                            <Text style={styles.label}>Availability</Text>
                            <TextInput
                                style={styles.input}
                                value={form.availability}
                                onChangeText={t => onChange('availability', t)}
                            />
                            <View style={styles.swRow}>
                                <Text style={styles.label}>I want to be a mentor</Text>
                                <Switch
                                    value={form.isMentor}
                                    onValueChange={v => onChange('isMentor', v)}
                                />
                            </View>
                            <View style={styles.swRow}>
                                <Text style={styles.label}>Available</Text>
                                <Switch
                                    value={form.isAvailable}
                                    onValueChange={v => onChange('isAvailable', v)}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.mBtnRow}>
                            <TouchableOpacity
                                style={[styles.mBtn, styles.cancel]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setEditing(null);
                                }}>
                                <Text style={styles.cancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mBtn, styles.save]}
                                onPress={submit}>
                                <Text style={styles.saveTxt}>
                                    {editing ? 'Update' : 'Create'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
/* ───────── styles (unchanged) ───────── */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 16, backgroundColor: '#8A2BE2', alignItems: 'center' },
    h1: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    h2: { fontSize: 14, color: '#fff', opacity: 0.8 },

    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
    },
    avWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avLbl: { fontSize: 16, fontWeight: '600', marginRight: 12 },
    green: { color: '#4CAF50', fontWeight: 'bold' },
    red: { color: '#FF5722', fontWeight: 'bold' },
    noProf: { flex: 1, color: '#777', fontStyle: 'italic' },
    editProf: {
        backgroundColor: '#8A2BE2',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    editTxt: { color: '#fff', fontWeight: '600' },
    add: {
        backgroundColor: '#8A2BE2',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    addTxt: { color: '#fff', fontWeight: '600' },

    tabs: { flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 8 },
    tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
    tabOn: { backgroundColor: '#8A2BE2' },
    tabTxt: { fontWeight: '600', color: '#555' },
    tabTxtOn: { color: '#fff' },

    list: { padding: 16 },

    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
    },
    unavailableCard: { opacity: 0.8, borderLeftWidth: 4, borderLeftColor: '#FF5722' },
    mentorCard: { borderLeftWidth: 4, borderLeftColor: '#8A2BE2' },

    avatar: { width: 60, height: 60, borderRadius: 30 },
    info: { flex: 1, marginLeft: 16 },
    row: { flexDirection: 'row', alignItems: 'center' },
    name: { fontSize: 18, fontWeight: 'bold' },
    unTag: {
        backgroundColor: '#FF5722',
        borderRadius: 4,
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    mTag: {
        backgroundColor: '#8A2BE2',
        borderRadius: 4,
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    tagTxt: { color: '#fff', fontSize: 10, fontWeight: '600' },
    expertise: { fontSize: 14, color: '#555', marginTop: 2 },
    small: { fontSize: 12, color: '#777', marginTop: 2 },
    bold: { fontWeight: '600' },

    btnCol: { alignItems: 'center', justifyContent: 'center' },
    btn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        width: 90,
        alignItems: 'center',
        marginVertical: 2,
    },
    req: { backgroundColor: '#2196F3' },
    edit: { backgroundColor: '#8A2BE2' },
    del: { backgroundColor: '#e74c3c' },
    btnTxt: { color: '#fff', fontWeight: '600', fontSize: 12 },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
    mTitle: { fontSize: 20, fontWeight: 'bold', color: '#8A2BE2', textAlign: 'center' },
    label: { marginTop: 12, fontWeight: '600' },
    input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 },
    textarea: { height: 80, textAlignVertical: 'top' },
    swRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    mBtnRow: { flexDirection: 'row', marginTop: 24 },
    mBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
    cancel: { backgroundColor: '#f5f5f5', marginRight: 8 },
    save: { backgroundColor: '#8A2BE2', marginLeft: 8 },
    cancelTxt: { fontWeight: '600' },
    saveTxt: { color: '#fff', fontWeight: '600' },
});
