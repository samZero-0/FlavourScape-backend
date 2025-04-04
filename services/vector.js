const { loadAndSplitMarkdownFiles } = require('../utils/documentLoader');
const { PineconeStore } = require("@langchain/community/vectorstores/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const { HuggingFaceTransformersEmbeddings } = require("@langchain/community/embeddings/hf_transformers");

/**
 * Initializes and returns a Pinecone vector store with embedded documents
 * @returns {Promise<PineconeStore>} Initialized vector store
 */
async function initializeVectorStore() {
  // Validate required environment variables
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("Missing PINECONE_API_KEY in environment variables");
  }
  if (!process.env.PINECONE_INDEX) {
    throw new Error("Missing PINECONE_INDEX in environment variables");
  }

  try {
    console.log("Initializing Pinecone client...");
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = process.env.PINECONE_INDEX;
    console.log(`Connecting to Pinecone index: ${indexName}`);
    
    console.log("Loading and splitting markdown files...");
    const documents = await loadAndSplitMarkdownFiles();
    if (!documents || documents.length === 0) {
      throw new Error("No documents were loaded");
    }
    console.log(`Processed ${documents.length} document chunks from markdown files`);

    // Add general knowledge documents
    const generalKnowledge = [
      {
        pageContent: "Our company provides eco-friendly solutions and products",
        metadata: { source: "general", section: "about", type: "general" }
      },
      {
        pageContent: "We value sustainability and environmental responsibility",
        metadata: { source: "general", section: "values", type: "general" }
      },
      {
        pageContent: "Contact us at info@company.com for general inquiries",
        metadata: { source: "general", section: "contact", type: "general" }
      }
    ];

    const allDocuments = [...documents, ...generalKnowledge];
    console.log(`Total documents including general knowledge: ${allDocuments.length}`);

    console.log("Creating embeddings...");
    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2",
      maxConcurrency: 1,
    });

    console.log("Creating vector store...");
    const vectorStore = await PineconeStore.fromDocuments(
      allDocuments,
      embeddings,
      {
        pineconeIndex: pinecone.Index(indexName),
        namespace: "eco-chatbot",
        maxConcurrency: 2,
      }
    );

    console.log("Vector store initialized successfully");
    return vectorStore;
  } catch (error) {
    console.error("Vector store initialization failed:", error);
    throw error;
  }
}

// Maintain a single instance
let vectorStore;

module.exports = {
  initializeVectorStore,
  getVectorStore: () => vectorStore,
  setVectorStore: (store) => { vectorStore = store; }
};