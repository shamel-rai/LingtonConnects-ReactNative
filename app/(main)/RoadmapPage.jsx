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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "../../utils/axiosSetup";
import API from "../../utils/api";

const { width } = Dimensions.get("window");

// Simplified Theme Colors with a consistent palette
const THEME = {
  primary: ["#4A00E0", "#8E2DE2"], // Vibrant purple gradient
  accent: ["#7A88FF", "#FD71AF"], // Secondary accent gradient
  nodeColors: [
    ["#38bdf8", "#0ea5e9"], // Blue
    ["#8b5cf6", "#6366f1"], // Purple
    ["#ec4899", "#db2777"], // Pink
    ["#3b82f6", "#2563eb"], // Darker blue
    ["#f472b6", "#be185d"], // Darker pink
  ],
  background: "#F9FAFC", // Lighter, more modern gray
  cardBg: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  completion: ["#F59E0B", "#D97706"], // Orange/amber gradient for completion
};

const RoadmapApp = () => {
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [roadmapDetails, setRoadmapDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [animatedValues] = useState({
    rotation: new Animated.Value(0),
    scale: new Animated.Value(1)
  });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API.Roadmap.getAll());
      console.log("Roadmap data: ", response.data);
      setRoadmaps(response.data);
    } catch (error) {
      console.error("Error fetching roadmaps: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmapDetails = async (roadmapId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(API.Roadmap.getById(roadmapId));
      console.log("Roadmap details data: ", response.data);
      setRoadmapDetails(response.data);
      // Auto-expand first section
      if (response.data && response.data.section && response.data.section.length > 0) {
        setExpandedSection(0);
      }
    } catch (error) {
      console.error("Error fetching roadmap details: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoadmap = (roadmapId) => {
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
      })
    ]).start();

    setSelectedRoadmap(roadmapId);
    fetchRoadmapDetails(roadmapId);
  };

  const toggleSection = (index) => {
    // Add animation for section expansion/collapse
    Animated.timing(animatedValues.rotation, {
      toValue: expandedSection === index ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setExpandedSection(expandedSection === index ? null : index);
  };

  // Get a color based on the index for visual variety
  const getNodeColor = (index) => {
    return THEME.nodeColors[index % THEME.nodeColors.length];
  };

  const RoadmapSelector = () => (
    <ScrollView
      style={styles.selectorContainer}
      contentContainerStyle={styles.selectorContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.selectorTitle}>Choose Your Path</Text>
      <Text style={styles.selectorSubtitle}>
        Select a roadmap to start your learning journey
      </Text>

      <View style={styles.roadmapGrid}>
        {roadmaps.map((rm, index) => (
          <TouchableOpacity
            key={rm._id}
            style={[styles.roadmapCard, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}
            onPress={() => handleSelectRoadmap(rm._id)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={getNodeColor(index)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardColorBlock}
            />
            <Text style={styles.cardTitle}>{rm.title}</Text>
            <Text style={styles.cardSubtitle}>
              {rm.estimatedTime || "Self-paced"} • {rm.level || "All levels"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Graphical Roadmap View
  const RoadmapView = () => {
    const rotateIndicator = animatedValues.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={THEME.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedRoadmap(null);
                setRoadmapDetails(null);
              }}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {roadmapDetails ? roadmapDetails.title : "Roadmap"}
            </Text>
          </View>

          {roadmapDetails && (
            <View style={styles.roadmapHero}>
              <View style={styles.heroContent}>
                <Text style={styles.heroText}>
                  {roadmapDetails.description || "Your learning journey starts here"}
                </Text>
                <View style={styles.metaContainer}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>{roadmapDetails.estimatedTime || "Self-paced"}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>{roadmapDetails.level || "All levels"}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>

        <ScrollView
          style={styles.roadmapContent}
          contentContainerStyle={styles.roadmapContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {roadmapDetails && roadmapDetails.section && roadmapDetails.section.length > 0 ? (
            <View style={styles.graphicalRoadmap}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '40%' }]} />
                </View>
                <Text style={styles.progressText}>40% Complete</Text>
              </View>

              {/* Main Roadmap Flow */}
              {roadmapDetails.section.map((section, index) => {
                const nodeColors = getNodeColor(index);
                const isLast = index === roadmapDetails.section.length - 1;

                return (
                  <View key={index} style={styles.roadmapSection}>
                    {/* Connector line */}
                    {index > 0 && (
                      <View style={styles.connector}>
                        <LinearGradient
                          colors={nodeColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={styles.gradientConnector}
                        />
                      </View>
                    )}

                    {/* Section Node */}
                    <TouchableOpacity
                      style={[
                        styles.sectionNode,
                        expandedSection === index && styles.expandedSectionNode,
                      ]}
                      onPress={() => toggleSection(index)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.nodeColorIndicator}>
                        <LinearGradient
                          colors={nodeColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.colorIndicatorGradient}
                        />
                      </View>
                      <View style={styles.nodeContent}>
                        <Text style={styles.sectionNodeTitle}>{section.title}</Text>
                        {section.description && (
                          <Text style={styles.sectionNodeDescription} numberOfLines={2}>
                            {section.description}
                          </Text>
                        )}
                      </View>
                      <Animated.View style={{ transform: [{ rotate: rotateIndicator }] }}>
                        <Text style={styles.expandCollapseIndicator}>▼</Text>
                      </Animated.View>
                    </TouchableOpacity>

                    {/* Expanded section content */}
                    {expandedSection === index && (
                      <View style={[
                        styles.expandedContent,
                        { borderLeftColor: nodeColors[0] }
                      ]}>
                        {section.topics && section.topics.length > 0 ? (
                          section.topics.map((topic, tIndex) => (
                            <Animated.View
                              key={tIndex}
                              style={[
                                styles.topicCard,
                                { transform: [{ scale: animatedValues.scale }] }
                              ]}
                            >
                              <View style={styles.topicHeader}>
                                <View style={[
                                  styles.topicColorIndicator,
                                  { backgroundColor: nodeColors[0] }
                                ]} />
                                <Text style={styles.topicTitle}>{topic.title}</Text>
                              </View>

                              {topic.description && (
                                <Text style={styles.topicDescription}>
                                  {topic.description}
                                </Text>
                              )}
                            </Animated.View>
                          ))
                        ) : (
                          <View style={styles.emptyTopicsCard}>
                            <Text style={styles.emptyTopicsText}>No topics available for this section</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Final milestone */}
              <View style={styles.finalMilestone}>
                <View style={styles.connector}>
                  <LinearGradient
                    colors={THEME.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.gradientConnector}
                  />
                </View>
                <View style={styles.milestoneNode}>
                  <Text style={styles.milestoneTitle}>Completion</Text>
                  <Text style={styles.milestoneSubtitle}>Master your skills</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyRoadmap}>
              <Text style={styles.emptyRoadmapTitle}>No Roadmap Found</Text>
              <Text style={styles.emptyRoadmapText}>
                We couldn't find any content for this roadmap
              </Text>
              <TouchableOpacity
                style={styles.reloadButton}
                onPress={() => fetchRoadmapDetails(selectedRoadmap)}
              >
                <Text style={styles.reloadButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    )
  };

  // Loading animation component
  const LoadingOverlay = () => {
    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingDot}>•••</Text>
          <Text style={styles.loadingText}>Loading your roadmap...</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {loading && <LoadingOverlay />}
      {selectedRoadmap ? <RoadmapView /> : <RoadmapSelector />}
    </View>
  );
};

export default RoadmapApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // Selector Styles
  selectorContainer: {
    flex: 1,
  },
  selectorContent: {
    padding: 20,
    paddingBottom: 40,
  },
  selectorTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  selectorSubtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginBottom: 32,
  },
  roadmapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  roadmapCard: {
    width: "48%",
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  cardLeft: {
    marginRight: 4,
  },
  cardRight: {
    marginLeft: 4,
  },
  cardColorBlock: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  // Graphical header
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginRight: 16,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  roadmapHero: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  heroContent: {
    marginBottom: 20,
  },
  heroText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  // Roadmap content
  roadmapContent: {
    flex: 1,
  },
  roadmapContentContainer: {
    paddingVertical: 24,
  },
  graphicalRoadmap: {
    padding: 16,
  },
  // Progress bar
  progressContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: THEME.primary[0],
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "right",
  },
  roadmapSection: {
    marginBottom: 16,
    alignItems: "center",
  },
  connector: {
    alignItems: "center",
    height: 40,
  },
  gradientConnector: {
    width: 4,
    height: "100%",
    borderRadius: 2,
  },
  // Section nodes
  sectionNode: {
    width: width - 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  expandedSectionNode: {
    backgroundColor: "rgba(74, 0, 224, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(74, 0, 224, 0.2)",
  },
  nodeColorIndicator: {
    width: 12,
    height: 48,
    borderRadius: 6,
    marginRight: 16,
    overflow: "hidden",
  },
  colorIndicatorGradient: {
    flex: 1,
  },
  nodeContent: {
    flex: 1,
    marginRight: 8,
  },
  sectionNodeTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: THEME.textPrimary,
    marginBottom: 2,
  },
  sectionNodeDescription: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  expandCollapseIndicator: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  expandedContent: {
    marginTop: 12,
    width: width - 80,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary[0],
    paddingLeft: 16,
    paddingBottom: 8,
  },
  topicCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  topicColorIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textPrimary,
    flex: 1,
  },
  topicDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  finalMilestone: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  milestoneNode: {
    alignItems: "center",
  },
  milestoneNodeGradient: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  milestoneSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  emptyTopicsCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTopicsText: {
    color: THEME.textSecondary,
    textAlign: "center",
  },
  emptyRoadmap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyRoadmapTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRoadmapText: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  reloadButton: {
    backgroundColor: THEME.primary[0],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reloadButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    minWidth: width * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingDot: {
    fontSize: 24,
    color: THEME.primary[0],
    marginBottom: 16,
    letterSpacing: 4,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.textPrimary,
    fontWeight: "500",
  },
});