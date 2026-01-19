const path = require('path');
const fs = require('fs');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const asyncHandler = require('express-async-handler');
const FoodItem = require('../models/FoodItem');

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const KEY_FILE = process.env.GA4_KEY_FILE || path.join(__dirname, '..', 'service-account.json');

// Lazy client getter to avoid crashing when GA creds are not configured
const getClient = () => {
  const hasCreds = PROPERTY_ID && KEY_FILE && fs.existsSync(KEY_FILE);
  if (!hasCreds) return null;
  return new BetaAnalyticsDataClient({ keyFilename: KEY_FILE });
};

// @desc    Get summary metrics (visitors, reservations, orders, revenue) last 7 days
// @route   GET /api/analytics/summary
// @access  Public (consider protecting if needed)
const getSummary = asyncHandler(async (req, res) => {
  const client = getClient();
  const products = await FoodItem.countDocuments();

  // If GA is not configured, return zeros with products count
  if (!client) {
    return res.json({
      visitors: 0,
      reservations: 0,
      orders: 0,
      revenue: 0,
      visitorsSeries: [],
      revenueSeries: [],
    });
  }

  const [[totals], [events], [series]] = await Promise.all([
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
    client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'purchaseRevenue' }],
      dimensions: [{ name: 'date' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
  ]);

  const visitors = Number(totals.rows?.[0]?.metricValues?.[0]?.value || 0);
  const revenue = Number(totals.rows?.[0]?.metricValues?.[1]?.value || 0);

  let reservations = 0;
  let orders = 0;

  const visitorsSeries = [];
  const revenueSeries = [];

  (events.rows || []).forEach((row) => {
    const eventName = row.dimensionValues?.[0]?.value;
    const count = Number(row.metricValues?.[0]?.value || 0);
    if (eventName === 'reservation_created') reservations += count;
    if (eventName === 'order_created') orders += count;
  });

  (series.rows || []).forEach((row) => {
    const date = row.dimensionValues?.[0]?.value;
    const v = Number(row.metricValues?.[0]?.value || 0);
    const r = Number(row.metricValues?.[1]?.value || 0);
    visitorsSeries.push({ date, value: v });
    revenueSeries.push({ date, value: r });
  });

  res.json({ visitors, reservations, orders, revenue, products, visitorsSeries, revenueSeries });
});

module.exports = { getSummary };
