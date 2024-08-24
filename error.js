module.exports = () => {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('[ANTI-CRASH] unhandledRejection');
        console.log(promise, reason);
    });
    
    process.on('uncaughtException', (err, origin) => {
        console.error('[ANTI-CRASH] uncaughtException');
        console.log(err, origin);
    });
    
    process.on('uncaughtExceptionMonitor', (err, origin) => {
        console.error('[ANTI-CRASH] uncaughtExceptionMonitor');
        console.log(err, origin);
    });
};