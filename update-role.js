import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/quality_education')
  .then(async () => {
    const db = mongoose.connection.db;
    await db.collection('users').updateOne(
      { email: 'student@example.com' },
      { $set: { role: 'user' } }
    );
    console.log('Updated role');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
