import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Theme Colors
const THEME = {
    primary: ['#00F5A0', '#00D9F5'],
    secondary: ['#7A88FF', '#FD71AF'],
    optional: ['#FF8F71', '#FF3D77'],
    background: '#0A1128',
    cardBg: '#1A2138',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B7C3',
};

const ROADMAPS = {
    frontend: {
        title: 'Frontend Development',
        icon: 'logo-react',
        nodes: [
            {
                id: 'd1',
                title: 'Operating Systems',
                type: 'required',
                children: [
                    { id: 'd1.1', title: 'Linux Basics', type: 'required' },
                    { id: 'd1.2', title: 'Process Management', type: 'required' },
                    { id: 'd1.3', title: 'System Performance', type: 'required' }
                ]
            },
            // Add more DevOps nodes
        ]
    },
    backend: {
        title: 'Backend Development',
        icon: 'server',
        nodes: [
            {
                id: 'b1',
                title: 'Internet & Networking',
                type: 'required',
                children: [
                    { id: 'b1.1', title: 'How does the internet work?', type: 'required' },
                    { id: 'b1.2', title: 'HTTP/HTTPS', type: 'required' },
                    { id: 'b1.3', title: 'APIs & REST', type: 'required' },
                    { id: 'b1.4', title: 'WebSockets', type: 'recommended' }
                ]
            },
            // Add more backend nodes
        ]
    },
    devops: {
        title: 'DevOps Engineering',
        icon: 'git-network',
        nodes: [
            {
                id: 'd1',
                title: 'Operating Systems',
                type: 'required',
                children: [
                    { id: 'd1.1', title: 'Linux Basics', type: 'required' },
                    { id: 'd1.2', title: 'Process Management', type: 'required' },
                    { id: 'd1.3', title: 'System Performance', type: 'required' }
                ]
            },
            // Add more DevOps nodes
        ]
    },
    mobile: {
        title: 'Mobile Development',
        icon: 'phone-portrait',
        nodes: [
            {
                id: 'm1',
                title: 'Mobile Fundamentals',
                type: 'required',
                children: [
                    { id: 'm1.1', title: 'UI Design Principles', type: 'required' },
                    { id: 'm1.2', title: 'Native APIs', type: 'required' },
                    { id: 'm1.3', title: 'Performance Optimization', type: 'required' }
                ]
            },
            // Add more mobile nodes
        ]
    }
};

const RoadmapApp = () => {
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState({});

    const RoadmapSelector = () => (
        <ScrollView style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Choose Your Path</Text>
            <View style={styles.roadmapGrid}>
                {Object.entries(ROADMAPS).map(([key, roadmap]) => (
                    <TouchableOpacity
                        key={key}
                        style={styles.roadmapCard}
                        onPress={() => setSelectedRoadmap(key)}
                    >
                        <LinearGradient
                            colors={THEME.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardIconContainer}
                        >
                            <Ionicons name={roadmap.icon} size={32} color={THEME.background} />
                        </LinearGradient>
                        <Text style={styles.cardTitle}>{roadmap.title}</Text>
                        <Text style={styles.cardSubtitle}>Tap to explore</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const RoadmapNode = ({ node, level = 0 }) => {
        const isExpanded = expandedNodes[node.id];
        const hasChildren = node.children && node.children.length > 0;

        return (
            <View style={styles.nodeContainer}>
                <TouchableOpacity
                    onPress={() => hasChildren &&
                        setExpandedNodes(prev => ({
                            ...prev,
                            [node.id]: !prev[node.id]
                        }))}
                    style={[styles.node, { marginLeft: level * 20 }]}
                >
                    <LinearGradient
                        colors={node.type === 'required' ? THEME.primary :
                            node.type === 'recommended' ? THEME.secondary : THEME.optional}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nodeGradient}
                    >
                        <View style={styles.nodeContent}>
                            <Text style={styles.nodeText}>{node.title}</Text>
                            {hasChildren && (
                                <Ionicons
                                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                                    size={24}
                                    color={THEME.textPrimary}
                                />
                            )}
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {hasChildren && isExpanded && (
                    <View style={styles.childrenContainer}>
                        {node.children.map((child) => (
                            <RoadmapNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const RoadmapView = () => (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedRoadmap(null)}
                >
                    <Ionicons name="arrow-back" size={24} color={THEME.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{ROADMAPS[selectedRoadmap].title}</Text>
            </View>
            <View style={styles.roadmapContainer}>
                {ROADMAPS[selectedRoadmap].nodes.map((node) => (
                    <RoadmapNode key={node.id} node={node} />
                ))}
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            {selectedRoadmap ? <RoadmapView /> : <RoadmapSelector />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.background,
    },
    selectorContainer: {
        flex: 1,
        padding: 20,
    },
    selectorTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: THEME.textPrimary,
        marginBottom: 24,
    },
    roadmapGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    roadmapCard: {
        width: '48%',
        backgroundColor: THEME.cardBg,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
    },
    cardIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: THEME.textSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: THEME.cardBg,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME.textPrimary,
    },
    roadmapContainer: {
        padding: 16,
    },
    nodeContainer: {
        marginVertical: 8,
    },
    node: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    nodeGradient: {
        padding: 16,
    },
    nodeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    nodeText: {
        color: THEME.textPrimary,
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    childrenContainer: {
        marginTop: 8,
    },
});

export default RoadmapApp;