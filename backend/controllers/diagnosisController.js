const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.analyzeCrop = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const imagePath = req.file.path;
  
  // Path to predict.py
  const scriptPath = path.resolve(__dirname, '../../ai_models/crop_disease/src/predict.py');
  const pythonExecutable = 'python';
  const scriptDir = path.resolve(__dirname, '../../ai_models/crop_disease/src');

  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--image', imagePath], { cwd: scriptDir });

  let dataString = '';
  let errorString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
  });

  pythonProcess.on('close', (code) => {
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    try {
      const jsonStrMatch = dataString.match(/\{[\s\S]*\}/);
      if (jsonStrMatch) {
          const result = JSON.parse(jsonStrMatch[0]);
          if (result.error) {
              return res.status(500).json({ message: result.message });
          }
          return res.status(200).json(result);
      } else {
          console.error("Python stderr:", errorString);
          console.error("Python stdout:", dataString);
          return res.status(500).json({ message: 'Invalid response from AI model' });
      }
    } catch (e) {
      console.error("Error parsing Python output:", e);
      return res.status(500).json({ message: 'Failed to process image' });
    }
  });
};
