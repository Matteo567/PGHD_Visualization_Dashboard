''' generate_synthetic_data.py - Synthetic Health Data Generator

This script generates comprehensive synthetic health tracking data for 100 patients covering the period July 2024 to July 2025. The generated data includes patient demographics with age, gender, and names. It includes medical conditions and diagnoses. It includes current medications with dosages and schedules. It includes blood glucose readings for pre and post meal. It includes blood pressure measurements for systolic and diastolic. It includes exercise activity tracking with type, duration, and frequency. It includes mood tracking with daily emotional states. It includes pain assessment with location, intensity, and frequency. It includes sleep tracking with duration and quality ratings. It includes meal contents and nutritional data. Data is saved as individual CSV files per patient and a combined master CSV. This synthetic dataset enables testing and demonstration of the health dashboard without requiring real patient data.'''

import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

'''Age and medication helper functions'''

def generate_patient_age():
    '''Generate patient age with mean 69, standard deviation 3.1, minimum 65'''
    return int(np.clip(np.random.normal(69, 3.1), 65, None))

def generate_patient_gender():
    '''Generate patient gender with slight female bias which is common in older populations'''
    return random.choice(["Male", "Female"])

def load_names_by_gender():
    '''Load names from male.txt and female.txt files'''
    male_names = []
    female_names = []
    
    try:
        with open('Data_details/male.txt', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    male_names.append(line)
    except FileNotFoundError:
        print("Warning: male.txt not found, using default names")
        male_names = ["John", "Michael", "David", "Robert", "William", "James", "Richard", "Thomas", "Charles", "Joseph"]
    
    try:
        with open('Data_details/female.txt', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    female_names.append(line)
    except FileNotFoundError:
        print("Warning: female.txt not found, using default names")
        female_names = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"]
    
    return male_names, female_names

def generate_patient_name(gender, male_names, female_names):
    '''Generate a random name based on gender'''
    if gender == "Male":
        return random.choice(male_names)
    else:
        return random.choice(female_names)

def parse_medications_with_dosages(filename):
    '''Parse medications from the Sample_medications.txt format'''
    all_medications = []
    
    current_medication = None
    current_type = None
    current_category = None
    current_dose = None
    
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if not line or line == "Medications":
            i += 1
            continue
        
        # Check if this is a section header (starts and ends with ===)
        if line.startswith("===") and line.endswith("==="):
            i += 1
            continue
        
        # Check if this is a medication name (no colon, not empty, not a section header)
        if (":" not in line and line and 
            not line.startswith("===") and 
            not line.endswith("===")):
            
            # Save previous medication if exists
            if current_medication and current_type and current_category and current_dose:
                med_tuple = (current_medication, current_type, current_category, current_dose)
                all_medications.append(med_tuple)
            
            # Start new medication
            current_medication = line
            current_type = None
            current_category = None
            current_dose = None
        
        # Check for medication type
        elif line.startswith("Type:"):
            current_type = line.split(":", 1)[1].strip()
        
        # Check for medication category
        elif line.startswith("Category:"):
            current_category = line.split(":", 1)[1].strip()
        
        # Check for dose
        elif line.startswith("Dose:"):
            current_dose = line.split(":", 1)[1].strip()
        
        i += 1
    
    # Don't forget the last medication
    if current_medication and current_type and current_category and current_dose:
        med_tuple = (current_medication, current_type, current_category, current_dose)
        all_medications.append(med_tuple)
    
    return all_medications

# Set random seed for reproducibility
random.seed(999)
np.random.seed(999)

# Universally collected data
MOOD_VALUES = ["happy", "sad", "angry", "contempt"]
# Add probability for empty mood which represents neutral
MOOD_PROBABILITIES = [0.25, 0.15, 0.10, 0.10, 0.40]  # happy, sad, angry, contempt, empty (neutral)
MOOD_VALUES_WITH_EMPTY = ["happy", "sad", "angry", "contempt", ""]

MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Late night snack"]
WEATHER_VALUES = ["Good", "Bad"]
SLEEP_QUALITIES = ["Very good", "Fairly good", "Fairly bad", "Very bad"]
SLEEP_QUALITY_MAP = {v: i for i, v in enumerate(SLEEP_QUALITIES)}

# Meal contents
MEAL_COMPONENTS = ["Protein", "Vegetables", "Fruit", "Alcohol", "Carbohydrates"]
ADDED_SUGAR_CATEGORIES = ["0-20g", "20-40g", "40-60g", "60g+"]

MEDICATION_SCHEDULE_TYPES = ["Scheduled", "As-needed"]
MEDICATION_CATEGORIES = [
    "Heart health and hypertension",
    "Diabetes (oral or injectable)",
    "Chronic pain and musculoskeletal",
    "Mental health (mood and anxiety)",
    "Vitamins and supplements",
    "Other"
]

# Helper for meal components that returns dict of binary meal components and added sugar category
# Each meal gets random binary assignment for each component and a random added sugar category

SUGAR_CATEGORIES = ["", "1-20g", "20-40g", "40-60g", "60g+"]
# Exponential decay where no sugar is most common and high sugar is least common
SUGAR_WEIGHTS = [0.516, 0.258, 0.129, 0.065, 0.032]

# Meal specific probabilities of having any food content
MEAL_FOOD_PROBABILITIES = {
    "Breakfast": 1.0,    # 100% chance
    "Lunch": 0.9,        # 90% chance
    "Dinner": 1.0,       # 100% chance
    "Late night snack": 0.1  # 10% chance
}

def generate_meal_contents(meal_type=None):
    # Check if this meal should have any food content at all based on meal type
    if meal_type and meal_type in MEAL_FOOD_PROBABILITIES:
        has_food_probability = MEAL_FOOD_PROBABILITIES[meal_type]
        if random.random() > has_food_probability:
            # No food content for this meal so return empty components
            components = {comp: 0 for comp in MEAL_COMPONENTS}
            added_sugar = ""
            return components, added_sugar
    
    # Generate food components using random binary assignment
    components = {comp: random.choice([1, 0]) for comp in MEAL_COMPONENTS}
    added_sugar = np.random.choice(SUGAR_CATEGORIES, p=SUGAR_WEIGHTS)
    return components, added_sugar

def generate_exercise_data():
    """Generate 1 to 5 exercise types per day with exponential decay probability. Total exercise time averages 17 minutes per day."""
    # Use exponential decay for number of exercises where 1 is most common and 5 is least common
    # Probabilities are 0.516, 0.258, 0.129, 0.065, 0.032 for 1 to 5 exercises
    exercise_probs = [0.516, 0.258, 0.129, 0.065, 0.032]
    num_exercises = np.random.choice([1, 2, 3, 4, 5], p=exercise_probs)
    
    # Generate total exercise time for the day using uniform distribution around 17 minutes average
    # Range is 5 to 29 minutes to achieve average of 17 minutes per day
    total_minutes = random.randint(5, 29)
    
    # Randomly select exercise types without replacement to avoid duplicates
    selected_exercises = random.sample(EXERCISE_TYPES, num_exercises)
    
    # Distribute total minutes across exercises using random proportions that sum to total_minutes
    if num_exercises == 1:
        exercise_minutes = [total_minutes]
    else:
        # Generate random splits that sum to total_minutes for proper distribution
        splits = sorted([random.randint(1, total_minutes-1) for _ in range(num_exercises-1)])
        splits = [0] + splits + [total_minutes]
        exercise_minutes = [splits[i+1] - splits[i] for i in range(num_exercises)]
    
    # Generate exercise data for up to 5 slots per day
    exercise_data = {
        "Exercise_Type_1": selected_exercises[0] if len(selected_exercises) > 0 else "",
        "Exercise_Minutes_1": exercise_minutes[0] if len(selected_exercises) > 0 else 0,
        "Exercise_Category_1": selected_exercises[0] if len(selected_exercises) > 0 else "",
        "Exercise_Type_2": selected_exercises[1] if len(selected_exercises) > 1 else "",
        "Exercise_Minutes_2": exercise_minutes[1] if len(selected_exercises) > 1 else 0,
        "Exercise_Category_2": selected_exercises[1] if len(selected_exercises) > 1 else "",
        "Exercise_Type_3": selected_exercises[2] if len(selected_exercises) > 2 else "",
        "Exercise_Minutes_3": exercise_minutes[2] if len(selected_exercises) > 2 else 0,
        "Exercise_Category_3": selected_exercises[2] if len(selected_exercises) > 2 else "",
        "Exercise_Type_4": selected_exercises[3] if len(selected_exercises) > 3 else "",
        "Exercise_Minutes_4": exercise_minutes[3] if len(selected_exercises) > 3 else 0,
        "Exercise_Category_4": selected_exercises[3] if len(selected_exercises) > 3 else "",
        "Exercise_Type_5": selected_exercises[4] if len(selected_exercises) > 4 else "",
        "Exercise_Minutes_5": exercise_minutes[4] if len(selected_exercises) > 4 else 0,
        "Exercise_Category_5": selected_exercises[4] if len(selected_exercises) > 4 else "",
    }
    
    return exercise_data

# Meal time ranges in 24 hour format
BREAKFAST_TIME_RANGE = (6, 11)  # 6:00 AM to 11:00 AM
LUNCH_TIME_RANGE = (11, 15)     # 11:00 AM to 3:00 PM
DINNER_TIME_RANGE = (16, 22)    # 4:00 PM to 10:00 PM
LATE_NIGHT_SNACK_TIME_RANGE = (22, 24)  # 10:00 PM to 11:59 PM

# Exercise related data
EXERCISE_TYPES = ["walking", "swimming", "running", "biking", "muscle-strengthening", "balance", "other"]

# Pain related data
PAIN_LOCATIONS = ["head", "neck", "shoulders", "back", "chest", "stomach", "hips", "arms", "elbows", "hands", "legs", "knees", "feet"]

# Binary variables
BINARY_VALUES = ["Yes", "No"]

# Date range for July 2024 to July 2025
start_date = datetime(2024, 7, 1)
end_date = datetime(2025, 7, 31)
date_range = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range((end_date - start_date).days + 1)]

# Helper functions
def assign_conditions():
    """Randomly assign chronic conditions based on Canadian Community Health Survey prevalence rates. Key findings from 2017 to 2018 CCHS include conditions with relevant data mappings. Hypertension at 65.7 percent maps to BP readings and medications. Periodontal disease at 52.0 percent has no direct data mapping. Osteoarthritis at 38.0 percent maps to pain location and level and exercise type. Ischemic heart disease at 27.0 percent maps to BP readings and exercise data. Diabetes at 26.8 percent maps to glucose levels, medications, and meal contents. Osteoporosis at 25.1 percent maps to pain location and level and exercise type. Cancer at 21.5 percent has no direct data mapping but is included for realism. COPD at 20.2 percent has no direct data mapping but is included for realism. Asthma at 10.7 percent has no direct data mapping but is included for realism. Mood and or anxiety disorder at 10.5 percent maps to mood tracking, medications, and sleep quality."""
    conditions = []
    
    # Assign conditions based on individual prevalence rates from CCHS data
    if random.random() < 0.657:  # 65.7% prevalence
        conditions.append("Hypertension")
    if random.random() < 0.52:   # 52.0% prevalence
        conditions.append("Periodontal disease")
    if random.random() < 0.38:   # 38.0% prevalence
        conditions.append("Osteoarthritis")
    if random.random() < 0.27:  # 27.0% prevalence
        conditions.append("Ischemic heart disease")
    if random.random() < 0.268: # 26.8% prevalence
        conditions.append("Diabetes")
    if random.random() < 0.251: # 25.1% prevalence
        conditions.append("Osteoporosis")
    if random.random() < 0.215: # 21.5% prevalence
        conditions.append("Cancer")
    if random.random() < 0.202:  # 20.2% prevalence
        conditions.append("COPD")
    if random.random() < 0.107: # 10.7% prevalence
        conditions.append("Asthma")
    if random.random() < 0.105: # 10.5% prevalence
        conditions.append("Mood and/or anxiety disorder")
    
    # All patients have at least two chronic conditions to reflect that many seniors have multiple conditions and to provide meaningful dashboard data
    
    # If no conditions were assigned, assign two common ones from the list
    if len(conditions) == 0:
        conditions.extend(random.sample(["Hypertension", "Osteoarthritis", "Diabetes", "Osteoporosis"], 2))
    
    # If only one condition was assigned, add a second one from available conditions
    elif len(conditions) == 1:
        additional_conditions = ["Hypertension", "Diabetes", "Osteoarthritis", "Osteoporosis", "Mood and/or anxiety disorder", "Ischemic heart disease"]
        # Remove conditions already assigned to avoid duplicates
        available_conditions = [c for c in additional_conditions if c not in conditions]
        if available_conditions:
            conditions.append(random.choice(available_conditions))
    
    # If we still do not have at least 2 conditions, force add common ones
    if len(conditions) < 2:
        common_conditions = ["Hypertension", "Osteoarthritis", "Diabetes"]
        for condition in common_conditions:
            if condition not in conditions:
                conditions.append(condition)
                if len(conditions) >= 2:
                    break
    
    return conditions

def assign_medications_by_conditions(conditions, all_medications):
    """Assign medications based on patient conditions."""
    assigned_meds = []
    category_counts = {}
    cond_set = set(conditions)

    # Check which conditions the patient has for use later in default medication assignment if needed
    has_hypertension = "Hypertension" in cond_set or "Ischemic heart disease" in cond_set
    has_diabetes = "Diabetes" in cond_set
    has_pain = "Osteoarthritis" in cond_set or "Osteoporosis" in cond_set
    has_mood_disorder = "Mood and/or anxiety disorder" in cond_set
    has_respiratory = "COPD" in cond_set or "Asthma" in cond_set
    has_cancer = "Cancer" in cond_set

    # Shuffle medications to randomize selection order
    random.shuffle(all_medications)

    # Assign medications based on conditions
    for med, med_type, category, dosage in all_medications:
        # Only allow up to 2 medications per category to limit medication count
        if category_counts.get(category, 0) >= 2:
            continue

        should_assign = False
        
        # Match medication categories to conditions
        if "Heart health and hypertension" in category and has_hypertension:
            should_assign = True
        elif "Diabetes" in category and has_diabetes:
            should_assign = True
        elif "Chronic pain and musculoskeletal" in category and has_pain:
            should_assign = True
        elif "Mental health" in category and has_mood_disorder:
            should_assign = True
        elif has_respiratory and "Other" in category:
            should_assign = random.random() < 0.6
        elif has_cancer and ("Other" in category or "Vitamins and supplements" in category):
            should_assign = random.random() < 0.7
        elif "Vitamins and supplements" in category:
            should_assign = random.random() < 0.7

        # Add medication if it should be assigned with 90 percent probability
        if should_assign and random.random() < 0.9:
            assigned_meds.append((med, med_type, category, dosage))
            category_counts[category] = category_counts.get(category, 0) + 1

    # If no medications were assigned, add at least one default medication based on conditions
    if not assigned_meds:
        if has_hypertension:
            assigned_meds.append(("Lisinopril", "Prescribed", "Heart health and hypertension", "10 mg once daily"))
        elif has_diabetes:
            assigned_meds.append(("Metformin", "Prescribed", "Diabetes (oral or injectable)", "500 mg twice daily"))
        elif has_pain:
            assigned_meds.append(("Ibuprofen", "Prescribed", "Chronic pain and musculoskeletal", "400 mg as needed"))
        elif has_mood_disorder:
            assigned_meds.append(("Sertraline", "Prescribed", "Mental health (mood and anxiety)", "50 mg once daily"))
        else:
            assigned_meds.append(("Vitamin D", "Supplement", "Vitamins and supplements", "1000 IU once daily"))

    return assigned_meds

def get_bp_type(systolic, diastolic):
    # Blood pressure risk categories based on Blood_pressure_range_description.txt file
    if systolic < 90:
        systolic_type = "Low blood pressure"
    elif 90 <= systolic <= 120:
        systolic_type = "Ideal"
    elif 120 < systolic <= 140:
        systolic_type = "Pre-high blood pressure"
    else:
        systolic_type = "High blood pressure"
    
    if diastolic < 60:
        diastolic_type = "Low blood pressure"
    elif 60 <= diastolic <= 80:
        diastolic_type = "Ideal"
    elif 80 < diastolic <= 90:
        diastolic_type = "Pre-high blood pressure"
    else:
        diastolic_type = "High blood pressure"
    
    return systolic_type, diastolic_type

def generate_measurement_timestamps_with_spacing(num_readings, min_hours_between=1):
    """Generate random timestamps for health measurements with minimum spacing between readings to avoid overlapping times."""
    if num_readings == 0:
        return ["", "", "", ""]
    
    timestamps = []
    used_times = []  # Track used times to ensure proper spacing between readings
    
    for i in range(num_readings):
        max_attempts = 50  # Prevent infinite loops when finding valid timestamps
        attempts = 0
        
        while attempts < max_attempts:
            # Generate completely random time from 0 to 23 hours
            hour = random.randint(0, 23)
            minute = random.randint(0, 59)
            
            # Convert to minutes since midnight for easier comparison of time differences
            time_in_minutes = hour * 60 + minute
            
            # Check if this time is at least min_hours_between away from all used times to ensure spacing
            valid_time = True
            for used_time in used_times:
                time_diff = abs(time_in_minutes - used_time)
                # Handle day wraparound for example 23:00 to 01:00 across midnight
                if time_diff > 12 * 60:  # More than 12 hours apart
                    time_diff = 24 * 60 - time_diff
                if time_diff < min_hours_between * 60:
                    valid_time = False
                    break
            
            if valid_time:
                used_times.append(time_in_minutes)
                # Format as HH:MM
                timestamp = f"{hour:02d}:{minute:02d}"
                timestamps.append(timestamp)
                break
            
            attempts += 1
        
        # If we could not find a valid time after max attempts, just use the last generated time
        if attempts >= max_attempts:
            timestamp = f"{hour:02d}:{minute:02d}"
            timestamps.append(timestamp)
    
    # Pad with empty strings for unused slots to maintain consistent array length
    while len(timestamps) < 4:
        timestamps.append("")
    
    return timestamps

def get_glucose_range(glucose, measurement_type):
    # Glucose ranges from supporting file with different thresholds for pre and post meal
    if measurement_type == "Pre meal":
        if glucose < 4.0:
            return "below range"
        elif 4.0 <= glucose <= 7.0:
            return "in range"
        else:
            return "above range"
    else:  # 2 hour post meal reading
        if glucose < 5.0:
            return "below range"
        elif 5.0 <= glucose <= 10.0:
            return "in range"
        else:
            return "above range"

def generate_blood_pressure_readings(has_condition):
    """Generate 1 to 4 blood pressure readings per day for patients with hypertension or heart disease"""
    if not has_condition:
        return [0, 0, 0, 0], [0, 0, 0, 0], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]
    
    # Determine number of readings from 1 to 4 with exponential decay probability
    num_readings = np.random.choice([1, 2, 3, 4], p=[0.516, 0.258, 0.129, 0.097])
    
    # Generate timestamps for the readings with minimum 1-hour spacing
    timestamps = generate_measurement_timestamps_with_spacing(num_readings, min_hours_between=1)
    
    systolic_readings = []
    diastolic_readings = []
    systolic_types = []
    diastolic_types = []
    
    for i in range(4):
        if i < num_readings:
            # Generate blood pressure using normal distribution
            # Systolic must always be higher than diastolic which is medically required
            systolic = int(random.normalvariate(130, 15))
            
            # Generate diastolic ensuring it is at least 10 mmHg below systolic
            max_diastolic = systolic - 10
            diastolic = int(random.normalvariate(85, 10))
            diastolic = min(diastolic, max_diastolic)
            
            # Final validation to ensure systolic is greater than diastolic as safety check
            if diastolic >= systolic:
                diastolic = max(40, systolic - 10)
            
            systolic_type, diastolic_type = get_bp_type(systolic, diastolic)
        else:
            systolic = 0
            diastolic = 0
            systolic_type = ""
            diastolic_type = ""
        
        systolic_readings.append(systolic)
        diastolic_readings.append(diastolic)
        systolic_types.append(systolic_type)
        diastolic_types.append(diastolic_type)
    
    return systolic_readings, diastolic_readings, systolic_types, diastolic_types, timestamps

