import {FastMCP} from 'fastmcp';
import authenticate from './authenticate';

const server = new FastMCP({
  name: 'trip-search-mcp',
  version: '2.0.0',
  authenticate: authenticate
});

export default server;
