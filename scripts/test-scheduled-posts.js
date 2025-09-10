const { MongoClient, ObjectId } = require('mongodb');

async function testScheduledPosts() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db("Linkzup-Advanced");
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(col => col.name));

    // Check if scheduled_posts collection exists
    const scheduledPostsCollection = collections.find(col => col.name === "scheduled_posts");
    if (!scheduledPostsCollection) {
      console.log('❌ scheduled_posts collection does not exist');
      return;
    }

    console.log('✅ scheduled_posts collection exists');

    // Count total documents in scheduled_posts
    const totalCount = await db.collection("scheduled_posts").countDocuments({});
    console.log(`Total documents in scheduled_posts: ${totalCount}`);

    if (totalCount === 0) {
      console.log('❌ No documents found in scheduled_posts collection');
      return;
    }

    // Get a sample document to see the structure
    const sampleDoc = await db.collection("scheduled_posts").findOne({});
    console.log('Sample document structure:', JSON.stringify(sampleDoc, null, 2));

    // Check for documents with different userId formats
    const stringUserIdDocs = await db.collection("scheduled_posts").find({}).toArray();
    
    console.log('\nChecking userId formats:');
    stringUserIdDocs.forEach((doc, index) => {
      console.log(`Document ${index + 1}:`);
      console.log(`  _id: ${doc._id}`);
      console.log(`  userId: ${doc.userId} (type: ${typeof doc.userId})`);
      console.log(`  userEmail: ${doc.userEmail}`);
      console.log(`  content: ${doc.content?.substring(0, 50)}...`);
      console.log(`  status: ${doc.status}`);
      console.log(`  scheduledFor: ${doc.scheduledFor}`);
      console.log('');
    });

    // Test querying with ObjectId
    if (stringUserIdDocs.length > 0) {
      const firstDoc = stringUserIdDocs[0];
      console.log('Testing queries with first document:');
      
      // Try to find with string userId
      const withStringId = await db.collection("scheduled_posts").findOne({ 
        userId: firstDoc.userId 
      });
      console.log(`Query with string userId: ${withStringId ? 'Found' : 'Not found'}`);

      // Try to find with ObjectId userId
      try {
        const withObjectId = await db.collection("scheduled_posts").findOne({ 
          userId: new ObjectId(firstDoc.userId) 
        });
        console.log(`Query with ObjectId userId: ${withObjectId ? 'Found' : 'Not found'}`);
      } catch (error) {
        console.log(`Query with ObjectId userId failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testScheduledPosts().catch(console.error);
