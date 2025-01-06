import { Client } from '@elastic/elasticsearch';

const client = new Client({
    node: 'https://localhost:9200', // Replace with your Elasticsearch URL
    auth: {
        username: 'elastic' || '', // Optional, if Elasticsearch is secured
        password: 'sMO2mdDoXnM7u0lH8lTJ' || '', // Optional, if Elasticsearch is secured
    },
    tls: {
        rejectUnauthorized: false, // This disables certificate verification
    },
});

client.ping({}, (error) => {
    if (error) {
        console.error('Elasticsearch connection failed:', error);
    } else {
        console.log('Elasticsearch connected successfully');
    }
});

export default client;
