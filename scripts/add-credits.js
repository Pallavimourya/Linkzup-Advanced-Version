const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function addCreditsToUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Find user by email
    const user = await users.findOne({ email: 'papa@gmail.com' });
    
    if (!user) {
      console.log('User papa@gmail.com not found. Creating new user...');
      
      // Create new user with credits
      const result = await users.insertOne({
        email: 'papa@gmail.com',
        name: 'Papa',
        credits: 10000,
        totalCreditsEver: 10000,
        isTrialActive: false,
        trialStartDate: new Date(),
        trialPeriodDays: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Created new user with ID:', result.insertedId);
      console.log('Added 10000 credits to papa@gmail.com');
    } else {
      console.log('User found:', user.email);
      
      // Update existing user's credits
      const result = await users.updateOne(
        { email: 'papa@gmail.com' },
        {
          $set: {
            credits: 10000,
            totalCreditsEver: 10000,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log('Successfully updated credits for papa@gmail.com');
        console.log('Set credits to 10000');
      } else {
        console.log('No changes made to user credits');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addCreditsToUser();
