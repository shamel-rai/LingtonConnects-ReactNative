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
  Switch
} from 'react-native';
import API from '../../utils/api';
import apiClient from '../../utils/axiosSetup';
import { AuthContext } from '../../Context/AuthContext';

const StudyBuddyMatchingScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  // When editing, this holds the buddy being updated
  const [editingBuddy, setEditingBuddy] = useState(null);
  // Form state for new or updated profile
  const [newProfile, setNewProfile] = useState({
    name: '',
    course: '',
    interests: '',
    bio: '',
    availability: '',
    isAvailable: true, // New field for availability toggle
  });
  const [studyBuddies, setStudyBuddies] = useState([]);
  const { userId } = useContext(AuthContext);
  const [userIsAvailable, setUserIsAvailable] = useState(true); // User's availability state

  // Fetch study buddy profiles from the backend when the screen loads
  useEffect(() => {
    fetchStudyBuddies();
  }, []);

  const fetchStudyBuddies = async () => {
    try {
      const response = await apiClient.get(API.studybuddy.getAll());
      setStudyBuddies(response.data.data);

      // Find current user's buddy profile to set initial availability state
      const userBuddy = response.data.data.find(buddy => buddy.owner === userId || buddy.owner === userId?.toString());
      if (userBuddy) {
        setUserIsAvailable(userBuddy.isAvailable !== false); // Default to true if not specified
      }
    } catch (error) {
      console.error("Error fetching study buddies:", error);
    }
  };

  // Toggle user's availability status
  const toggleAvailability = async () => {
    const newAvailabilityStatus = !userIsAvailable;

    // Find the user's profile
    const userProfile = studyBuddies.find(buddy => buddy.owner === userId || buddy.owner === userId?.toString());

    if (!userProfile) {
      Alert.alert('Profile Required', 'Please create a profile first to set your availability.');
      return;
    }

    try {
      const payload = {
        ...userProfile,
        interest: userProfile.interest, // Keep the original interest field name for backend
        isAvailable: newAvailabilityStatus,
      };

      const response = await apiClient.put(API.studybuddy.update(userProfile._id), payload);

      // Update local state
      setUserIsAvailable(newAvailabilityStatus);
      setStudyBuddies(
        studyBuddies.map(buddy =>
          buddy._id === userProfile._id ? { ...buddy, isAvailable: newAvailabilityStatus } : buddy
        )
      );

      Alert.alert('Status Updated', `You are now ${newAvailabilityStatus ? 'available' : 'unavailable'} for study sessions.`);
    } catch (error) {
      console.error("Error updating availability:", error);
      Alert.alert('Error', error.response?.data?.message || error.message);
    }
  };

  // Utility functions to compute an avatar color and initials if not provided by backend
  const defaultColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#d35400', '#16a085'];
  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % defaultColors.length;
    return defaultColors[index];
  };

  const getInitials = (name) => {
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else {
      return name.substring(0, 2).toUpperCase();
    }
  };

  // Renders the avatar circle with computed color and initials
  const ProfileAvatar = ({ buddy }) => {
    const color = buddy.profileColor || getAvatarColor(buddy.name);
    const initials = buddy.initials || getInitials(buddy.name);
    return (
      <View style={[styles.profileAvatar, { backgroundColor: color }]}>
        <Text style={styles.profileInitials}>{initials}</Text>
      </View>
    );
  };

  // Create a new study buddy profile via backend POST request
  const handleAddProfile = async () => {
    if (!newProfile.name || !newProfile.course || !newProfile.interests) {
      Alert.alert('Required Fields', 'Name, Course, and Interests are required.');
      return;
    }
    try {
      // Map frontend field "interests" to backend "interest"
      const payload = {
        name: newProfile.name,
        course: newProfile.course,
        interest: newProfile.interests,
        bio: newProfile.bio,
        availability: newProfile.availability,
        isAvailable: newProfile.isAvailable,
      };
      const response = await apiClient.post(API.studybuddy.create(), payload);
      // Append the newly created buddy to state
      setStudyBuddies([...studyBuddies, response.data.data]);
      setNewProfile({
        name: '',
        course: '',
        interests: '',
        bio: '',
        availability: '',
        isAvailable: true,
      });
      setModalVisible(false);
      // Set user's availability based on the profile
      setUserIsAvailable(response.data.data.isAvailable !== false);
      Alert.alert('Success', 'Your study buddy profile has been created!');
    } catch (error) {
      console.error("Error creating study buddy profile:", error);
      Alert.alert('Error', error.response?.data?.message || error.message);
    }
  };

  // Update an existing profile via backend PUT request
  const handleUpdateProfile = async () => {
    if (!editingBuddy) return;
    if (!newProfile.name || !newProfile.course || !newProfile.interests) {
      Alert.alert('Required Fields', 'Name, Course, and Interests are required.');
      return;
    }
    try {
      const payload = {
        name: newProfile.name,
        course: newProfile.course,
        interest: newProfile.interests,
        bio: newProfile.bio,
        availability: newProfile.availability,
        isAvailable: newProfile.isAvailable,
      };
      const response = await apiClient.put(API.studybuddy.update(editingBuddy._id), payload);
      setStudyBuddies(
        studyBuddies.map(buddy =>
          buddy._id === editingBuddy._id ? response.data.data : buddy
        )
      );

      // If this is the user's profile, update the availability state
      if (editingBuddy.owner === userId || editingBuddy.owner === userId?.toString()) {
        setUserIsAvailable(response.data.data.isAvailable !== false);
      }

      setEditingBuddy(null);
      setNewProfile({
        name: '',
        course: '',
        interests: '',
        bio: '',
        availability: '',
        isAvailable: true,
      });
      setModalVisible(false);
      Alert.alert('Success', 'Your study buddy profile has been updated!');
    } catch (error) {
      console.error("Error updating study buddy profile:", error);
      Alert.alert('Error', error.response?.data?.message || error.message);
    }
  };

  // Delete a profile via backend DELETE request (with confirmation)
  const handleDeleteProfile = async (buddy) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your profile?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(API.studybuddy.delete(buddy._id));
              setStudyBuddies(studyBuddies.filter(b => b._id !== buddy._id));
              Alert.alert('Deleted', 'Your profile has been deleted.');
            } catch (error) {
              console.error("Error deleting profile:", error);
              Alert.alert('Error', error.response?.data?.message || error.message);
            }
          }
        }
      ]
    );
  };

  // Functions for non-owner actions (currently only update local state; you can later integrate messaging)
  const handleConnect = (id) => {
    setStudyBuddies(
      studyBuddies.map(buddy =>
        buddy._id === id ? { ...buddy, connected: true } : buddy
      )
    );
    Alert.alert('Connect', 'Connection request sent.');
  };

  const handleMessage = (id, name) => {
    Alert.alert(`Message ${name}`, `Opening chat with ${name}`);
  };

  // Prepare the modal for both creating and editing. When editing, pre-populate fields.
  const handleEdit = (buddy) => {
    setEditingBuddy(buddy);
    setNewProfile({
      name: buddy.name,
      course: buddy.course,
      interests: buddy.interest,
      bio: buddy.bio,
      availability: buddy.availability,
      isAvailable: buddy.isAvailable !== false, // Default to true if not specified
    });
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (editingBuddy) {
      handleUpdateProfile();
    } else {
      handleAddProfile();
    }
  };

  // Update form state on input changes
  const handleInputChange = (field, value) => {
    setNewProfile({
      ...newProfile,
      [field]: value
    });
  };

  // Render each study buddy card. Added expanded details for profiles.
  const renderItem = ({ item }) => {
    const isOwner = item.owner === userId || item.owner === userId?.toString();
    const isAvailable = item.isAvailable !== false; // Default to true if not specified

    return (
      <View style={[
        styles.card,
        !isAvailable && styles.unavailableCard
      ]}>
        <ProfileAvatar buddy={item} />

        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{item.name}</Text>
            {!isAvailable &&
              <View style={styles.unavailableTag}>
                <Text style={styles.unavailableText}>Unavailable</Text>
              </View>
            }
          </View>

          <Text style={styles.course}>{item.course}</Text>

          {/* Expanded information display */}
          <Text style={styles.interests} numberOfLines={2}>
            <Text style={styles.interestsLabel}>Interests: </Text>
            {item.interest}
          </Text>

          {item.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              <Text style={styles.bioLabel}>Bio: </Text>
              {item.bio}
            </Text>
          )}

          {item.availability && (
            <Text style={styles.availability} numberOfLines={1}>
              <Text style={styles.availabilityLabel}>Available: </Text>
              {item.availability}
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {isOwner ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteProfile(item)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.connectButton,
                  item.connected && styles.connectedButton,
                  !isAvailable && styles.disabledButton
                ]}
                onPress={() => handleConnect(item._id)}
                disabled={item.connected || !isAvailable}
              >
                <Text style={styles.buttonText}>
                  {item.connected ? 'Connected' : (isAvailable ? 'Connect' : 'Unavailable')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.messageButton]}
                onPress={() => handleMessage(item._id, item.name)}
              >
                <Text style={styles.buttonText}>Message</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // Check if the user has a profile
  const userHasProfile = studyBuddies.some(buddy =>
    buddy.owner === userId || buddy.owner === userId?.toString()
  );

  // Get user's profile
  const userProfile = studyBuddies.find(buddy =>
    buddy.owner === userId || buddy.owner === userId?.toString()
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Buddies</Text>
        <Text style={styles.headerSubtitle}>Find your perfect study partner</Text>
      </View>

      {/* Action row with availability toggle and add button */}
      <View style={styles.actionContainer}>
        {userHasProfile ? (
          <View style={styles.availabilityToggleContainer}>
            <Text style={styles.availabilityLabel}>
              Status: <Text style={userIsAvailable ? styles.availableText : styles.unavailableText}>
                {userIsAvailable ? "Available" : "Unavailable"}
              </Text>
            </Text>
            <Switch
              value={userIsAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#FF5722', true: '#4CAF50' }}
              thumbColor={userIsAvailable ? '#27ae60' : '#e74c3c'}
              style={styles.availabilitySwitch}
            />
          </View>
        ) : (
          <View style={styles.noProfileContainer}>
            <Text style={styles.noProfileText}>Create a profile to set your availability</Text>
          </View>
        )}

        {userHasProfile ? (
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => handleEdit(userProfile)}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingBuddy(null);
              setNewProfile({
                name: '',
                course: '',
                interests: '',
                bio: '',
                availability: '',
                isAvailable: true,
              });
              setModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Create Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={studyBuddies}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal for creating or editing a profile - Removed preferred study location */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingBuddy(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingBuddy ? "Edit Your Study Buddy Profile" : "Create Your Study Buddy Profile"}
            </Text>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newProfile.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Your full name"
              />

              <Text style={styles.inputLabel}>Course/Major *</Text>
              <TextInput
                style={styles.input}
                value={newProfile.course}
                onChangeText={(text) => handleInputChange('course', text)}
                placeholder="Your main field of study"
              />

              <Text style={styles.inputLabel}>Interests *</Text>
              <TextInput
                style={styles.input}
                value={newProfile.interests}
                onChangeText={(text) => handleInputChange('interests', text)}
                placeholder="Your academic interests (comma separated)"
              />

              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newProfile.bio}
                onChangeText={(text) => handleInputChange('bio', text)}
                placeholder="Tell others about yourself..."
                multiline={true}
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Availability</Text>
              <TextInput
                style={styles.input}
                value={newProfile.availability}
                onChangeText={(text) => handleInputChange('availability', text)}
                placeholder="When are you available to study?"
              />

              {/* Availability Toggle in Form */}
              <View style={styles.availabilityToggleContainer}>
                <Text style={styles.inputLabel}>Available for Study Sessions</Text>
                <Switch
                  value={newProfile.isAvailable}
                  onValueChange={(value) => handleInputChange('isAvailable', value)}
                  trackColor={{ false: '#FF5722', true: '#4CAF50' }}
                  thumbColor={newProfile.isAvailable ? '#27ae60' : '#e74c3c'}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingBuddy(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editingBuddy ? "Update Profile" : "Create Profile"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#4A00E0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  availabilityToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  availableText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  unavailableText: {
    color: '#FF5722',
    fontWeight: 'bold',
  },
  availabilitySwitch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  noProfileContainer: {
    flex: 1,
  },
  noProfileText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
  editProfileButton: {
    backgroundColor: '#f39c12',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unavailableCard: {
    opacity: 0.8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  unavailableTag: {
    backgroundColor: '#FF5722',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unavailableText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  course: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  interests: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  interestsLabel: {
    fontWeight: '600',
  },
  bio: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  bioLabel: {
    fontWeight: '600',
  },
  availability: {
    fontSize: 12,
    color: '#777',
  },
  availabilityLabel: {
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    width: 90,
  },
  connectButton: {
    backgroundColor: '#4A00E0',
  },
  connectedButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#bbb',
  },
  messageButton: {
    backgroundColor: '#2196F3',
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A00E0',
    marginBottom: 16,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#4A00E0',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default StudyBuddyMatchingScreen;