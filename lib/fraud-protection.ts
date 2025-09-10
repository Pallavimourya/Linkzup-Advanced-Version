import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface FraudCheckResult {
  isAllowed: boolean
  reason?: string
  riskLevel: "Low" | "Medium" | "High"
  details: {
    emailMatches?: number
    deviceMatches?: number
    ipMatches?: number
    phoneMatches?: number
    paymentMethodMatches?: number
  }
}

export async function checkFraudProtection(
  email: string,
  deviceFingerprint?: string,
  ipAddress?: string,
  phoneNumber?: string,
  paymentMethodId?: string
): Promise<FraudCheckResult> {
  try {
    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const payments = db.collection("payments")

    const details = {
      emailMatches: 0,
      deviceMatches: 0,
      ipMatches: 0,
      phoneMatches: 0,
      paymentMethodMatches: 0
    }

    // Check for existing users with same email
    const emailMatches = await users.countDocuments({ email })
    details.emailMatches = emailMatches

    // Check for existing users with same device fingerprint
    if (deviceFingerprint) {
      const deviceMatches = await users.countDocuments({ deviceFingerprint })
      details.deviceMatches = deviceMatches
    }

    // Check for existing users with same IP (if we store IP addresses)
    if (ipAddress) {
      const ipMatches = await users.countDocuments({ 
        $or: [
          { lastLoginIP: ipAddress },
          { registrationIP: ipAddress }
        ]
      })
      details.ipMatches = ipMatches
    }

    // Check for existing users with same phone number
    if (phoneNumber) {
      const phoneMatches = await users.countDocuments({ phone: phoneNumber })
      details.phoneMatches = phoneMatches
    }

    // Check for existing payments with same payment method
    if (paymentMethodId) {
      const paymentMatches = await payments.countDocuments({ 
        paymentMethodId,
        status: "completed"
      })
      details.paymentMethodMatches = paymentMatches
    }

    // Calculate risk level
    let riskScore = 0
    let riskLevel: "Low" | "Medium" | "High" = "Low"

    // Email matches (should be 0 for new users)
    if (emailMatches > 0) {
      riskScore += 50
    }

    // Device fingerprint matches
    if (details.deviceMatches > 0) {
      riskScore += 30
    }

    // IP address matches
    if (details.ipMatches > 2) {
      riskScore += 20
    }

    // Phone number matches
    if (details.phoneMatches > 0) {
      riskScore += 25
    }

    // Payment method matches
    if (details.paymentMethodMatches > 0) {
      riskScore += 40
    }

    // Determine risk level
    if (riskScore >= 70) {
      riskLevel = "High"
    } else if (riskScore >= 40) {
      riskLevel = "Medium"
    }

    // Check if user should be blocked
    const isAllowed = riskScore < 70 // Block if high risk

    let reason = ""
    if (!isAllowed) {
      const reasons = []
      if (emailMatches > 0) reasons.push("Email already exists")
      if (details.deviceMatches > 0) reasons.push("Device already used")
      if (details.ipMatches > 2) reasons.push("IP address overused")
      if (details.phoneMatches > 0) reasons.push("Phone number already exists")
      if (details.paymentMethodMatches > 0) reasons.push("Payment method already used")
      reason = reasons.join(", ")
    }

    return {
      isAllowed,
      reason,
      riskLevel,
      details
    }

  } catch (error) {
    console.error("Fraud protection check error:", error)
    // In case of error, allow registration but log it
    return {
      isAllowed: true,
      riskLevel: "Medium",
      details: {
        emailMatches: 0,
        deviceMatches: 0,
        ipMatches: 0,
        phoneMatches: 0,
        paymentMethodMatches: 0
      }
    }
  }
}

export async function logFraudAttempt(
  email: string,
  deviceFingerprint?: string,
  ipAddress?: string,
  userAgent?: string,
  reason: string = "Fraud attempt detected"
) {
  try {
    const { db } = await connectToDatabase()
    const fraudLogs = db.collection("fraud_logs")

    await fraudLogs.insertOne({
      email,
      deviceFingerprint,
      ipAddress,
      userAgent,
      reason,
      timestamp: new Date(),
      blocked: true
    })
  } catch (error) {
    console.error("Failed to log fraud attempt:", error)
  }
}

export async function getFraudAnalytics() {
  try {
    const { db } = await connectToDatabase()
    const fraudLogs = db.collection("fraud_logs")

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
      attempts24h,
      attempts7d,
      attempts30d,
      topReasons,
      topIPs
    ] = await Promise.all([
      fraudLogs.countDocuments({ timestamp: { $gte: last24Hours } }),
      fraudLogs.countDocuments({ timestamp: { $gte: last7Days } }),
      fraudLogs.countDocuments({ timestamp: { $gte: last30Days } }),
      fraudLogs.aggregate([
        { $group: { _id: "$reason", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray(),
      fraudLogs.aggregate([
        { $match: { ipAddress: { $exists: true } } },
        { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray()
    ])

    return {
      attempts: {
        last24Hours: attempts24h,
        last7Days: attempts7d,
        last30Days: attempts30d
      },
      topReasons,
      topIPs
    }
  } catch (error) {
    console.error("Failed to get fraud analytics:", error)
    return {
      attempts: { last24Hours: 0, last7Days: 0, last30Days: 0 },
      topReasons: [],
      topIPs: []
    }
  }
}
