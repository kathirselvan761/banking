import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './models/Customer.js';
import Loan from './models/Loan.js';
import Transaction from './models/Transaction.js';
import Complaint from './models/Complaint.js';
import BankingEvent from './models/BankingEvent.js';
import RiskEvent from './models/RiskEvent.js';
import { logger } from './utils/logger.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/banking_ai';

const seedDatabase = async () => {
  try {
    logger.info(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB.');

    // Clear existing collections for clean demo state
    await Promise.all([
      Customer.deleteMany({}),
      Loan.deleteMany({}),
      Transaction.deleteMany({}),
      Complaint.deleteMany({}),
      BankingEvent.deleteMany({}),
      RiskEvent.deleteMany({})
    ]);
    logger.info('Cleared existing collections.');

    // --------------------------------------------------------------------------
    // 1. Customers (10+ Demo Profiles)
    // --------------------------------------------------------------------------
    const customersData = [
      {
        customer_id: 'C001',
        name: 'Alex Vance',
        age: 38,
        monthly_income: 50000,
        credit_score: 680,
        employment_type: 'Salaried',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C002',
        name: 'Elena Rostova',
        age: 44,
        monthly_income: 95000,
        credit_score: 750,
        employment_type: 'Business Owner',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C003',
        name: 'Marcus Brody',
        age: 29,
        monthly_income: 42000,
        credit_score: 590,
        employment_type: 'Self-Employed',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C004',
        name: 'Priya Sharma',
        age: 35,
        monthly_income: 78000,
        credit_score: 710,
        employment_type: 'Salaried',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C005',
        name: 'David Chen',
        age: 52,
        monthly_income: 130000,
        credit_score: 805,
        employment_type: 'Corporate Executive',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C006',
        name: 'Amara Okafor',
        age: 31,
        monthly_income: 36000,
        credit_score: 540,
        employment_type: 'Freelance',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C007',
        name: 'Lucas Silva',
        age: 40,
        monthly_income: 62000,
        credit_score: 660,
        employment_type: 'Salaried',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C008',
        name: 'Sarah Jenkins',
        age: 27,
        monthly_income: 48000,
        credit_score: 695,
        employment_type: 'Salaried',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C009',
        name: 'Tariq Al-Mansoor',
        age: 46,
        monthly_income: 110000,
        credit_score: 730,
        employment_type: 'Business Owner',
        account_status: 'ACTIVE'
      },
      {
        customer_id: 'C010',
        name: 'Claire Beauchamp',
        age: 33,
        monthly_income: 54000,
        credit_score: 615,
        employment_type: 'Self-Employed',
        account_status: 'ACTIVE'
      }
    ];

    await Customer.insertMany(customersData);
    logger.info(`Inserted ${customersData.length} customers.`);

    // --------------------------------------------------------------------------
    // 2. Loans (10+ Loans)
    // --------------------------------------------------------------------------
    const loansData = [
      // Main customer C001
      {
        loan_id: 'L001',
        customer_id: 'C001',
        loan_type: 'Personal',
        loan_amount: 400000,
        monthly_emi: 12000,
        outstanding_amount: 320000,
        overdue_amount: 0,
        emi_delay_count: 0,
        loan_status: 'CURRENT',
        start_date: new Date(Date.now() - 180 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L002',
        customer_id: 'C002',
        loan_type: 'Commercial',
        loan_amount: 850000,
        monthly_emi: 24000,
        outstanding_amount: 600000,
        overdue_amount: 0,
        emi_delay_count: 0,
        loan_status: 'CURRENT',
        start_date: new Date(Date.now() - 365 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L003',
        customer_id: 'C003',
        loan_type: 'Auto',
        loan_amount: 250000,
        monthly_emi: 8500,
        outstanding_amount: 195000,
        overdue_amount: 17000,
        emi_delay_count: 2,
        loan_status: 'WATCHLIST',
        start_date: new Date(Date.now() - 120 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L004',
        customer_id: 'C004',
        loan_type: 'Home',
        loan_amount: 1200000,
        monthly_emi: 22000,
        outstanding_amount: 1050000,
        overdue_amount: 0,
        emi_delay_count: 0,
        loan_status: 'CURRENT',
        start_date: new Date(Date.now() - 240 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L005',
        customer_id: 'C005',
        loan_type: 'Mortgage',
        loan_amount: 2000000,
        monthly_emi: 35000,
        outstanding_amount: 1400000,
        overdue_amount: 0,
        emi_delay_count: 0,
        loan_status: 'CURRENT',
        start_date: new Date(Date.now() - 400 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L006',
        customer_id: 'C006',
        loan_type: 'Personal',
        loan_amount: 180000,
        monthly_emi: 6200,
        outstanding_amount: 145000,
        overdue_amount: 18600,
        emi_delay_count: 3,
        loan_status: 'DELINQUENT',
        start_date: new Date(Date.now() - 90 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L007',
        customer_id: 'C007',
        loan_type: 'Education',
        loan_amount: 300000,
        monthly_emi: 7500,
        outstanding_amount: 210000,
        overdue_amount: 0,
        emi_delay_count: 0,
        loan_status: 'CURRENT',
        start_date: new Date(Date.now() - 150 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L008',
        customer_id: 'C008',
        loan_type: 'Auto',
        loan_amount: 220000,
        monthly_emi: 5800,
        outstanding_amount: 160000,
        overdue_amount: 0,
        emi_delay_count: 0,
        loan_status: 'CURRENT',
        start_date: new Date(Date.now() - 110 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L009',
        customer_id: 'C009',
        loan_type: 'Business',
        loan_amount: 900000,
        monthly_emi: 26000,
        outstanding_amount: 680000,
        overdue_amount: 0,
        emi_delay_count: 0,
        loan_status: 'CURRENT',
        start_date: new Date(Date.now() - 200 * 24 * 3600 * 1000)
      },
      {
        loan_id: 'L010',
        customer_id: 'C010',
        loan_type: 'Personal',
        loan_amount: 280000,
        monthly_emi: 9100,
        outstanding_amount: 220000,
        overdue_amount: 9100,
        emi_delay_count: 1,
        loan_status: 'WATCHLIST',
        start_date: new Date(Date.now() - 80 * 24 * 3600 * 1000)
      }
    ];

    await Loan.insertMany(loansData);
    logger.info(`Inserted ${loansData.length} loans.`);

    // --------------------------------------------------------------------------
    // 3. Transactions (25+ Transactions across customers, normal history for C001)
    // --------------------------------------------------------------------------
    const transactionsData = [
      // Normal transaction history for C001
      {
        transaction_id: 'TXN-C001-01',
        customer_id: 'C001',
        amount: 3400,
        transaction_type: 'PURCHASE',
        merchant_category: 'SUPERMARKET',
        location: 'Mumbai',
        device_id: 'DEV-C001-MOB',
        payment_method: 'UPI',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 15 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.18
      },
      {
        transaction_id: 'TXN-C001-02',
        customer_id: 'C001',
        amount: 1850,
        transaction_type: 'PURCHASE',
        merchant_category: 'FUEL',
        location: 'Mumbai',
        device_id: 'DEV-C001-MOB',
        payment_method: 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 12 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.22
      },
      {
        transaction_id: 'TXN-C001-03',
        customer_id: 'C001',
        amount: 850,
        transaction_type: 'PURCHASE',
        merchant_category: 'DINING',
        location: 'Mumbai',
        device_id: 'DEV-C001-MOB',
        payment_method: 'UPI',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.25
      },
      {
        transaction_id: 'TXN-C001-04',
        customer_id: 'C001',
        amount: 12000,
        transaction_type: 'TRANSFER',
        merchant_category: 'LOAN_REPAYMENT',
        location: 'Mumbai',
        device_id: 'DEV-C001-MOB',
        payment_method: 'AUTO_DEBIT',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.14
      },
      {
        transaction_id: 'TXN-C001-05',
        customer_id: 'C001',
        amount: 2200,
        transaction_type: 'PURCHASE',
        merchant_category: 'UTILITIES',
        location: 'Mumbai',
        device_id: 'DEV-C001-MOB',
        payment_method: 'NET_BANKING',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.21
      },
      {
        transaction_id: 'TXN-C001-06',
        customer_id: 'C001',
        amount: 4500,
        transaction_type: 'PURCHASE',
        merchant_category: 'HEALTHCARE',
        location: 'Mumbai',
        device_id: 'DEV-C001-MOB',
        payment_method: 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.19
      },
      // Transactions for other customers
      {
        transaction_id: 'TXN-C002-01',
        customer_id: 'C002',
        amount: 15000,
        transaction_type: 'PURCHASE',
        merchant_category: 'OFFICE_SUPPLIES',
        location: 'Delhi',
        device_id: 'DEV-C002-DESK',
        payment_method: 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.15
      },
      {
        transaction_id: 'TXN-C002-02',
        customer_id: 'C002',
        amount: 45000,
        transaction_type: 'TRANSFER',
        merchant_category: 'VENDOR_SETTLEMENT',
        location: 'Delhi',
        device_id: 'DEV-C002-DESK',
        payment_method: 'WIRE',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.12
      },
      {
        transaction_id: 'TXN-C003-01',
        customer_id: 'C003',
        amount: 85000,
        transaction_type: 'PURCHASE',
        merchant_category: 'JEWELRY',
        location: 'Unknown_IP',
        device_id: 'DEV-NEW-88',
        payment_method: 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        is_anomaly: true,
        anomaly_score: -0.19
      },
      {
        transaction_id: 'TXN-C003-02',
        customer_id: 'C003',
        amount: 1200,
        transaction_type: 'ATM_WITHDRAWAL',
        merchant_category: 'CASH',
        location: 'Bangalore',
        device_id: 'ATM-902',
        payment_method: 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.15
      },
      {
        transaction_id: 'TXN-C004-01',
        customer_id: 'C004',
        amount: 6500,
        transaction_type: 'PURCHASE',
        merchant_category: 'APPAREL',
        location: 'Chennai',
        device_id: 'DEV-C004-MOB',
        payment_method: 'UPI',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.20
      },
      {
        transaction_id: 'TXN-C004-02',
        customer_id: 'C004',
        amount: 22000,
        transaction_type: 'TRANSFER',
        merchant_category: 'MORTGAGE',
        location: 'Chennai',
        device_id: 'DEV-C004-MOB',
        payment_method: 'AUTO_DEBIT',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.16
      },
      {
        transaction_id: 'TXN-C005-01',
        customer_id: 'C005',
        amount: 35000,
        transaction_type: 'PURCHASE',
        merchant_category: 'TRAVEL',
        location: 'Singapore',
        device_id: 'DEV-C005-LAP',
        payment_method: 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.11
      },
      {
        transaction_id: 'TXN-C005-02',
        customer_id: 'C005',
        amount: 12500,
        transaction_type: 'PURCHASE',
        merchant_category: 'HOTEL',
        location: 'Singapore',
        device_id: 'DEV-C005-LAP',
        payment_method: 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.13
      },
      {
        transaction_id: 'TXN-C006-01',
        customer_id: 'C006',
        amount: 90000,
        transaction_type: 'TRANSFER',
        merchant_category: 'CRYPTO_EXCHANGE',
        location: 'Offshore_VPN',
        device_id: 'DEV-UNREC-99',
        payment_method: 'NET_BANKING',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000),
        is_anomaly: true,
        anomaly_score: -0.22
      },
      {
        transaction_id: 'TXN-C006-02',
        customer_id: 'C006',
        amount: 500,
        transaction_type: 'PURCHASE',
        merchant_category: 'GROCERIES',
        location: 'Kolkata',
        device_id: 'DEV-C006-MOB',
        payment_method: 'UPI',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.24
      },
      {
        transaction_id: 'TXN-C007-01',
        customer_id: 'C007',
        amount: 7500,
        transaction_type: 'TRANSFER',
        merchant_category: 'FEES',
        location: 'Pune',
        device_id: 'DEV-C007-MOB',
        payment_method: 'UPI',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.18
      },
      {
        transaction_id: 'TXN-C008-01',
        customer_id: 'C008',
        amount: 1200,
        transaction_type: 'PURCHASE',
        merchant_category: 'BOOKSTORE',
        location: 'Hyderabad',
        device_id: 'DEV-C008-MOB',
        payment_method: 'UPI',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.23
      },
      {
        transaction_id: 'TXN-C009-01',
        customer_id: 'C009',
        amount: 26000,
        transaction_type: 'TRANSFER',
        merchant_category: 'LOAN_EMI',
        location: 'Dubai',
        device_id: 'DEV-C009-MOB',
        payment_method: 'AUTO_DEBIT',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 11 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.17
      },
      {
        transaction_id: 'TXN-C010-01',
        customer_id: 'C010',
        amount: 9100,
        transaction_type: 'TRANSFER',
        merchant_category: 'LOAN_EMI',
        location: 'Ahmedabad',
        device_id: 'DEV-C010-MOB',
        payment_method: 'AUTO_DEBIT',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.18
      },
      {
        transaction_id: 'TXN-C010-02',
        customer_id: 'C010',
        amount: 3200,
        transaction_type: 'PURCHASE',
        merchant_category: 'ELECTRONICS',
        location: 'Ahmedabad',
        device_id: 'DEV-C010-MOB',
        payment_method: 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        is_anomaly: false,
        anomaly_score: 0.19
      }
    ];

    await Transaction.insertMany(transactionsData);
    logger.info(`Inserted ${transactionsData.length} transactions.`);

    // --------------------------------------------------------------------------
    // 4. Complaints (10+ Complaints)
    // --------------------------------------------------------------------------
    const complaintsData = [
      {
        complaint_id: 'CMP-001',
        customer_id: 'C003',
        category: 'Disputed Overdraft Fees',
        description: 'Charged unarranged overdraft fees despite sufficient balance.',
        status: 'UNDER_INVESTIGATION',
        priority: 'HIGH',
        sentiment: 'NEGATIVE',
        sentiment_score: -0.78,
        created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-002',
        customer_id: 'C003',
        category: 'Loan Restructuring Request',
        description: 'Unable to meet monthly installment, requested 3-month grace period.',
        status: 'OPEN',
        priority: 'CRITICAL',
        sentiment: 'NEGATIVE',
        sentiment_score: -0.85,
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-003',
        customer_id: 'C006',
        category: 'Account Frozen',
        description: 'Debit card stopped working abroad without prior notification.',
        status: 'RESOLVED',
        priority: 'HIGH',
        sentiment: 'NEGATIVE',
        sentiment_score: -0.91,
        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-004',
        customer_id: 'C006',
        category: 'Interest Rate Spike',
        description: 'Floating rate increased substantially making repayment difficult.',
        status: 'OPEN',
        priority: 'HIGH',
        sentiment: 'NEGATIVE',
        sentiment_score: -0.74,
        created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-005',
        customer_id: 'C010',
        category: 'Late Fee Waiver',
        description: 'Requested waiver for one-day payment processing delay.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        sentiment: 'NEUTRAL',
        sentiment_score: -0.20,
        created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-006',
        customer_id: 'C002',
        category: 'Merchant Settlement Delay',
        description: 'POS terminal batch settlement took 48 hours instead of 24 hours.',
        status: 'RESOLVED',
        priority: 'LOW',
        sentiment: 'NEUTRAL',
        sentiment_score: 0.05,
        created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-007',
        customer_id: 'C004',
        category: 'Annual Tax Statement Request',
        description: 'Need provisional interest statement for IT return filing.',
        status: 'RESOLVED',
        priority: 'LOW',
        sentiment: 'POSITIVE',
        sentiment_score: 0.40,
        created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-008',
        customer_id: 'C007',
        category: 'Online Portal Downtime',
        description: 'Could not log in to net banking during scheduled maintenance.',
        status: 'CLOSED',
        priority: 'LOW',
        sentiment: 'NEUTRAL',
        sentiment_score: -0.15,
        created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-009',
        customer_id: 'C008',
        category: 'Address Update',
        description: 'Requested verification of updated permanent address proof.',
        status: 'RESOLVED',
        priority: 'LOW',
        sentiment: 'POSITIVE',
        sentiment_score: 0.35,
        created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000)
      },
      {
        complaint_id: 'CMP-010',
        customer_id: 'C009',
        category: 'Credit Line Extension',
        description: 'Application for working capital limit enhancement pending review.',
        status: 'IN_REVIEW',
        priority: 'MEDIUM',
        sentiment: 'NEUTRAL',
        sentiment_score: 0.10,
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000)
      }
    ];

    await Complaint.insertMany(complaintsData);
    logger.info(`Inserted ${complaintsData.length} complaints.`);

    // --------------------------------------------------------------------------
    // 5. Initial Banking Events (C001 clean baseline history)
    // --------------------------------------------------------------------------
    const initialEvents = [
      {
        event_id: 'EVT-INIT-01',
        customer_id: 'C001',
        event_type: 'EMI_PAYMENT_SUCCESS',
        source: 'CORE_BANKING',
        amount: 12000,
        metadata: { loan_id: 'L001', month: 'Prior Month' },
        timestamp: new Date(Date.now() - 30 * 24 * 3600 * 1000)
      },
      {
        event_id: 'EVT-INIT-02',
        customer_id: 'C001',
        event_type: 'TRANSACTION_COMPLETED',
        source: 'POS_GATEWAY',
        amount: 3400,
        metadata: { category: 'SUPERMARKET' },
        timestamp: new Date(Date.now() - 15 * 24 * 3600 * 1000)
      }
    ];

    await BankingEvent.insertMany(initialEvents);
    logger.info(`Inserted initial banking events.`);

    // Initial Risk Event for C001 (baseline: LOW risk)
    await RiskEvent.create({
      event_id: 'RISK-INIT-C001',
      customer_id: 'C001',
      risk_score: 5,
      risk_level: 'LOW',
      default_probability: 0.05,
      trigger_event: 'BASELINE_INITIALIZATION',
      features: {
        credit_score: 680,
        monthly_income: 50000,
        loan_amount: 400000,
        monthly_emi: 12000,
        outstanding_amount: 320000,
        overdue_amount: 0,
        emi_delay_count: 0
      }
    });

    logger.info('==================================================');
    logger.info('DATABASE SEED COMPLETED SUCCESSFULLY!');
    logger.info('Primary customer C001 ready for realtime simulation:');
    logger.info('  - credit_score: 680');
    logger.info('  - monthly_income: 50000');
    logger.info('  - loan_amount: 400000');
    logger.info('  - monthly_emi: 12000');
    logger.info('  - outstanding_amount: 320000');
    logger.info('  - overdue_amount: 0');
    logger.info('  - emi_delay_count: 0');
    logger.info('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Database seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
