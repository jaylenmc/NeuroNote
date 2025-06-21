from achievements.utils import xp_for_level

def reward_xp(user, rating):
    base_xp = 10 if rating > 0 else 2  # Less for failed card
    user.xp += base_xp

    while user.xp >= xp_for_level(user.level):
        user.xp -= xp_for_level(user.level)
        user.level += 1
        # Optional: reward perks on level-up
        # send_level_up_notification(user)

    user.save()