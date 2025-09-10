import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    const { db } = await connectToDatabase()
    const plans = db.collection("plans")

    // Clear existing plans
    await plans.deleteMany({})

    // Credit Plans (One-time purchases)
    const creditPlans = [
      {
        name: "Starter Pack",
        type: "credit_pack",
        interval: "one_time",
        price: 500,
        credits: 50,
        features: [
          "Text generation: 100 posts",
          "With posting: 50 posts", 
          "Image generation: 50 images",
          "Valid for 6 months"
        ],
        popular: false,
        recommended: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Pro Pack",
        type: "credit_pack",
        interval: "one_time",
        price: 1000,
        credits: 120,
        features: [
          "Text generation: 240 posts",
          "With posting: 120 posts",
          "Image generation: 120 images", 
          "Valid for 12 months",
          "20% bonus credits!"
        ],
        popular: true,
        recommended: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Subscription Plans (Monthly)
    const subscriptionPlans = [
      {
        name: "Basic Plan",
        type: "subscription",
        interval: "monthly",
        price: 299,
        credits: 10,
        features: [
          "Monthly credit allocation",
          "Text generation: 20 posts",
          "With posting: 10 posts",
          "Image generation: 10 images",
          "Priority support"
        ],
        popular: false,
        recommended: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Professional Plan",
        type: "subscription",
        interval: "monthly",
        price: 599,
        credits: 25,
        features: [
          "Monthly credit allocation",
          "Text generation: 50 posts",
          "With posting: 25 posts",
          "Image generation: 25 images",
          "Priority support",
          "Advanced analytics"
        ],
        popular: false,
        recommended: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Enterprise Plan",
        type: "subscription",
        interval: "monthly",
        price: 999,
        credits: 50,
        features: [
          "Monthly credit allocation",
          "Text generation: 100 posts",
          "With posting: 50 posts",
          "Image generation: 50 images",
          "Priority support",
          "Advanced analytics",
          "Custom integrations"
        ],
        popular: false,
        recommended: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Insert all plans
    const allPlans = [...creditPlans, ...subscriptionPlans]
    const result = await plans.insertMany(allPlans)

    return NextResponse.json({
      success: true,
      message: "Plans initialized successfully",
      insertedCount: result.insertedCount,
      plans: {
        creditPlans: creditPlans.length,
        subscriptionPlans: subscriptionPlans.length,
        total: allPlans.length
      }
    })

  } catch (error) {
    console.error("Error initializing plans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
