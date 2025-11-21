"""
Calorie Calculator Service
Calculates TDEE, BMR, and adjusted calorie goals based on user data and weight goals.
"""


class CalorieCalculator:
    """
    Handles all calorie-related calculations using the Mifflin-St Jeor equation
    and activity multipliers.
    """
    
    # Activity level multipliers for TDEE calculation
    ACTIVITY_MULTIPLIERS = {
        'sedentary': 1.2,           # Little or no exercise
        'lightly_active': 1.375,    # Light exercise 1-3 days/week
        'moderately_active': 1.55,  # Moderate exercise 3-5 days/week
        'very_active': 1.725,       # Hard exercise 6-7 days/week
        'extra_active': 1.9         # Very hard exercise + physical job
    }
    
    # Calories per pound of body weight
    CALORIES_PER_POUND = 3500
    
    @staticmethod
    def calculate_bmr(weight_lbs, height_feet, height_inches, age, gender):
        """
        Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation.
        
        Args:
            weight_lbs: Weight in pounds
            height_feet: Height feet component
            height_inches: Height inches component
            age: Age in years
            gender: 'male' or 'female'
        
        Returns:
            BMR in calories per day, or None if data is insufficient
        """
        if not all([weight_lbs, height_feet is not None, height_inches is not None, age, gender]):
            return None
        
        # Convert to metric
        weight_kg = weight_lbs * 0.453592
        total_height_inches = (height_feet * 12) + height_inches
        height_cm = total_height_inches * 2.54
        
        # Mifflin-St Jeor Equation
        if gender.lower() == 'male':
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
        elif gender.lower() == 'female':
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
        else:
            # Default to average if gender not specified
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 78
        
        return round(bmr)
    
    @staticmethod
    def calculate_tdee(bmr, activity_level):
        """
        Calculate Total Daily Energy Expenditure.
        
        Args:
            bmr: Basal Metabolic Rate
            activity_level: Activity level string
        
        Returns:
            TDEE in calories per day
        """
        if not bmr or not activity_level:
            return None
        
        multiplier = CalorieCalculator.ACTIVITY_MULTIPLIERS.get(activity_level, 1.2)
        tdee = bmr * multiplier
        return round(tdee)
    
    @staticmethod
    def calculate_target_calories(tdee, weight_goal_rate):
        """
        Calculate target daily calories based on weight goal.
        
        Args:
            tdee: Total Daily Energy Expenditure
            weight_goal_rate: Desired lbs per week (negative for loss, positive for gain)
        
        Returns:
            Target daily calorie intake
        """
        if not tdee or weight_goal_rate is None:
            return tdee
        
        # Calculate daily calorie adjustment
        # 1 lb = 3500 calories, spread over 7 days = 500 cal/day per lb/week
        daily_adjustment = weight_goal_rate * (CalorieCalculator.CALORIES_PER_POUND / 7)
        
        target_calories = tdee + daily_adjustment
        
        # Safety limits: don't go below 1200 (female) or 1500 (male) minimum
        # For simplicity, use 1200 as absolute minimum
        if target_calories < 1200:
            target_calories = 1200
        
        return round(target_calories)
    
    @staticmethod
    def calculate_full_profile(user):
        """
        Calculate complete calorie profile for a user.
        
        Args:
            user: User model instance
        
        Returns:
            Dictionary with BMR, TDEE, target_calories, and explanation
        """
        result = {
            'bmr': None,
            'tdee': None,
            'target_calories': None,
            'daily_deficit_surplus': 0,
            'weekly_goal': None,
            'explanation': {
                'bmr_description': 'Basal Metabolic Rate - calories burned at rest',
                'tdee_description': 'Total Daily Energy Expenditure - calories burned with activity',
                'target_description': None,
                'calculation_details': []
            }
        }
        
        # Calculate BMR
        bmr = CalorieCalculator.calculate_bmr(
            user.weight_lbs,
            user.height_feet,
            user.height_inches,
            user.age,
            user.gender
        )
        
        if not bmr:
            result['explanation']['calculation_details'].append(
                'Complete your profile (weight, height, age, gender) to see calorie calculations'
            )
            return result
        
        result['bmr'] = bmr
        result['explanation']['calculation_details'].append(
            f'Your BMR is {bmr} calories per day based on your age, gender, height, and weight'
        )
        
        # Calculate TDEE
        tdee = CalorieCalculator.calculate_tdee(bmr, user.activity_level)
        
        if not tdee:
            result['explanation']['calculation_details'].append(
                'Set your activity level to calculate Total Daily Energy Expenditure'
            )
            return result
        
        result['tdee'] = tdee
        
        activity_descriptions = {
            'sedentary': 'little or no exercise',
            'lightly_active': 'light exercise 1-3 days/week',
            'moderately_active': 'moderate exercise 3-5 days/week',
            'very_active': 'hard exercise 6-7 days/week',
            'extra_active': 'very hard exercise + physical job'
        }
        
        activity_desc = activity_descriptions.get(user.activity_level, 'your activity level')
        result['explanation']['calculation_details'].append(
            f'With {activity_desc}, your TDEE is {tdee} calories per day'
        )
        
        # Calculate target calories based on weight goal
        if user.weight_goal_rate is not None and user.weight_goal_rate != 0:
            target_calories = CalorieCalculator.calculate_target_calories(tdee, user.weight_goal_rate)
            result['target_calories'] = target_calories
            result['daily_deficit_surplus'] = target_calories - tdee
            result['weekly_goal'] = user.weight_goal_rate
            
            if user.weight_goal_rate < 0:
                # Weight loss
                abs_rate = abs(user.weight_goal_rate)
                daily_deficit = abs(result['daily_deficit_surplus'])
                result['explanation']['target_description'] = (
                    f'To lose {abs_rate} lb/week, eat {target_calories} calories/day '
                    f'({daily_deficit} calorie deficit)'
                )
                result['explanation']['calculation_details'].append(
                    f'Weight loss goal: {abs_rate} lb/week = {abs_rate * CalorieCalculator.CALORIES_PER_POUND} calories/week = '
                    f'{daily_deficit} calorie deficit per day'
                )
            else:
                # Weight gain
                daily_surplus = result['daily_deficit_surplus']
                result['explanation']['target_description'] = (
                    f'To gain {user.weight_goal_rate} lb/week, eat {target_calories} calories/day '
                    f'({daily_surplus} calorie surplus)'
                )
                result['explanation']['calculation_details'].append(
                    f'Weight gain goal: {user.weight_goal_rate} lb/week = {user.weight_goal_rate * CalorieCalculator.CALORIES_PER_POUND} calories/week = '
                    f'{daily_surplus} calorie surplus per day'
                )
        else:
            # Maintenance
            result['target_calories'] = tdee
            result['explanation']['target_description'] = f'To maintain weight, eat {tdee} calories/day'
            result['explanation']['calculation_details'].append(
                'No weight goal set - target is maintenance at TDEE'
            )
        
        return result

