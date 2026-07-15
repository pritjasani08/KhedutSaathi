from datetime import datetime, timezone

def get_current_utc_time() -> str:
    """Returns the current UTC time in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()

def calculate_freshness(timestamp: str) -> str:
    """
    Calculates the freshness of a given ISO 8601 timestamp string.
    Returns strings like 'Live', '2 hours ago', '1 day ago', etc.
    """
    if not timestamp:
        return "Unknown"
    
    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        diff = now - dt
        
        minutes = diff.total_seconds() / 60
        if minutes < 10:
            return "Live"
        elif minutes < 60:
            return f"{int(minutes)} mins ago"
        
        hours = diff.total_seconds() / 3600
        if hours < 24:
            return f"{int(hours)} hours ago"
            
        days = diff.total_seconds() / 86400
        if days < 2:
            return "1 day ago"
            
        return f"{int(days)} days ago"
    except Exception:
        return "Unknown"
