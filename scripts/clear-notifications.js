const { MongoClient } = require('mongodb');

async function clearAllNotifications() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/linkzup';
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Get count before deletion
    const beforeCount = await db.collection('notifications').countDocuments();
    console.log(`Found ${beforeCount} notifications in database`);
    
    if (beforeCount === 0) {
      console.log('No notifications to delete');
      return;
    }
    
    // Delete all notifications
    const result = await db.collection('notifications').deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} notifications`);
    
    // Verify deletion
    const afterCount = await db.collection('notifications').countDocuments();
    console.log(`Remaining notifications: ${afterCount}`);
    
  } catch (error) {
    console.error('Error clearing notifications:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
clearAllNotifications();
