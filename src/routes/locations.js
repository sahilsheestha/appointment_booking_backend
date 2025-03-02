import express from 'express';
import Location from '../models/Location.js';
import { protect, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create location (admin only)
router.post('/', protect, checkRole(['admin']), async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;