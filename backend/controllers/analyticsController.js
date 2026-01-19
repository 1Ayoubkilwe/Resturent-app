const path = require('path');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const asyncHandler = require('express-async-handler');
const FoodItem = require('../models/FoodItem');

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const KEY_FILE = process.env.GA4_KEY_FILE || path.join(__dirname, '..', 'service-account.json');

const client = new BetaAnalyticsDataClient({
  keyFilename: KEY_FILE,
});

// @desc    Get summary metrics (visitors, reservations, orders, revenue) last 7 days
// @route   GET /api/analytics/summary
// @access  Public (consider protecting if needed)
const getSummary = asyncHandler(async (req, res) => {
  if (!PROPERTY_ID) {
    res.status(500);
    throw new Error('GA4_PROPERTY_ID is not set');
  }

  const [[totals], [events], products] = await Promise.all([
    client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'purchaseRevenue' }],
    }),
    client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'eventCount' }],
      dimensions: [{ name: 'eventName' }],
    }),
    FoodItem.countDocuments(),
  ]);

  const visitors = Number(totals.rows?.[0]?.metricValues?.[0]?.value || 0);
  const revenue = Number(totals.rows?.[0]?.metricValues?.[1]?.value || 0);

  let reservations = 0;
  let orders = 0;

  (events.rows || []).forEach((row) => {
    const eventName = row.dimensionValues?.[0]?.value;
    const count = Number(row.metricValues?.[0]?.value || 0);
    if (eventName === 'reservation_created') reservations += count;
    if (eventName === 'order_created') orders += count;
  });

  res.json({ visitors, reservations, orders, revenue, products });
});

module.exports = { getSummary };
