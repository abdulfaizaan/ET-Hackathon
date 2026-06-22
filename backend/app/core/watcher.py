import os
import time
import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from app.core.ingestion import process_document

class S3BucketHandler(FileSystemEventHandler):
    def __init__(self, loop):
        self.loop = loop
        super().__init__()

    def on_created(self, event):
        if event.is_directory:
            return
            
        print(f"📁 New file detected in S3 bucket: {event.src_path}")
        
        # Simulate processing delay
        time.sleep(1)
        
        filepath = event.src_path
        filename = os.path.basename(filepath)
        
        # Determine document type (csv, pdf, etc.)
        doc_type = filename.split('.')[-1].lower()
        
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
                
            print(f"🚀 Triggering Event-Driven Extraction Pipeline for {filename}...")
            
            # Run the async process_document function
            future = asyncio.run_coroutine_threadsafe(
                process_document(content, filename, doc_type),
                self.loop
            )
            
            # We don't necessarily need to block here, but we can wait for completion
            result = future.result()
            print(f"✅ Background Ingestion Complete: {result}")
            
        except Exception as e:
            print(f"❌ Error processing file {filename}: {str(e)}")

def start_watcher(loop):
    bucket_path = os.path.join(os.path.dirname(__file__), "..", "s3_bucket")
    
    # Create the directory if it doesn't exist
    if not os.path.exists(bucket_path):
        os.makedirs(bucket_path)
        
    event_handler = S3BucketHandler(loop)
    observer = Observer()
    observer.schedule(event_handler, bucket_path, recursive=False)
    observer.start()
    
    print(f"👀 Event-Driven Pipeline active. Watching directory: {bucket_path}")
    
    return observer