def generate_glucose_readings(has_diabetes):
    """Generate 1 to 4 glucose readings per day for diabetic patients"""
    if not has_diabetes:
        return [0, 0, 0, 0], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]
    
    # Determine number of readings from 1 to 4 with exponential decay probability
    num_readings = np.random.choice([1, 2, 3, 4], p=[0.516, 0.258, 0.129, 0.097])
    
    # Generate timestamps for the readings with minimum 1-hour spacing
    timestamps = generate_measurement_timestamps_with_spacing(num_readings, min_hours_between=1)
    
    glucose_readings = []
    measurement_types = []
    glucose_ranges = []
    
    for i in range(4):
        if i < num_readings:
            measurement_type = random.choice(["Pre meal", "2-hour post meal"])
            if measurement_type == "Pre meal":
                # Normal distribution with mean 6.0, standard deviation 1.5, clipped to 3.0 to 9.0
                glucose = np.random.normal(6.0, 1.5)
                glucose = round(np.clip(glucose, 3.0, 9.0), 1)
            else:
                # Normal distribution with mean 7.5, standard deviation 2.0, clipped to 4.0 to 12.0
                glucose = np.random.normal(7.5, 2.0)
                glucose = round(np.clip(glucose, 4.0, 12.0), 1)
            glucose_range = get_glucose_range(glucose, measurement_type)
        else:
            glucose = 0
            measurement_type = ""
            glucose_range = ""
        
        glucose_readings.append(glucose)
        measurement_types.append(measurement_type)
        glucose_ranges.append(glucose_range)
    
    return glucose_readings, measurement_types, glucose_ranges, timestamps

