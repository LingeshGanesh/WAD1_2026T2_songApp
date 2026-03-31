const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/users-model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

async function seedUsers() {
    await mongoose.connect(process.env.DB);
    console.log('Connected to:', process.env.DB);

    const password = await bcrypt.hash('Password1!', 10);

    const alice = await User.createUser({
        username: 'alice',
        email: 'alice@test.com',
        password,
        profilePicture: '/image/profilepic1.jpg'
    });

    const bob = await User.createUser({
        username: 'bob',
        email: 'bob@test.com',
        password,
        profilePicture: '/image/profilepic2.jpg'
    });

    const carol = await User.createUser({
        username: 'carol',
        email: 'carol@test.com',
        password,
        profilePicture: '/image/profilepic3.jpg'
    });

    const david = await User.createUser({
        username: 'david',
        email: 'david@test.com',
        password,
        profilePicture: '/image/profilepic4.jpg'
    });

    const eva = await User.createUser({
        username: 'eva',
        email: 'eva@test.com',
        password,
        profilePicture: '/image/profilepic5.jpg'
    });

    const frank = await User.createUser({
        username: 'frank',
        email: 'frank@test.com',
        password,
        profilePicture: '/image/profilepic1.jpg'
    });

    await User.followUser(alice._id, eva._id);
    await User.followUser(alice._id, carol._id);

    await User.followUser(bob._id, david._id);
    await User.followUser(bob._id, eva._id);

    await User.followUser(carol._id, david._id);
    await User.followUser(carol._id, frank._id);

    console.log('Seeded users successfully');
    await mongoose.disconnect();
}

seedUsers().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
