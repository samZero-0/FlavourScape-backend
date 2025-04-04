const express = require('express');
const router = express.Router();
const { getVectorStore } = require('../services/vector');

/**
 * Chatbot search endpoint with three-tier response system:
 * 1. Exact FAQ matches (high confidence)
 * 2. General knowledge matches
 * 3. Fallback response
 */
router.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const vectorStore = await getVectorStore();
    if (!vectorStore) {
      throw new Error("Vector store not initialized");
    }

    // 1. First try exact FAQ matches
    const faqResults = await vectorStore.similaritySearch(query, 1, {
      filter: { source: "faq.md" },
      scoreThreshold: 0.85
    });

    if (faqResults.length > 0) {
      return res.json({
        type: "faq",
        results: [{
          text: faqResults[0].pageContent,
          source: "FAQ",
          section: faqResults[0].metadata.section,
          confidence: faqResults[0].score
        }]
      });
    }

    // 2. Fall back to general knowledge
    const generalResults = await vectorStore.similaritySearch(query, 3, {
      filter: { type: "general" },
      scoreThreshold: 0.45
    });

    if (generalResults.length > 0) {
      // Sort by confidence and take top 2
      const topResults = generalResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(r => ({
          text: r.pageContent,
          source: r.metadata.source,
          section: r.metadata.section,
          confidence: r.score
        }));

      return res.json({
        type: "general",
        results: topResults
      });
    }

    // 3. Final fallback for unknown queries
    return res.json({
      type: "fallback",
      results: [{
        text: "I'm still learning about that topic. For more specific questions, please contact our support team at support@company.com.",
        source: "system",
        confidence: 0
      }]
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ 
      error: "Search failed",
      details: error.message 
    });
  }
});

/**
 * Endpoint to manually refresh the vector store
 */
router.post('/refresh', async (req, res) => {
  try {
    const { initializeVectorStore, setVectorStore } = require('../services/vector');
    const newVectorStore = await initializeVectorStore();
    setVectorStore(newVectorStore);
    res.json({ success: true, message: "Vector store refreshed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;