def generate_patient_data(patient_id, conditions, age, gender, patient_name, patient_pain_location, assigned_medications):
    """Generate daily health data for a single patient based on their conditions.
    
    Conditions are mapped to relevant data as specified in Conditions.txt. Hypertension maps to BP readings and medications. Periodontal disease has no direct data mapping. Osteoarthritis maps to pain location and level and exercise type. Ischemic heart disease maps to BP readings and exercise data. Diabetes maps to glucose levels, medications, and meal contents. Osteoporosis maps to pain location and level and exercise type. Cancer has general health monitoring with no specific data mappings. COPD has general health monitoring with no specific data mappings. Asthma has general health monitoring with no specific data mappings. Mood and or anxiety disorder maps to mood tracking, medications, and sleep quality.
    """
    data = []
    cond_set = set(conditions)
    has_hypertension = "Hypertension" in cond_set
    has_diabetes = "Diabetes" in cond_set
    has_heart_disease = "Ischemic heart disease" in cond_set
    has_osteoarthritis = "Osteoarthritis" in cond_set
    has_osteoporosis = "Osteoporosis" in cond_set
    has_mood_disorder = "Mood and/or anxiety disorder" in cond_set
    
    for date in date_range:
        # Basic daily data including mood, weather, and sleep
        mood = np.random.choice(MOOD_VALUES_WITH_EMPTY, p=MOOD_PROBABILITIES)
        weather = random.choice(WEATHER_VALUES)
        sleep_quality_code = random.choice([0, 1, 2, 3])
        sleep_quality = SLEEP_QUALITIES[sleep_quality_code]
        sleep_hours = round(random.uniform(1.0, 10.0), 1)
        
        # Meal times and contents for all meal types
        breakfast_hour = random.randint(*BREAKFAST_TIME_RANGE)
        breakfast_minute = random.randint(0, 59)
        breakfast_time = f"{breakfast_hour:02d}:{breakfast_minute:02d}"
        breakfast_components, breakfast_added_sugar = generate_meal_contents("Breakfast")
        
        lunch_hour = random.randint(*LUNCH_TIME_RANGE)
        lunch_minute = random.randint(0, 59)
        lunch_time = f"{lunch_hour:02d}:{lunch_minute:02d}"
        lunch_components, lunch_added_sugar = generate_meal_contents("Lunch")
        
        dinner_hour = random.randint(*DINNER_TIME_RANGE)
        dinner_minute = random.randint(0, 59)
        dinner_time = f"{dinner_hour:02d}:{dinner_minute:02d}"
        dinner_components, dinner_added_sugar = generate_meal_contents("Dinner")
        
        # Late night snack from 10 PM to 11:59 PM
        late_snack_hour = random.randint(*LATE_NIGHT_SNACK_TIME_RANGE)
        late_snack_minute = random.randint(0, 59)
        late_snack_time = f"{late_snack_hour:02d}:{late_snack_minute:02d}"
        late_snack_components, late_snack_added_sugar = generate_meal_contents("Late night snack")
        
        # Exercise data with 1 to 3 types per day
        exercise_data = generate_exercise_data()
        
        # Pain data including location and intensity level
        pain_location = patient_pain_location
        pain_level = random.randint(0, 10)
        
        # Continence and goal tracking data
        urinary_continence = random.choice(BINARY_VALUES)
        fecal_continence = random.choice(BINARY_VALUES)
        health_goal_met = random.choice(BINARY_VALUES)
        
        # Blood pressure readings from 1 to 4 per day for hypertension and heart disease patients
        systolic_readings, diastolic_readings, systolic_types, diastolic_types, bp_timestamps = generate_blood_pressure_readings(has_hypertension or has_heart_disease)
        
        # Glucose readings from 1 to 4 per day for diabetic patients
        glucose_readings, measurement_types, glucose_ranges, glucose_timestamps = generate_glucose_readings(has_diabetes)
        
        # Compile all data for the day into a single dictionary
        day_data = {
            "Date": date,
            "Mood": mood,
            "Weather": weather,
            "Sleep_Quality": sleep_quality,
            "Sleep_Quality_Code": sleep_quality_code,
            "Sleep_Hours": sleep_hours,
            "Exercise_Type_1": exercise_data["Exercise_Type_1"],
            "Exercise_Minutes_1": exercise_data["Exercise_Minutes_1"],
            "Exercise_Category_1": exercise_data["Exercise_Category_1"],
            "Exercise_Type_2": exercise_data["Exercise_Type_2"],
            "Exercise_Minutes_2": exercise_data["Exercise_Minutes_2"],
            "Exercise_Category_2": exercise_data["Exercise_Category_2"],
            "Exercise_Type_3": exercise_data["Exercise_Type_3"],
            "Exercise_Minutes_3": exercise_data["Exercise_Minutes_3"],
            "Exercise_Category_3": exercise_data["Exercise_Category_3"],
            "Exercise_Type_4": exercise_data["Exercise_Type_4"],
            "Exercise_Minutes_4": exercise_data["Exercise_Minutes_4"],
            "Exercise_Category_4": exercise_data["Exercise_Category_4"],
            "Exercise_Type_5": exercise_data["Exercise_Type_5"],
            "Exercise_Minutes_5": exercise_data["Exercise_Minutes_5"],
            "Exercise_Category_5": exercise_data["Exercise_Category_5"],
            "Pain_Location": pain_location,
            "Pain_Level": pain_level,
            "Breakfast_Time": breakfast_time,
            "Lunch_Time": lunch_time,
            "Dinner_Time": dinner_time,
            "Late_Night_Snack_Time": late_snack_time,
            # Meal components (binary)
            "Breakfast_Protein": breakfast_components["Protein"],
            "Breakfast_Vegetables": breakfast_components["Vegetables"],
            "Breakfast_Fruit": breakfast_components["Fruit"],
            "Breakfast_Alcohol": breakfast_components["Alcohol"],
            "Breakfast_Carbohydrates": breakfast_components["Carbohydrates"],
            "Breakfast_Added_Sugar": breakfast_added_sugar,
            "Lunch_Protein": lunch_components["Protein"],
            "Lunch_Vegetables": lunch_components["Vegetables"],
            "Lunch_Fruit": lunch_components["Fruit"],
            "Lunch_Alcohol": lunch_components["Alcohol"],
            "Lunch_Carbohydrates": lunch_components["Carbohydrates"],
            "Lunch_Added_Sugar": lunch_added_sugar,
            "Dinner_Protein": dinner_components["Protein"],
            "Dinner_Vegetables": dinner_components["Vegetables"],
            "Dinner_Fruit": dinner_components["Fruit"],
            "Dinner_Alcohol": dinner_components["Alcohol"],
            "Dinner_Carbohydrates": dinner_components["Carbohydrates"],
            "Dinner_Added_Sugar": dinner_added_sugar,
            "Late_Night_Snack_Protein": late_snack_components["Protein"],
            "Late_Night_Snack_Vegetables": late_snack_components["Vegetables"],
            "Late_Night_Snack_Fruit": late_snack_components["Fruit"],
            "Late_Night_Snack_Alcohol": late_snack_components["Alcohol"],
            "Late_Night_Snack_Carbohydrates": late_snack_components["Carbohydrates"],
            "Late_Night_Snack_Added_Sugar": late_snack_added_sugar,
            "Urinary_Continence": urinary_continence,
            "Fecal_Continence": fecal_continence,
            "Health_Goal_Met": health_goal_met,
            # Multiple blood pressure readings with timestamps
            "Systolic_1": systolic_readings[0],
            "Diastolic_1": diastolic_readings[0],
            "Systolic_Type_1": systolic_types[0],
            "Diastolic_Type_1": diastolic_types[0],
            "BP_Time_1": bp_timestamps[0],
            "Systolic_2": systolic_readings[1],
            "Diastolic_2": diastolic_readings[1],
            "Systolic_Type_2": systolic_types[1],
            "Diastolic_Type_2": diastolic_types[1],
            "BP_Time_2": bp_timestamps[1],
            "Systolic_3": systolic_readings[2],
            "Diastolic_3": diastolic_readings[2],
            "Systolic_Type_3": systolic_types[2],
            "Diastolic_Type_3": diastolic_types[2],
            "BP_Time_3": bp_timestamps[2],
            "Systolic_4": systolic_readings[3],
            "Diastolic_4": diastolic_readings[3],
            "Systolic_Type_4": systolic_types[3],
            "Diastolic_Type_4": diastolic_types[3],
            "BP_Time_4": bp_timestamps[3],
            # Multiple glucose readings with timestamps
            "Glucose_1": glucose_readings[0],
            "Glucose_Measurement_Type_1": measurement_types[0],
            "Glucose_Range_1": glucose_ranges[0],
            "Glucose_Time_1": glucose_timestamps[0],
            "Glucose_2": glucose_readings[1],
            "Glucose_Measurement_Type_2": measurement_types[1],
            "Glucose_Range_2": glucose_ranges[1],
            "Glucose_Time_2": glucose_timestamps[1],
            "Glucose_3": glucose_readings[2],
            "Glucose_Measurement_Type_3": measurement_types[2],
            "Glucose_Range_3": glucose_ranges[2],
            "Glucose_Time_3": glucose_timestamps[2],
            "Glucose_4": glucose_readings[3],
            "Glucose_Measurement_Type_4": measurement_types[3],
            "Glucose_Range_4": glucose_ranges[3],
            "Glucose_Time_4": glucose_timestamps[3],
                         # Individual medication columns for clean dashboard display
             "Medication_Names": "; ".join([med[0] for med in assigned_medications]),
             "Medication_Types": "; ".join([med[1] for med in assigned_medications]),
             "Medication_Categories": "; ".join([med[2] for med in assigned_medications]),
             "Medication_Dosages": "; ".join([med[3] for med in assigned_medications]),
             "Medication_Count": len(assigned_medications)
        }
        data.append(day_data)
    return pd.DataFrame(data)

