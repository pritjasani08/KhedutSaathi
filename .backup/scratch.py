import traceback
try:
    from rag_system.src.api_utils import process_query
    print(process_query("What is wheat?"))
except Exception as e:
    traceback.print_exc()
