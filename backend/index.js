import app from './src/app.js';
import { config } from './src/config/env.js';
import { connectDatabase } from './src/config/database.js';

await connectDatabase();

app.listen(config.server.port, () => {
    console.log(`CategorIA Backend rodando na porta ${config.server.port}`);
});