# Main script to generate data for all patients
# Create the public directory for the application if it does not exist
if not os.path.exists("public/synthetic_patients"):
    os.makedirs("public/synthetic_patients")
print("Generating synthetic health data for 100 patients...")

# Load names for patient generation
MALE_NAMES, FEMALE_NAMES = load_names_by_gender()

# Parse medications with dosages
ALL_MEDS_WITH_DOSAGES = parse_medications_with_dosages('Data_details/Sample_medications.txt')

for i in range(1, 101):
    patient_id = f"{i:03d}"
    print(f"Processing Patient_{patient_id}...")
    
    patient_conditions = assign_conditions()
    patient_age = generate_patient_age()
    patient_gender = generate_patient_gender()
    patient_name = generate_patient_name(patient_gender, MALE_NAMES, FEMALE_NAMES)
    patient_pain_location = random.choice(PAIN_LOCATIONS)
    
    # Assign medications based on conditions
    assigned_medications = assign_medications_by_conditions(
        patient_conditions, 
        ALL_MEDS_WITH_DOSAGES
    )
    
    df = generate_patient_data(
        patient_id, 
        patient_conditions, 
        patient_age, 
        patient_gender, 
        patient_name,
        patient_pain_location, 
        assigned_medications
    )
    
    # Add patient level columns to every row in the dataframe
    df['Age'] = patient_age
    df['Gender'] = patient_gender
    df['Name'] = patient_name
    df['Chronic_Conditions'] = "; ".join(patient_conditions)
    df['Pain_Location'] = patient_pain_location
    
    # Save to public directory
    filename_public = f"public/synthetic_patients/Patient_{patient_id}.csv"
    
    df.to_csv(filename_public, index=False)
    
    if i == 1:
        all_patients_df = df.copy()
        all_patients_df.insert(0, 'Patient_ID', patient_id)
    else:
        df.insert(0, 'Patient_ID', patient_id)
        all_patients_df = pd.concat([all_patients_df, df], ignore_index=True)

