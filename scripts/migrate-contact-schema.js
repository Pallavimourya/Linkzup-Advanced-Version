const { MongoClient } = require('mongodb')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Linkzup-Advanced'

async function migrateContactSchema() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('Linkzup-Advanced')
    const collection = db.collection('contactSubmissions')
    
    // Find all documents without replies field
    const documentsToUpdate = await collection.find({
      replies: { $exists: false }
    }).toArray()
    
    console.log(`Found ${documentsToUpdate.length} documents to migrate`)
    
    if (documentsToUpdate.length === 0) {
      console.log('No documents need migration')
      return
    }
    
    // Update all documents to add missing fields
    const updateResult = await collection.updateMany(
      { replies: { $exists: false } },
      {
        $set: {
          replies: [],
          replyCount: 0,
          lastRepliedAt: null
        }
      }
    )
    
    console.log(`Migration completed: ${updateResult.modifiedCount} documents updated`)
    
    // Verify the migration
    const verifyResult = await collection.find({
      replies: { $exists: true }
    }).count()
    
    console.log(`Verification: ${verifyResult} documents now have replies field`)
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateContactSchema()
    .then(() => {
      console.log('Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateContactSchema }
