import fs from 'fs';

export const fileCleanup = (req, res, next) => {
    res.on('finish', cleanup);
    res.on('close', cleanup);

    function cleanup() {
        res.removeListener('finish', cleanup);
        res.removeListener('close', cleanup);

        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error(`🚨 [Cleanup Error] Falha ao remover arquivo temporário: ${req.file.path}`, err);
            }
        }
    }
    
    next();
};