const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteCollections = functions.pubsub
    .schedule("every day 00:00")
    .timeZone("America/Chicago") // Set your desired timezone
    .onRun(async (context) => {
      try {
        const collections = await admin.firestore().listCollections();

        // Delete each collection
        const deletePromises = collections.map((collection) => {
          const deleteQuery = collection.listDocuments().then((documents) => {
            documents.forEach((document) => document.delete());
          });
          return deleteQuery;
        });

        await Promise.all(deletePromises);
        console.log("Collections deleted successfully.");
      } catch (error) {
        console.error("Error deleting collections:", error);
      }
    });
