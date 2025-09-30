import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  // Set up Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        message: 'Connected to notification stream'
      })
      controller.enqueue(`data: ${data}\n\n`)

      // Keep connection alive with periodic pings
      const pingInterval = setInterval(() => {
        try {
          const ping = JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          })
          controller.enqueue(`data: ${ping}\n\n`)
        } catch (error) {
          clearInterval(pingInterval)
        }
      }, 30000) // Ping every 30 seconds

      // Store the controller for sending notifications
      // In a real app, you'd use a proper event system like Redis or a message queue
      // For now, we'll use a simple approach with MongoDB change streams
      setupNotificationListener(controller, pingInterval)
    },
    cancel() {
      console.log('SSE connection cancelled')
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

async function setupNotificationListener(controller: ReadableStreamDefaultController, pingInterval: NodeJS.Timeout) {
  try {
    const { db } = await connectToDatabase()
    
    // Use MongoDB change streams to watch for new contact form notifications only
    const changeStream = db.collection('notifications').watch([
      {
        $match: {
          'operationType': 'insert',
          'fullDocument.type': 'contact_submission'
        }
      }
    ])

    changeStream.on('change', async (change) => {
      try {
        // Get the full notification document
        const notification = change.fullDocument
        
        if (notification) {
          const data = JSON.stringify({
            type: 'new_notification',
            notification: {
              _id: notification._id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              data: notification.data,
              read: notification.read,
              createdAt: notification.createdAt
            }
          })
          
          controller.enqueue(`data: ${data}\n\n`)
        }
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    })

    changeStream.on('error', (error) => {
      console.error('Change stream error:', error)
      clearInterval(pingInterval)
    })

    changeStream.on('close', () => {
      console.log('Change stream closed')
      clearInterval(pingInterval)
    })

  } catch (error) {
    console.error('Error setting up notification listener:', error)
    clearInterval(pingInterval)
  }
}
