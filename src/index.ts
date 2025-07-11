import dotenv from 'dotenv';
dotenv.config();
import server from './services/mcpServer';
import './services/flightSearch';
import './services/trainSearch';

async function startServer() {
  await server.start({
    transportType: 'httpStream',
    httpStream: {port: 3000}
  });
  console.log(`Server is running at http://localhost:3000`);
}

startServer();
