import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDatabase } from './src/config/database.js';

await connectDatabase();

app.listen(env.PORT, () => {
    console.log(`CategorIA Backend rodando na porta ${env.PORT}`);
});