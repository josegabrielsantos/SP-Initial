import mongoose from 'mongoose';
import Paper from '../models/paper_model.js'
import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
    node: 'https://localhost:9200', // Replace with your Elasticsearch URL
    auth: {
        username: 'elastic',
        password: 'thWfaVtgu8__6Nv80-VQ'
    },
    tls: {
        rejectUnauthorized: false, // This disables certificate verification
    },
});

// export const syncExistingData = async () => {
//     try {
//         const papers = await Paper.find();
//         // console.log(papers)
//     // Sync each paper to Elasticsearch
//         const bulkOps = papers.flatMap((paper) => [
//             { index: { _index: 'papers', _id: paper._id.toString() } }, // Elasticsearch bulk operation format
//             paper
//         ]);

//         // Perform bulk operation
//         const { body } = await esClient.bulk({ refresh: true, body: bulkOps });

//         // Log errors, if any
//         // if (body.errors) {
//         //     const erroredDocuments = body.items.filter((item) => item.index && item.index.error);
//         //     console.error('Some documents failed to index:', erroredDocuments);
//         // } else {
//         //     console.log('All existing data synced successfully to Elasticsearch.');
//         // }
//     } catch (error) {
//         console.error('Error syncing existing data:', error);   
//     }
// }

export const syncExistingData = async () => {
    try {
      // Connect to MongoDB
      if (!mongoose.connection.readyState) {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB.');
      }
  
      // Fetch all documents from the papers collection
      const papers = await Paper.find();
  
      // Prepare data for bulk indexing in Elasticsearch
      const bulkOps = papers.flatMap((paper) => [
        { index: { _index: 'papers', _id: paper._id.toString() } }, // Metadata for bulk operation
        {
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          keywords: paper.keywords,
          publicationDate: paper.publicationDate,
          journal: paper.journal,
          doi: paper.doi,
          createdBy: paper.createdBy,
          creatorType: paper.creatorType,
        }, // Document to index
      ]);
  
      // Perform bulk operation
      const { body } = await esClient.bulk({ refresh: true, body: bulkOps });
  
      // Check for errors
      if (body && body.errors) {
        const erroredDocuments = body.items.filter((item) => item.index && item.index.error);
        if (erroredDocuments.length > 0) {
          console.error('Some documents failed to index:', erroredDocuments);
        }
      } else {
        console.log('All documents synced successfully to Elasticsearch.');
      }
      
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

export const watchMongoChanges = async () => {
  try {
      // Connect to MongoDB if not already connected
      if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.MONGO_URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
          });
      }

      console.log('MongoDB connection established. Watching changes...');

      // Watch the Paper collection for changes
      const changeStream = Paper.watch();

      changeStream.on('change', async (change) => {
          console.log('Change detected:', change);

          const { operationType, documentKey, fullDocument, updateDescription } = change;
          console.log(operationType);
          switch (operationType) {
              case 'insert': {
                  // Add the new document to Elasticsearch
                  const { _id, ...document } = fullDocument;
                  await esClient.index({
                      index: 'papers',
                      id: _id.toString(),
                      document,
                  });
                  console.log(`Document inserted into Elasticsearch: ${_id}`);
                  break;
              }

              case 'update': {
                  // Update the document in Elasticsearch
                  const { updatedFields } = updateDescription;
                  await esClient.update({
                      index: 'papers',
                      id: documentKey._id.toString(),
                      doc: updatedFields,
                  });
                  console.log(`Document updated in Elasticsearch: ${documentKey._id}`);
                  break;
              }

              case 'delete': {
                  // Remove the document from Elasticsearch
                  await esClient.delete({
                      index: 'papers',
                      id: documentKey._id.toString(),
                  });
                  console.log(`Document deleted from Elasticsearch: ${documentKey._id}`);
                  break;
              }

              default:
                  console.log(`Unhandled operation type: ${operationType}`);
          }
      });

      changeStream.on('error', (error) => {
          console.error('Error in ChangeStream:', error);
      });
    } catch (error) {
        console.error('Error setting up watchMongoChanges:', error);
    }
};


esClient.ping({}, (error) => {
    if (error) {
        console.error('Elasticsearch connection failed:', error);
    } else {
        console.log('Elasticsearch connected successfully');
    }
});



export default esClient;
