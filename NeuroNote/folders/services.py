from django.db.models import Count
from folders.models import Folder

def check_content_num(folder):
    num = Folder.objects.filter(id=folder.id).annotate(
        document_count=Count('document', distinct=True),
        quiz_count=Count('quiz', distinct=True)
    ).first()

    if num is None:
        return 0
    
    return num.document_count + num.quiz_count