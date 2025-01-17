import mongoose from 'mongoose';
import Paper from '../models/paper_model.js'
import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
    node:'https://73fb2b570d554e96a4d4364d854134e2.us-central1.gcp.cloud.es.io:443', // Replace with your Elasticsearch URL
    auth: {
        apiKey: 'OUxoNWNKUUIxOHU4aU1Oa0dSVnc6Y2h3SkJzWjVSVzJBTk1sU0ZFQU5Ldw=='
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
    const pipeline = [
        { $match: { 'operationType': { $in: ['insert', 'update', 'replace', 'delete'] } } },
    ];

    // Start watching the collection using change streams
    const changeStream = Paper.watch(pipeline);

    changeStream.on('change', async (change) => {
        const { operationType, documentKey, fullDocument } = change;

        switch (operationType) {
            case 'insert':
            case 'update':
            case 'replace':
                // Sync inserted or updated documents to Elasticsearch
                await syncExistingData(fullDocument);
                break;
            case 'delete':
                // Remove deleted documents from Elasticsearch
                await esClient.delete({
                    index: 'papers',
                    id: documentKey._id.toString(),
                });
                console.log('Document deleted from Elasticsearch:', documentKey._id);
                break;
            default:
                console.log('Unsupported operation:', operationType);
                break;
        }
    });

    console.log('Watching MongoDB for changes...');
};


esClient.ping({}, (error) => {
    if (error) {
        console.error('Elasticsearch connection failed:', error);
    } else {
        console.log('Elasticsearch connected successfully');
    }
});



export default esClient;
