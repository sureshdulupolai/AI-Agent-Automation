import { db } from '../config/database.js';

/**
 * Get current user/tenant wallet balance and billing stats
 */
export async function getWallet(req, res) {
  try {
    const userId = req.user?.userId || req.tenant?.id || 'usr-demo-1';
    const wallet = await db.getWalletByUserId(userId);
    const transactions = await db.getTransactions(userId);

    return res.json({
      success: true,
      wallet,
      recentTransactions: transactions.slice(0, 15)
    });
  } catch (err) {
    console.error('getWallet error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve wallet information' });
  }
}

/**
 * Top up / Recharge wallet credits
 * In free/unlimited mode, instant free credits or simulated payments are supported
 */
export async function topUpWallet(req, res) {
  try {
    const userId = req.user?.userId || req.tenant?.id || 'usr-demo-1';
    const { amount, paymentMethod = 'instant_credit' } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Please provide a valid top-up amount' });
    }

    const result = await db.addWalletCredit(
      userId,
      numAmount,
      `Wallet Top-Up (${paymentMethod.toUpperCase()})`
    );

    return res.json({
      success: true,
      message: `Successfully added ₹${numAmount.toFixed(2)} to wallet`,
      wallet: result.wallet,
      transaction: result.transaction
    });
  } catch (err) {
    console.error('topUpWallet error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process wallet top-up' });
  }
}

/**
 * Get transaction history with pagination
 */
export async function getTransactions(req, res) {
  try {
    const userId = req.user?.userId || req.tenant?.id || 'usr-demo-1';
    const transactions = await db.getTransactions(userId);

    return res.json({
      success: true,
      transactions
    });
  } catch (err) {
    console.error('getTransactions error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch transaction logs' });
  }
}

/**
 * Toggle between 100% Free Unlimited Mode and Client Metered Reselling
 */
export async function updateWalletSettings(req, res) {
  try {
    const userId = req.user?.userId || req.tenant?.id || 'usr-demo-1';
    const { is_unlimited, cost_per_sms, cost_per_marketing } = req.body;

    const wallet = await db.getWalletByUserId(userId);
    if (typeof is_unlimited === 'boolean') wallet.is_unlimited = is_unlimited;
    if (!isNaN(Number(cost_per_sms))) wallet.cost_per_sms = Number(cost_per_sms);
    if (!isNaN(Number(cost_per_marketing))) wallet.cost_per_marketing = Number(cost_per_marketing);
    wallet.updated_at = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Wallet settings updated successfully',
      wallet
    });
  } catch (err) {
    console.error('updateWalletSettings error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update wallet settings' });
  }
}
