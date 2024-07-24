import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Dashboard = () => {
    const [file, setFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const socket = io();

    useEffect(() => {
        socket.on('fileUploaded', (newFile) => {
            setFiles((prevFiles) => [...prevFiles, newFile]);
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/files/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                },
            });
        } catch (error) {
            console.error('File upload failed', error);
        }
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload File</button>
            {progress > 0 && <div>Upload Progress: {progress}%</div>}
            <ul>
                {files.map((file) => (
                    <li key={file._id}>
                        <a href={`/uploads/${file.filename}`} download>{file.filename}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
