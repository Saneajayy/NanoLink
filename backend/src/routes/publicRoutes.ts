import express from 'express';

const router = express.Router();

router.get('/stats/public', (req, res) => {
  // Fake usage metrics for the landing page per spec (Section 7)
  // TODO: Swap these with real aggregation queries once the app has users
  res.json({
    totalLinksShortened: "2,483,120",
    activeUsers: "48,900+",
    totalClicksTracked: "19.2M",
    countriesReached: 132
  });
});

export default router;
