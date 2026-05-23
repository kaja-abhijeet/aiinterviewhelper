from app.rag.vectorstore import create_vectorstore
from app.rag.loader import load_pdf
from app.rag.chunker import chunk_documents

def retrieve_context(file_path: str, query: str):

    documents = load_pdf(file_path)

    chunks = chunk_documents(documents)

    vectorstore = create_vectorstore(chunks)

    retriever = vectorstore.as_retriever()

    results = retriever.invoke(query)

    return results