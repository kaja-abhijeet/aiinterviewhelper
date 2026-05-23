from langchain_community.vectorstores import Chroma

from app.rag.embeddings import embedding_model

def create_vectorstore(chunks):

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory="./chroma_db"
    )

    return vectorstore