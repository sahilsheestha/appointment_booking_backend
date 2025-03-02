import User from '../models/User.js';
import config from '../config/config.js';
import bcrypt from 'bcryptjs';
import { createError } from './errors.js';

export const initializeSuperAdmin = async () => {
  try {
    console.log('🔄 Checking superadmin initialization...');

    // Check if superadmin already exists
    const superadminExists = await User.findOne({ role: 'admin' });
    
    if (superadminExists) {
      console.log('✅ Superadmin already exists');
      console.log('Email:', superadminExists.email);
      return;
    }

    // Validate environment variables
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    console.log('👉 Checking environment variables...');
    console.log('SUPERADMIN_EMAIL configured:', !!superadminEmail);
    console.log('SUPERADMIN_PASSWORD configured:', !!superadminPassword);

    if (!superadminEmail || !superadminPassword) {
      console.error('❌ Missing required environment variables');
      throw createError(
        500,
        'SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in environment variables'
      );
    }

    // Check if email is already in use by another user
    const emailExists = await User.findOne({ email: superadminEmail });
    if (emailExists) {
      console.error('❌ Email already in use');
      throw createError(
        400,
        'Cannot create superadmin: Email is already in use by another user'
      );
    }
    
    // Create superadmin user
    const superadmin = await User.create({
      name: 'Super Admin',
      email: superadminEmail,
      password: superadminPassword,
      role: 'admin',
      active: true
    });

    console.log('✅ Superadmin created successfully');
    console.log('Email:', superadmin.email);
    console.log('⚠️  Please change the password after first login');
    return superadmin;
  } catch (error) {
    console.error('❌ Error creating superadmin:', error.message);
    if (error.code === 11000) {
      console.error('Duplicate key error - email already exists');
    }
    // Don't throw the error to prevent server startup failure
    // but log it for debugging
  }
}; 