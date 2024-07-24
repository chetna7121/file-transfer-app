const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const jwt = require('jsonwebtoken');

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Not authorized' });
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Not authorized' });
    }
};

module.exports = (io) => {
    router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
        try {
            const file = new File({
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                user: req.user,
            });
            await file.save();
            io.emit('fileUploaded', file);
            res.status(201).json({ message: 'File uploaded successfully' });
        } catch (error) {
            res.status(500).json({ error: 'File upload failed' });
        }
    });

    return router;
};