# Save all data to a single CSV with error handling and retry logic
def save_csv_with_retry(df, filepath, max_retries=3):
    """Save CSV file with retry logic for permission errors that may occur when file is open"""
    for attempt in range(max_retries):
        try:
            df.to_csv(filepath, index=False)
            print(f"Successfully saved {filepath}")
            return True
        except PermissionError as e:
            if attempt < max_retries - 1:
                print(f"Permission error saving {filepath} on attempt {attempt + 1} of {max_retries}. Please close any applications that might have the file open.")
                import time
                time.sleep(2)  # Wait 2 seconds before retrying
            else:
                print(f"Failed to save {filepath} after {max_retries} attempts. Error: {e}")
                return False
        except Exception as e:
            print(f"Unexpected error saving {filepath}: {e}")
            return False

# Save the combined file to public directory with error handling
print("Saving combined patient data...")
success_public = save_csv_with_retry(all_patients_df, "public/synthetic_patients_all.csv")

if success_public:
    print("Data generation complete! CSV files saved in public/synthetic_patients/ directory.")
    print("Combined file saved as synthetic_patients_all.csv in public/ directory.")
else:
    print("Data generation completed for individual patient files, but failed to save combined file.")
    print("Individual patient files are available in public/synthetic_patients/ directory.") 