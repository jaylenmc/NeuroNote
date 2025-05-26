from django.contrib import admin
from .models import Achievements, Badge, UserAchievements

admin.site.register(Achievements)
admin.site.register(Badge)
admin.site.register(UserAchievements)