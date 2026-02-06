// Test script to identify server startup issues
import('./src/index.js').catch(err => {
    console.error('ERROR LOADING SERVER:');
    console.error(err);
    console.error('\nFull stack trace:');
    console.error(err.stack);
    process.exit(1);
});
