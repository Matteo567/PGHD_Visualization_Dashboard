/**
 BodySvg.js - Human Body Anatomical Visualization Component
 
 This component provides an interactive human body diagram:
 - SVG-based anatomical body representation
 - Interactive body regions for pain location selection
 - Design that scales with container
 - Color-coded regions for different body parts
 - Integration with pain assessment functionality
 
 Essential for pain location mapping and anatomical reference in health assessments.
 */

import React, { useState, useRef, useEffect } from 'react';

const BodySvg = ({ painLocation, painColor, className, view = 'front' }) => {
  const defaultFill = '#F5F5F5';
  const strokeColor = '#CCCCCC';
  const strokeWidth = 1;

  // More detailed body part mapping
  const bodyPartFills = {
    // Head and neck
    head: defaultFill,
    neck: defaultFill,
    
    // Torso - front
    chest: defaultFill,
    stomach: defaultFill,
    leftShoulder: defaultFill,
    rightShoulder: defaultFill,
    
    // Torso - back
    upperBack: defaultFill,
    lowerBack: defaultFill,
    leftShoulderBlade: defaultFill,
    rightShoulderBlade: defaultFill,
    
    // Hips
    leftHip: defaultFill,
    rightHip: defaultFill,
    
    // Arms
    leftArm: defaultFill,
    rightArm: defaultFill,
    leftElbow: defaultFill,
    rightElbow: defaultFill,
    leftForearm: defaultFill,
    rightForearm: defaultFill,
    leftHand: defaultFill,
    rightHand: defaultFill,
    
    // Legs
    leftThigh: defaultFill,
    rightThigh: defaultFill,
    leftKnee: defaultFill,
    rightKnee: defaultFill,
    leftCalf: defaultFill,
    rightCalf: defaultFill,
    leftFoot: defaultFill,
    rightFoot: defaultFill,
  };

  // Enhanced location mapping
  const locationMapping = {
    // Head and neck (visible from both sides)
    head: 'head',
    neck: 'neck',
    
    // Torso - front view only
    chest: view === 'front' ? 'chest' : null,
    stomach: view === 'front' ? 'stomach' : null,
    abdomen: view === 'front' ? 'stomach' : null,
    belly: view === 'front' ? 'stomach' : null,
    leftShoulder: view === 'front' ? 'leftShoulder' : null,
    rightShoulder: view === 'front' ? 'rightShoulder' : null,
    shoulder: view === 'front' ? 'leftShoulder' : null,
    shoulders: view === 'front' ? 'leftShoulder' : null,
    
    // Torso - back view only
    back: view === 'back' ? 'upperBack' : null,
    upperBack: view === 'back' ? 'upperBack' : null,
    lowerBack: view === 'back' ? 'lowerBack' : null,
    spine: view === 'back' ? 'upperBack' : null,
    leftShoulderBlade: view === 'back' ? 'leftShoulderBlade' : null,
    rightShoulderBlade: view === 'back' ? 'rightShoulderBlade' : null,
    shoulderBlade: view === 'back' ? 'leftShoulderBlade' : null,
    shoulderBlades: view === 'back' ? 'leftShoulderBlade' : null,
    
    // Hips (visible from both sides)
    hip: 'leftHip',
    hips: 'leftHip',
    leftHip: 'leftHip',
    rightHip: 'rightHip',
    
    // Arms (visible from both sides)
    arm: 'leftArm',
    arms: 'leftArm',
    leftArm: 'leftArm',
    rightArm: 'rightArm',
    elbow: 'leftElbow',
    elbows: 'leftElbow',
    leftElbow: 'leftElbow',
    rightElbow: 'rightElbow',
    forearm: 'leftForearm',
    forearms: 'leftForearm',
    leftForearm: 'leftForearm',
    rightForearm: 'rightForearm',
    hand: 'leftHand',
    hands: 'leftHand',
    leftHand: 'leftHand',
    rightHand: 'rightHand',
    
    // Legs (visible from both sides)
    leg: 'leftThigh',
    legs: 'leftThigh',
    leftThigh: 'leftThigh',
    rightThigh: 'rightThigh',
    thigh: 'leftThigh',
    thighs: 'leftThigh',
    knee: 'leftKnee',
    knees: 'leftKnee',
    leftKnee: 'leftKnee',
    rightKnee: 'rightKnee',
    calf: 'leftCalf',
    calves: 'leftCalf',
    leftCalf: 'leftCalf',
    rightCalf: 'rightCalf',
    foot: 'leftFoot',
    feet: 'leftFoot',
    leftFoot: 'leftFoot',
    rightFoot: 'rightFoot',
    ankle: 'leftFoot',
    ankles: 'leftFoot',
  };

  const targetPart = locationMapping[painLocation];
  if (targetPart && targetPart !== null) {
    bodyPartFills[targetPart] = painColor;
    
    // Handle symmetrical body parts - shade both sides for general terms
    if (painLocation === 'elbow' || painLocation === 'elbows') {
      bodyPartFills.leftElbow = painColor;
      bodyPartFills.rightElbow = painColor;
    } else if (painLocation === 'shoulder' || painLocation === 'shoulders') {
      if (view === 'front') {
        bodyPartFills.leftShoulder = painColor;
        bodyPartFills.rightShoulder = painColor;
      } else {
        bodyPartFills.leftShoulderBlade = painColor;
        bodyPartFills.rightShoulderBlade = painColor;
      }
    } else if (painLocation === 'arm' || painLocation === 'arms') {
      bodyPartFills.leftArm = painColor;
      bodyPartFills.rightArm = painColor;
    } else if (painLocation === 'forearm' || painLocation === 'forearms') {
      bodyPartFills.leftForearm = painColor;
      bodyPartFills.rightForearm = painColor;
    } else if (painLocation === 'hand' || painLocation === 'hands') {
      bodyPartFills.leftHand = painColor;
      bodyPartFills.rightHand = painColor;
    } else if (painLocation === 'leg' || painLocation === 'legs') {
      bodyPartFills.leftThigh = painColor;
      bodyPartFills.rightThigh = painColor;
    } else if (painLocation === 'thigh' || painLocation === 'thighs') {
      bodyPartFills.leftThigh = painColor;
      bodyPartFills.rightThigh = painColor;
    } else if (painLocation === 'knee' || painLocation === 'knees') {
      bodyPartFills.leftKnee = painColor;
      bodyPartFills.rightKnee = painColor;
    } else if (painLocation === 'calf' || painLocation === 'calves') {
      bodyPartFills.leftCalf = painColor;
      bodyPartFills.rightCalf = painColor;
    } else if (painLocation === 'foot' || painLocation === 'feet') {
      bodyPartFills.leftFoot = painColor;
      bodyPartFills.rightFoot = painColor;
    } else if (painLocation === 'ankle' || painLocation === 'ankles') {
      bodyPartFills.leftFoot = painColor;
      bodyPartFills.rightFoot = painColor;
    } else if (painLocation === 'hip' || painLocation === 'hips') {
      bodyPartFills.leftHip = painColor;
      bodyPartFills.rightHip = painColor;
    }
  }

  const renderFrontView = () => (
    <g id="body-front">
      {/* Head */}
      <ellipse 
        cx="75" cy="15" rx="12" ry="15" 
        fill={bodyPartFills.head} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Neck */}
      <rect 
        x="68" y="30" width="14" height="8" 
        fill={bodyPartFills.neck} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Torso */}
      <path 
        d="M60,38 Q75,35 90,38 L85,85 Q75,90 65,85 Z" 
        fill={bodyPartFills.chest} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Stomach */}
      <path 
        d="M65,85 Q75,88 85,85 L80,110 Q75,115 70,110 Z" 
        fill={bodyPartFills.stomach} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Shoulder */}
      <ellipse 
        cx="55" cy="40" rx="8" ry="6" 
        fill={bodyPartFills.leftShoulder} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Shoulder */}
      <ellipse 
        cx="95" cy="40" rx="8" ry="6" 
        fill={bodyPartFills.rightShoulder} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Arm */}
      <path 
        d="M47,40 Q45,50 43,65 L50,67 Q52,52 55,42 Z" 
        fill={bodyPartFills.leftArm} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Arm */}
      <path 
        d="M103,40 Q105,50 107,65 L100,67 Q98,52 95,42 Z" 
        fill={bodyPartFills.rightArm} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Elbow */}
      <ellipse 
        cx="46" cy="70" rx="4" ry="6" 
        fill={bodyPartFills.leftElbow} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Elbow */}
      <ellipse 
        cx="104" cy="70" rx="4" ry="6" 
        fill={bodyPartFills.rightElbow} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Forearm */}
      <path 
        d="M42,70 Q44,80 46,90 L50,88 Q48,78 50,72 Z" 
        fill={bodyPartFills.leftForearm} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Forearm */}
      <path 
        d="M108,70 Q106,80 104,90 L100,88 Q102,78 100,72 Z" 
        fill={bodyPartFills.rightForearm} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Hand */}
      <ellipse 
        cx="48" cy="95" rx="5" ry="8" 
        fill={bodyPartFills.leftHand} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Hand */}
      <ellipse 
        cx="102" cy="95" rx="5" ry="8" 
        fill={bodyPartFills.rightHand} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Hip */}
      <ellipse 
        cx="65" cy="105" rx="8" ry="6" 
        fill={bodyPartFills.leftHip} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Hip */}
      <ellipse 
        cx="85" cy="105" rx="8" ry="6" 
        fill={bodyPartFills.rightHip} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Thigh */}
      <path 
        d="M65,110 Q70,115 75,120 L73,140 Q70,135 67,130 Z" 
        fill={bodyPartFills.leftThigh} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Thigh */}
      <path 
        d="M85,110 Q80,115 75,120 L77,140 Q80,135 83,130 Z" 
        fill={bodyPartFills.rightThigh} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Knee */}
      <ellipse 
        cx="70" cy="145" rx="6" ry="4" 
        fill={bodyPartFills.leftKnee} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Knee */}
      <ellipse 
        cx="80" cy="145" rx="6" ry="4" 
        fill={bodyPartFills.rightKnee} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Calf */}
      <path 
        d="M67,149 Q70,155 73,165 L70,167 Q67,161 70,155 Z" 
        fill={bodyPartFills.leftCalf} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Calf */}
      <path 
        d="M83,149 Q80,155 77,165 L80,167 Q83,161 80,155 Z" 
        fill={bodyPartFills.rightCalf} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Foot */}
      <ellipse 
        cx="70" cy="170" rx="8" ry="4" 
        fill={bodyPartFills.leftFoot} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Foot */}
      <ellipse 
        cx="80" cy="170" rx="8" ry="4" 
        fill={bodyPartFills.rightFoot} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
    </g>
  );

  const renderBackView = () => (
    <g id="body-back">
      {/* Head */}
      <ellipse 
        cx="75" cy="15" rx="12" ry="15" 
        fill={bodyPartFills.head} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Neck */}
      <rect 
        x="68" y="30" width="14" height="8" 
        fill={bodyPartFills.neck} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Upper Back */}
      <path 
        d="M60,38 Q75,35 90,38 L85,70 Q75,75 65,70 Z" 
        fill={bodyPartFills.upperBack} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Lower Back */}
      <path 
        d="M65,70 Q75,75 85,70 L80,110 Q75,115 70,110 Z" 
        fill={bodyPartFills.lowerBack} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Shoulder Blade */}
      <ellipse 
        cx="55" cy="45" rx="6" ry="8" 
        fill={bodyPartFills.leftShoulderBlade} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Shoulder Blade */}
      <ellipse 
        cx="95" cy="45" rx="6" ry="8" 
        fill={bodyPartFills.rightShoulderBlade} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Arm */}
      <path 
        d="M47,40 Q45,50 43,65 L50,67 Q52,52 55,42 Z" 
        fill={bodyPartFills.leftArm} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Arm */}
      <path 
        d="M103,40 Q105,50 107,65 L100,67 Q98,52 95,42 Z" 
        fill={bodyPartFills.rightArm} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Elbow */}
      <ellipse 
        cx="46" cy="70" rx="4" ry="6" 
        fill={bodyPartFills.leftElbow} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Elbow */}
      <ellipse 
        cx="104" cy="70" rx="4" ry="6" 
        fill={bodyPartFills.rightElbow} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Forearm */}
      <path 
        d="M42,70 Q44,80 46,90 L50,88 Q48,78 50,72 Z" 
        fill={bodyPartFills.leftForearm} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Forearm */}
      <path 
        d="M108,70 Q106,80 104,90 L100,88 Q102,78 100,72 Z" 
        fill={bodyPartFills.rightForearm} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Hand */}
      <ellipse 
        cx="48" cy="95" rx="5" ry="8" 
        fill={bodyPartFills.leftHand} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Hand */}
      <ellipse 
        cx="102" cy="95" rx="5" ry="8" 
        fill={bodyPartFills.rightHand} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Hip */}
      <ellipse 
        cx="65" cy="105" rx="8" ry="6" 
        fill={bodyPartFills.leftHip} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Hip */}
      <ellipse 
        cx="85" cy="105" rx="8" ry="6" 
        fill={bodyPartFills.rightHip} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Thigh */}
      <path 
        d="M65,110 Q70,115 75,120 L73,140 Q70,135 67,130 Z" 
        fill={bodyPartFills.leftThigh} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Thigh */}
      <path 
        d="M85,110 Q80,115 75,120 L77,140 Q80,135 83,130 Z" 
        fill={bodyPartFills.rightThigh} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Knee */}
      <ellipse 
        cx="70" cy="145" rx="6" ry="4" 
        fill={bodyPartFills.leftKnee} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Knee */}
      <ellipse 
        cx="80" cy="145" rx="6" ry="4" 
        fill={bodyPartFills.rightKnee} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Calf */}
      <path 
        d="M67,149 Q70,155 73,165 L70,167 Q67,161 70,155 Z" 
        fill={bodyPartFills.leftCalf} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Calf */}
      <path 
        d="M83,149 Q80,155 77,165 L80,167 Q83,161 80,155 Z" 
        fill={bodyPartFills.rightCalf} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Left Foot */}
      <ellipse 
        cx="70" cy="170" rx="8" ry="4" 
        fill={bodyPartFills.leftFoot} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Right Foot */}
      <ellipse 
        cx="80" cy="170" rx="8" ry="4" 
        fill={bodyPartFills.rightFoot} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
    </g>
  );

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 150 180" 
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))', // Add subtle shadow for better visual depth
        transition: 'all 0.2s ease' // Smooth transitions for scaling
      }}
    >
      {view === 'front' ? renderFrontView() : renderBackView()}
    </svg>
  );
};

export default BodySvg;
