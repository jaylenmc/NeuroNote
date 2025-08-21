from django.contrib import admin
from .models import Folder, SubFolder

admin.site.register(Folder)
admin.site.register(SubFolder)