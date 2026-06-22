import os
from neo4j import GraphDatabase
from qdrant_client import QdrantClient
from llama_index.core import Settings
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.gemini import GeminiEmbedding

# Initialize LLM and Embeddings globally
def init_llm_settings():
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        Settings.llm = Gemini(model="models/gemini-1.5-pro", api_key=api_key)
        Settings.embed_model = GeminiEmbedding(model_name="models/embedding-001", api_key=api_key)
    else:
        print("Warning: GEMINI_API_KEY not found in environment.")

# Neo4j Client
class Neo4jManager:
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USERNAME", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def run_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record for record in result]

neo4j_manager = Neo4jManager()

# Qdrant Client (Local Memory/Disk)
qdrant_client = QdrantClient(path="./qdrant_data")
# Ensure collection exists
collection_name = "forgemind_docs"
try:
    qdrant_client.get_collection(collection_name)
except Exception:
    qdrant_client.create_collection(
        collection_name=collection_name,
        vectors_config={"size": 768, "distance": "Cosine"} # Gemini embeddings are 768 dims
    )

init_llm_settings()
