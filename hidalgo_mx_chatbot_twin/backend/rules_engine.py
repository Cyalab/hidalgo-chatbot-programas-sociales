import json
import logging
from typing import List, Dict, Any, Union

logger = logging.getLogger(__name__)

class RulesEngine:
    def __init__(self, rules_file: str = "priority_rules.json"):
        self.rules = self._load_rules(rules_file)

    def _load_rules(self, filepath: str) -> List[Dict]:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading rules from {filepath}: {e}")
            return []

    def evaluate(self, user_context: Dict[str, Any]) -> List[str]:
        """
        Evaluates user context against rules and returns a list of unique priority programs.
        """
        priority_programs = set()
        
        for rule in self.rules:
            if self._check_conditions(rule.get("conditions", {}), user_context):
                programs = rule.get("actions", {}).get("priority_programs", [])
                logger.info(f"Rule matched: {rule.get('description')} -> Boosting {programs}")
                priority_programs.update(programs)
                
        return list(priority_programs)

    def _check_conditions(self, condition_block: Dict, context: Dict) -> bool:
        # Handle logic operators
        if "AND" in condition_block:
            return all(self._check_conditions(cond, context) for cond in condition_block["AND"])
        if "OR" in condition_block:
            return any(self._check_conditions(cond, context) for cond in condition_block["OR"])
        if "NOT" in condition_block:
            return not self._check_conditions(condition_block["NOT"], context)

        # Handle leaf condition (comparison)
        field = condition_block.get("field")
        operator = condition_block.get("operator")
        value = condition_block.get("value")

        if not field or operator is None:
            return True # Empty condition usually implies match or ignored

        user_val = context.get(field)
        
        # Type safety for numeric comparisons
        if operator in ["<", ">", "<=", ">="] and (isinstance(user_val, (int, float)) and isinstance(value, (int, float))):
             if operator == "<": return user_val < value
             if operator == ">": return user_val > value
             if operator == "<=": return user_val <= value
             if operator == ">=": return user_val >= value
        
        # Standard equality
        if operator == "==": return str(user_val).lower() == str(value).lower() if isinstance(user_val, str) else user_val == value
        if operator == "!=": return user_val != value
        
        return False
