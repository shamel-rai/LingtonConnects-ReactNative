// screens/RoadmapApp.js

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router'; // ← CHANGED

import apiClient from "../../utils/axiosSetup";
import API from "../../utils/api";

const { width } = Dimensions.get("window");

const THEME = {
  primary: ["#4A00E0", "#8E2DE2"],
  accent: ["#7A88FF", "#FD71AF"],
  nodeColors: [
    ["#38bdf8", "#0ea5e9"],
    ["#8b5cf6", "#6366f1"],
    ["#ec4899", "#db2777"],
    ["#3b82f6", "#2563eb"],
    ["#f472b6", "#be185d"],
  ],
  background: "#F9FAFC",
  cardBg: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
};

export default function RoadmapApp() {
  const router = useRouter(); // ← CHANGED

  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [roadmapDetails, setRoadmapDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [animatedValues] = useState({
    rotation: new Animated.Value(0),
    scale: new Animated.Value(1),
  });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API.Roadmap.getAll());
      setRoadmaps(res.data);
    } catch (err) {
      console.error("Error fetching roadmaps:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmapDetails = async (id) => {
    setLoading(true);
    try {
      const res = await apiClient.get(API.Roadmap.getById(id));
      setRoadmapDetails(res.data);
      setHasAccess(!!res.data.userHasAccess);
      if (res.data.section && res.data.section.length > 0) {
        setExpandedSection(0);
      }
    } catch (err) {
      console.error("Error fetching roadmap details:", err);
      setSelectedRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoadmap = (id) => {
    Animated.sequence([
      Animated.timing(animatedValues.scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues.scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    setSelectedRoadmap(id);
    fetchRoadmapDetails(id);
  };

  const toggleSection = (index) => {
    Animated.timing(animatedValues.rotation, {
      toValue: expandedSection === index ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpandedSection(expandedSection === index ? null : index);
  };

  const getNodeColor = (i) => THEME.nodeColors[i % THEME.nodeColors.length];

  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={THEME.primary[0]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );

  const AccessRestrictedOverlay = () => (
    <View style={styles.accessOverlay}>
      <BlurView intensity={90} style={styles.blurView} tint="light">
        <View style={styles.restrictedCard}>
          <LinearGradient
            colors={THEME.primary}
            style={styles.lockIconContainer}
          >
            <Text style={styles.lockIcon}>🔒</Text>
          </LinearGradient>
          <Text style={styles.restrictedTitle}>Premium Content</Text>
          <Text style={styles.restrictedDescription}>
            Upgrade your account to access this roadmap and accelerate your learning.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('ProfilePage')} // ← CHANGED
          >
            <LinearGradient
              colors={THEME.accent}
              style={styles.upgradeButtonGradient}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedRoadmap(null)}
            style={styles.backToRoadmapsButton}
          >
            <Text style={styles.backToRoadmapsText}>Back to Roadmaps</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );

  const RoadmapSelector = () => (
    <ScrollView
      style={styles.selectorContainer}
      contentContainerStyle={styles.selectorContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.selectorTitle}>Choose Your Path</Text>
      <Text style={styles.selectorSubtitle}>
        Select a roadmap to begin your learning journey
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary[0]} />
          <Text style={styles.loadingText}>Loading roadmaps...</Text>
        </View>
      ) : (
        <View style={styles.roadmapGrid}>
          {roadmaps.map((rm, i) => (
            <TouchableOpacity
              key={rm._id}
              style={[
                styles.roadmapCard,
                i % 2 === 0 ? styles.cardLeft : styles.cardRight
              ]}
              onPress={() => handleSelectRoadmap(rm._id)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={getNodeColor(i)}
                style={styles.cardColorBlock}
              />
              <Text style={styles.cardTitle}>{rm.title}</Text>
              <Text style={styles.cardSubtitle}>
                {rm.estimatedTime || "Self-paced"}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>
                  {rm.difficulty || "All levels"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const RoadmapView = () => {
    const rotate = animatedValues.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={THEME.primary}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedRoadmap(null)}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {roadmapDetails.title}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.roadmapContent}
          contentContainerStyle={styles.roadmapContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {roadmapDetails.section.map((section, idx) => (
            <View key={idx} style={styles.roadmapSection}>
              {idx > 0 && (
                <View style={styles.connector}>
                  <LinearGradient
                    colors={getNodeColor(idx)}
                    style={styles.gradientConnector}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.sectionNode,
                  expandedSection === idx && styles.expandedSectionNode
                ]}
                onPress={() => toggleSection(idx)}
                activeOpacity={0.8}
              >
                <View style={styles.nodeColorIndicator}>
                  <LinearGradient
                    colors={getNodeColor(idx)}
                    style={styles.colorIndicatorGradient}
                  />
                </View>
                <View style={styles.nodeContent}>
                  <Text style={styles.sectionNodeTitle}>{section.title}</Text>
                  <Text style={styles.sectionNodeSubtitle}>
                    {section.topics?.length || 0} topics
                  </Text>
                </View>
                <Animated.Text style={[styles.chevron, { transform: [{ rotate }] }]}>
                  ▼
                </Animated.Text>
              </TouchableOpacity>

              {expandedSection === idx && (
                <View style={[styles.expandedContent, { borderLeftColor: getNodeColor(idx)[0] }]}>
                  {section.topics.map((t, ti) => (
                    <View key={ti} style={styles.topicCard}>
                      <Text style={styles.topicTitle}>{t.title}</Text>
                      {t.description && (
                        <Text style={styles.topicDescription} numberOfLines={2}>
                          {t.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (!selectedRoadmap) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <RoadmapSelector />
      </View>
    );
  }

  if (loading || !roadmapDetails) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LoadingOverlay />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <RoadmapView />
      {!hasAccess && <AccessRestrictedOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background
  },
  selectorContainer: {
    flex: 1
  },
  selectorContent: {
    padding: 20,
    paddingBottom: 40
  },
  selectorTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.textPrimary,
    marginBottom: 8
  },
  selectorSubtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginBottom: 24
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: THEME.cardBg,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: THEME.textPrimary,
  },
  roadmapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  roadmapCard: {
    width: "48%",
    backgroundColor: THEME.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLeft: {
    marginRight: 4
  },
  cardRight: {
    marginLeft: 4
  },
  cardColorBlock: {
    height: 6,
    borderRadius: 3,
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textPrimary,
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 12
  },
  cardFooter: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 8
  },
  cardFooterText: {
    fontSize: 12,
    color: THEME.textSecondary
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 16,
    paddingHorizontal: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    marginRight: 16
  },
  backButtonText: {
    color: "#fff"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1
  },
  roadmapContent: {
    flex: 1
  },
  roadmapContentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  roadmapSection: {
    alignItems: "center",
    marginBottom: 16
  },
  connector: {
    height: 36,
    justifyContent: "center",
    alignItems: "center"
  },
  gradientConnector: {
    width: 3,
    height: "100%",
    borderRadius: 2
  },
  sectionNode: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.cardBg,
    borderRadius: 12,
    padding: 16,
    width: width - 40,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expandedSectionNode: {
    backgroundColor: "rgba(74,0,224,0.06)",
    borderWidth: 1,
    borderColor: "rgba(74,0,224,0.1)"
  },
  nodeColorIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
    overflow: "hidden"
  },
  colorIndicatorGradient: {
    flex: 1
  },
  nodeContent: {
    flex: 1
  },
  sectionNodeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textPrimary,
    marginBottom: 2
  },
  sectionNodeSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary
  },
  chevron: {
    marginLeft: 8,
    fontSize: 16,
    color: THEME.textSecondary
  },
  expandedContent: {
    width: width - 80,
    backgroundColor: THEME.cardBg,
    padding: 12,
    borderLeftWidth: 2,
    marginTop: 8,
    borderRadius: 8
  },
  topicCard: {
    marginBottom: 8
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.textPrimary
  },
  topicDescription: {
    fontSize: 12,
    color: THEME.textSecondary
  },
  accessOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%"
  },
  restrictedCard: {
    width: width * 0.8,
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 20,
    alignItems: "center"
  },
  lockIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  lockIcon: {
    fontSize: 24
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.textPrimary,
    marginBottom: 8,
    textAlign: "center"
  },
  restrictedDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "center",
    marginBottom: 16
  },
  upgradeButton: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12
  },
  upgradeButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8
  },
  upgradeButtonText: {
    color: "#fff",
    fontWeight: "600"
  },
  backToRoadmapsButton: {
    padding: 8
  },
  backToRoadmapsText: {
    color: THEME.primary[0],
    fontWeight: "500"
  }
});
