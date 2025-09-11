const Transaction = require("../model/Transaction");
const Report = require("../model/report");

/**
 * Rebuilds all reports for all customers
 * Calculates daily, monthly, yearly stats including:
 * - completedOrders
 * - rejectedOrders
 * - totalAmount
 * - invoiceCount
 * - paymentTypeBreakdown (cash, card, upi, wallet)
 */
const rebuildReports = async () => {
  try {
    // Clear old reports
    await Report.deleteMany({});

    // Fetch all transactions
    const transactions = await Transaction.find();

    // Group transactions by customer
    const customerMap = new Map();
    for (const t of transactions) {
      const customerId = t.customerId.toString();
      if (!customerMap.has(customerId)) customerMap.set(customerId, []);
      customerMap.get(customerId).push(t);
    }

    // Build report for each customer
    for (const [customerId, customerTxns] of customerMap) {
      const report = new Report({ customerId });

      customerTxns.forEach((t) => {
        const date = new Date(t.createdAt);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const paymentTypes = ["cash", "card", "upi", "wallet"];

        // --- Daily ---
        let daily = report.daily.find(
          (d) => d.date.toDateString() === date.toDateString()
        );
        if (!daily) {
          daily = {
            date,
            completedOrders: 0,
            rejectedOrders: 0,
            totalAmount: 0,
            invoiceCount: 0,
            paymentTypeBreakdown: { cash: 0, card: 0, upi: 0, wallet: 0 },
          };
          report.daily.push(daily);
        }
        if (t.status === "completed") daily.completedOrders++;
        if (t.status === "rejected") daily.rejectedOrders++;
        daily.totalAmount += t.amount;
        daily.invoiceCount++;
        if (paymentTypes.includes(t.paymentType)) {
          daily.paymentTypeBreakdown[t.paymentType] += t.amount;
        }

        // --- Monthly ---
        let monthly = report.monthly.find(
          (m) => m.month === month && m.year === year
        );
        if (!monthly) {
          monthly = {
            month,
            year,
            completedOrders: 0,
            rejectedOrders: 0,
            totalAmount: 0,
            invoiceCount: 0,
            paymentTypeBreakdown: { cash: 0, card: 0, upi: 0, wallet: 0 },
          };
          report.monthly.push(monthly);
        }
        if (t.status === "completed") monthly.completedOrders++;
        if (t.status === "rejected") monthly.rejectedOrders++;
        monthly.totalAmount += t.amount;
        monthly.invoiceCount++;
        if (paymentTypes.includes(t.paymentType)) {
          monthly.paymentTypeBreakdown[t.paymentType] += t.amount;
        }

        // --- Yearly ---
        let yearly = report.yearly.find((y) => y.year === year);
        if (!yearly) {
          yearly = {
            year,
            completedOrders: 0,
            rejectedOrders: 0,
            totalAmount: 0,
            invoiceCount: 0,
            paymentTypeBreakdown: { cash: 0, card: 0, upi: 0, wallet: 0 },
          };
          report.yearly.push(yearly);
        }
        if (t.status === "completed") yearly.completedOrders++;
        if (t.status === "rejected") yearly.rejectedOrders++;
        yearly.totalAmount += t.amount;
        yearly.invoiceCount++;
        if (paymentTypes.includes(t.paymentType)) {
          yearly.paymentTypeBreakdown[t.paymentType] += t.amount;
        }
      });

      // Save customer report
      await report.save();
    }

    console.log("✅ Reports rebuilt successfully.");
  } catch (error) {
    console.error("❌ Error rebuilding reports:", error);
    throw error;
  }
};

module.exports = { rebuildReports };
``